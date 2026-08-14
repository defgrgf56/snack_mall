// src/routes/auth.js - 认证路由
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../models');

/**
 * 微信小程序登录
 * POST /api/auth/login
 * Body: { code: string }
 */
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.json({
        code: 400,
        message: '缺少code参数',
        data: null
      });
    }
    
    // 开发环境：如果没有配置微信AppID，使用测试模式
    if (!process.env.WX_APPID || process.env.WX_APPID === 'your_appid_here') {
      console.log('⚠️  开发模式：使用测试账号登录');
      
      // 创建或获取测试用户
      let user = await User.findOne({ where: { phone: '13800138000' } });
      
      if (!user) {
        user = await User.create({
          openid: 'test_openid_' + Date.now(),
          nickname: '测试用户',
          phone: '13800138000',
          status: 1
        });
      }
      
      // 生成 JWT token
      const token = jwt.sign(
        { userId: user.id, openid: user.openid },
        process.env.JWT_SECRET || 'default_secret_key_for_development',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      return res.json({
        code: 200,
        message: '登录成功（开发模式）',
        data: {
          token,
          userInfo: {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg',
            phone: user.phone,
            level: user.level,
            points: user.points
          }
        }
      });
    }
    
    // 生产环境：调用微信接口获取 openid 和 session_key
    const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WX_APPID,
        secret: process.env.WX_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    const { openid, session_key, unionid, errcode, errmsg } = wxResponse.data;
    
    if (errcode) {
      return res.json({
        code: 500,
        message: `微信登录失败: ${errmsg}`,
        data: null
      });
    }
    
    // 查找或创建用户
    let user = await User.findOne({ where: { openid } });
    
    if (!user) {
      // 新用户，创建账号
      user = await User.create({
        openid,
        unionid: unionid || null,
        nickname: `用户${openid.substr(-6)}`,
        status: 1
      });
    }
    
    // 更新最后登录时间
    await user.update({
      last_login_at: new Date()
    });
    
    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          level: user.level,
          points: user.points
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.json({
      code: 500,
      message: '登录失败',
      data: null
    });
  }
});

/**
 * 开发环境快速登录（无需微信 AppID）
 * POST /api/auth/dev-login
 */
router.post('/dev-login', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.json({
        code: 403,
        message: '仅开发环境可用',
        data: null
      });
    }

    const openid = 'dev_user_local';
    let user = await User.findOne({ where: { openid } });

    if (!user) {
      user = await User.create({
        openid,
        nickname: '本地测试用户',
        avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
        status: 1
      });
    }

    await user.update({ last_login_at: new Date() });

    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      code: 200,
      message: '开发登录成功',
      data: {
        token,
        userInfo: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          level: user.level,
          points: user.points
        }
      }
    });
  } catch (error) {
    console.error('开发登录失败:', error);
    res.json({
      code: 500,
      message: '开发登录失败',
      data: null
    });
  }
});

/**
 * 更新用户信息
 * POST /api/auth/update-profile
 * Body: { nickname, avatar, gender }
 */
router.post('/update-profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.json({
        code: 401,
        message: '未登录',
        data: null
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    const { nickname, avatar, gender } = req.body;
    
    await user.update({
      nickname: nickname || user.nickname,
      avatar: avatar || user.avatar,
      gender: gender !== undefined ? gender : user.gender
    });
    
    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender
      }
    });
  } catch (error) {
    console.error('更新失败:', error);
    res.json({
      code: 500,
      message: '更新失败',
      data: null
    });
  }
});

module.exports = router;
