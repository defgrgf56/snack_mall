// src/routes/user.js - 用户路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { User } = require('../models');

/**
 * 获取用户信息
 * GET /api/user/info
 * 需要登录
 */
router.get('/info', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // TODO: 查询用户的优惠券数量
    const couponCount = 0;
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        level: user.level,
        points: user.points,
        is_vip: user.level >= 2,
        coupon_count: couponCount
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.json({
      code: 500,
      message: '获取用户信息失败',
      data: null
    });
  }
});

/**
 * 更新用户手机号
 * PUT /api/user/phone
 * 需要登录
 */
router.put('/phone', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.json({
        code: 400,
        message: '手机号不能为空',
        data: null
      });
    }
    
    // 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      return res.json({
        code: 400,
        message: '手机号格式不正确',
        data: null
      });
    }
    
    // 检查手机号是否已被使用
    const existUser = await User.findOne({
      where: {
        phone,
        id: { [require('sequelize').Op.ne]: req.userId }
      }
    });
    
    if (existUser) {
      return res.json({
        code: 400,
        message: '该手机号已被使用',
        data: null
      });
    }
    
    // 更新手机号
    await req.user.update({ phone });
    
    res.json({
      code: 200,
      message: '手机号更新成功',
      data: {
        phone: req.user.phone
      }
    });
  } catch (error) {
    console.error('更新手机号失败:', error);
    res.json({
      code: 500,
      message: '更新手机号失败',
      data: null
    });
  }
});

/**
 * 获取用户积分记录
 * GET /api/user/points
 * 需要登录
 */
router.get('/points', authenticateToken, async (req, res) => {
  try {
    // TODO: 实现积分记录查询
    res.json({
      code: 200,
      message: 'success',
      data: {
        total: req.user.points,
        list: []
      }
    });
  } catch (error) {
    console.error('获取积分记录失败:', error);
    res.json({
      code: 500,
      message: '获取积分记录失败',
      data: null
    });
  }
});

module.exports = router;
