// src/middleware/auth.js - JWT认证中间件
const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');

/**
 * JWT验证中间件
 * 用于保护需要登录的API接口
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.json({
        code: 401,
        message: '未登录',
        data: null
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.json({
        code: 401,
        message: '用户不存在',
        data: null
      });
    }
    
    if (user.status !== 1) {
      return res.json({
        code: 403,
        message: '账号已被禁用',
        data: null
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.json({
        code: 401,
        message: 'Token无效',
        data: null
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.json({
        code: 401,
        message: 'Token已过期，请重新登录',
        data: null
      });
    }
    
    console.error('Token验证失败:', error);
    return res.json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
}

/**
 * 管理员JWT验证中间件
 * 用于保护管理员API接口
 */
async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.json({
        code: 401,
        message: '未登录'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找管理员
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin) {
      return res.json({
        code: 401,
        message: '管理员不存在'
      });
    }
    
    if (admin.status !== 1) {
      return res.json({
        code: 403,
        message: '账号已被禁用'
      });
    }
    
    // 将管理员信息添加到请求对象
    req.admin = admin;
    req.adminId = admin.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.json({
        code: 401,
        message: 'Token无效'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.json({
        code: 401,
        message: 'Token已过期，请重新登录'
      });
    }
    
    console.error('管理员Token验证失败:', error);
    return res.json({
      code: 500,
      message: '服务器错误'
    });
  }
}

/**
 * 可选的Token验证中间件
 * 如果有token则验证，没有token则跳过
 * 用于既可登录又可游客访问的接口
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.status === 1) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败不影响继续执行
    next();
  }
}

module.exports = {
  authenticateToken,
  adminAuth,
  optionalAuth
};
