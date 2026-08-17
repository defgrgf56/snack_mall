// src/routes/upload.js - 文件上传路由
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

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
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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
 * 单文件上传
 * POST /api/upload
 * Content-Type: multipart/form-data
 * Field: file
 */
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 400,
        message: '请选择要上传的文件',
        data: null
      });
    }
    
    // 构建文件URL（根据实际部署调整域名）
    const dateDir = new Date().toISOString().slice(0, 7).replace('-', '');
    const fileUrl = `/uploads/${dateDir}/${req.file.filename}`;
    
    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
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
router.post('/multiple', authenticateToken, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.json({
        code: 400,
        message: '请选择要上传的文件',
        data: null
      });
    }
    
    const dateDir = new Date().toISOString().slice(0, 7).replace('-', '');
    const uploadedFiles = req.files.map(file => ({
      url: `/uploads/${dateDir}/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({
      code: 200,
      message: `成功上传 ${req.files.length} 个文件`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('批量上传失败:', error);
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
router.delete('/', authenticateToken, (req, res) => {
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
