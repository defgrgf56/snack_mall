// src/routes/upload.js - 文件上传路由
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { authenticateToken, adminAuth } = require('../middleware/auth');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 按日期分目录存储
    const dateDir = new Date().toISOString().slice(0, 7).replace('-', ''); // YYYYMM
    const fullPath = path.join(uploadDir, dateDir);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // 使用 MD5 哈希生成安全的文件名
    const hash = crypto.createHash('md5')
      .update(file.originalname + Date.now() + Math.random().toString())
      .digest('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${hash}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只支持图片格式文件 (jpeg, jpg, png, gif, webp)'));
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024  // 限制 5MB
  },
  fileFilter: fileFilter
});

/**
 * 图片压缩处理
 * @param {string} filePath - 原始文件路径
 * @returns {Promise<Object>} 压缩后的文件信息
 */
async function compressImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const compressedPath = filePath.replace(/(\.\w+)$/, '_compressed$1');
    
    // 读取图片元数据
    const metadata = await sharp(filePath).metadata();
    
    // 根据图片格式选择压缩策略
    let pipeline = sharp(filePath);
    
    // 如果图片尺寸过大，进行缩放（保持宽高比）
    if (metadata.width > 1920 || metadata.height > 1920) {
      pipeline = pipeline.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 根据格式进行压缩
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        pipeline = pipeline.jpeg({ quality: 85, progressive: true });
        break;
      case '.png':
        pipeline = pipeline.png({ compressionLevel: 9, progressive: true });
        break;
      case '.webp':
        pipeline = pipeline.webp({ quality: 85 });
        break;
      default:
        // GIF 等格式保持原样
        return {
          path: filePath,
          compressed: false,
          originalSize: metadata.size
        };
    }
    
    // 保存压缩后的图片
    await pipeline.toFile(compressedPath);
    
    // 获取压缩后的文件信息
    const compressedStats = fs.statSync(compressedPath);
    const originalStats = fs.statSync(filePath);
    
    // 如果压缩后更大，使用原图
    if (compressedStats.size >= originalStats.size) {
      fs.unlinkSync(compressedPath);
      return {
        path: filePath,
        compressed: false,
        originalSize: originalStats.size
      };
    }
    
    // 删除原图，使用压缩后的图片
    fs.unlinkSync(filePath);
    fs.renameSync(compressedPath, filePath);
    
    return {
      path: filePath,
      compressed: true,
      originalSize: originalStats.size,
      compressedSize: compressedStats.size,
      compressionRatio: ((1 - compressedStats.size / originalStats.size) * 100).toFixed(2) + '%'
    };
  } catch (error) {
    console.error('图片压缩失败:', error);
    // 压缩失败时返回原图
    return {
      path: filePath,
      compressed: false,
      error: error.message
    };
  }
}

/**
 * 验证图片内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} 是否为有效图片
 */
async function validateImageContent(filePath) {
  try {
    // 使用 sharp 读取图片元数据来验证是否为真实图片
    const metadata = await sharp(filePath).metadata();
    
    // 检查是否有有效的图片格式
    if (!metadata.format || !metadata.width || !metadata.height) {
      return false;
    }
    
    // 检查图片尺寸是否合理（避免过小或过大的异常图片）
    if (metadata.width < 1 || metadata.height < 1 || 
        metadata.width > 10000 || metadata.height > 10000) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('图片内容验证失败:', error);
    return false;
  }
}

/**
 * 认证中间件 - 支持用户和管理员
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.json({
      code: 401,
      message: '未登录',
      data: null
    });
  }
  
  // 先尝试管理员认证
  try {
    await adminAuth(req, res, next);
  } catch (error) {
    // 如果管理员认证失败，尝试用户认证
    await authenticateToken(req, res, next);
  }
}

/**
 * 单文件上传
 * POST /api/upload
 * Content-Type: multipart/form-data
 * Field: file
 */
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 400,
        message: '请选择要上传的文件',
        data: null
      });
    }
    
    const filePath = req.file.path;
    
    // 验证图片内容
    const isValidImage = await validateImageContent(filePath);
    if (!isValidImage) {
      // 删除无效文件
      fs.unlinkSync(filePath);
      return res.json({
        code: 400,
        message: '文件内容不是有效的图片',
        data: null
      });
    }
    
    // 压缩图片
    const compressionResult = await compressImage(filePath);
    
    // 构建文件URL
    const dateDir = new Date().toISOString().slice(0, 7).replace('-', '');
    const fileUrl = `/uploads/${dateDir}/${req.file.filename}`;
    
    // 获取最终文件信息
    const finalStats = fs.statSync(compressionResult.path);
    
    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: finalStats.size,
        originalSize: req.file.size,
        mimetype: req.file.mimetype,
        compressed: compressionResult.compressed,
        compressionRatio: compressionResult.compressionRatio || '0%'
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    // 清理文件
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.json({
      code: 500,
      message: '上传失败',
      data: null
    });
  }
});

/**
 * 多文件上传
 * POST /api/upload/multiple
 * Content-Type: multipart/form-data
 * Field: files (可以选择多个文件)
 */
router.post('/multiple', authMiddleware, upload.array('files', 10), async (req, res) => {
  const uploadedFiles = [];
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({
        code: 400,
        message: '请选择要上传的文件',
        data: null
      });
    }
    
    const dateDir = new Date().toISOString().slice(0, 7).replace('-', '');
    
    // 处理每个文件
    for (const file of req.files) {
      try {
        // 验证图片内容
        const isValidImage = await validateImageContent(file.path);
        if (!isValidImage) {
          fs.unlinkSync(file.path);
          continue;
        }
        
        // 压缩图片
        const compressionResult = await compressImage(file.path);
        const finalStats = fs.statSync(compressionResult.path);
        
        uploadedFiles.push({
          url: `/uploads/${dateDir}/${file.filename}`,
          filename: file.filename,
          originalname: file.originalname,
          size: finalStats.size,
          originalSize: file.size,
          mimetype: file.mimetype,
          compressed: compressionResult.compressed,
          compressionRatio: compressionResult.compressionRatio || '0%'
        });
      } catch (fileError) {
        console.error(`处理文件 ${file.originalname} 失败:`, fileError);
        // 清理失败的文件
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    res.json({
      code: 200,
      message: `成功上传 ${uploadedFiles.length} 个文件`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('批量上传失败:', error);
    // 清理所有已上传的文件
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.json({
      code: 500,
      message: '上传失败',
      data: null
    });
  }
});

/**
 * 删除文件
 * DELETE /api/upload
 * Body: { url }
 */
router.delete('/', authMiddleware, (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.json({
        code: 400,
        message: '请提供文件URL',
        data: null
      });
    }
    
    // 解析文件路径
    const filePath = path.join(__dirname, '../..', url);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.json({
        code: 404,
        message: '文件不存在',
        data: null
      });
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.json({
      code: 500,
      message: '删除失败',
      data: null
    });
  }
});

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.json({
        code: 400,
        message: '文件大小不能超过 5MB',
        data: null
      });
    }
    return res.json({
      code: 400,
      message: error.message,
      data: null
    });
  }
  
  if (error) {
    return res.json({
      code: 400,
      message: error.message,
      data: null
    });
  }
  
  next();
});

module.exports = router;
