// src/routes/coupon.js - 优惠券路由
const express = require('express');
const router = express.Router();
const { Coupon, UserCoupon } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * 获取可用优惠券列表
 * GET /api/coupons/available
 */
router.get('/available', async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: { 
        status: 1  // 启用状态
      },
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    res.json({ 
      code: 200, 
      message: 'success', 
      data: coupons 
    });
  } catch (error) {
    console.error('获取可用优惠券失败:', error);
    res.json({ 
      code: 200, 
      message: 'success', 
      data: [] 
    });
  }
});

/**
 * 领取优惠券
 * POST /api/coupons/receive
 * Body: { coupon_id }
 */
router.post('/receive', authenticateToken, async (req, res) => {
  try {
    const { coupon_id } = req.body;
    
    if (!coupon_id) {
      return res.json({
        code: 400,
        message: '请选择优惠券',
        data: null
      });
    }
    
    // 查询优惠券
    const coupon = await Coupon.findByPk(coupon_id);
    
    if (!coupon || coupon.status !== 1) {
      return res.json({
        code: 404,
        message: '优惠券不存在或已下架',
        data: null
      });
    }
    
    // 检查是否已领取
    const received = await UserCoupon.count({
      where: {
        user_id: req.userId,
        coupon_id
      }
    });
    
    if (received >= coupon.per_limit) {
      return res.json({
        code: 400,
        message: '已达到领取上限',
        data: null
      });
    }
    
    // 检查库存
    if (coupon.total_count > 0 && coupon.receive_count >= coupon.total_count) {
      return res.json({
        code: 400,
        message: '优惠券已领完',
        data: null
      });
    }
    
    // 领取优惠券
    const expireTime = new Date(coupon.end_time);
    
    await UserCoupon.create({
      user_id: req.userId,
      coupon_id,
      status: 0,  // 未使用
      receive_time: new Date(),
      expire_time: expireTime
    });
    
    // 更新领取数量
    await coupon.increment('receive_count', { by: 1 });
    
    res.json({
      code: 200,
      message: '领取成功',
      data: null
    });
  } catch (error) {
    console.error('领取优惠券失败:', error);
    res.json({
      code: 500,
      message: '领取失败',
      data: null
    });
  }
});

/**
 * 获取我的优惠券列表
 * GET /api/coupons/my
 * Query: status (0:未使用 1:已使用 2:已过期)
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { user_id: req.userId };
    
    // 如果指定了状态，添加状态过滤
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }
    
    const userCoupons = await UserCoupon.findAll({
      where,
      include: [{
        model: Coupon,
        as: 'coupon',
        attributes: [
          'id', 'name', 'type', 'discount_type', 
          'discount_value', 'min_amount', 'start_time', 'end_time'
        ]
      }],
      order: [
        ['status', 'ASC'],  // 未使用的排前面
        ['expire_time', 'DESC']  // 按过期时间倒序
      ]
    });
    
    // 格式化数据
    const formattedCoupons = userCoupons.map(uc => {
      const couponData = uc.coupon ? uc.coupon.toJSON() : null;
      return {
        id: uc.id,
        user_id: uc.user_id,
        coupon_id: uc.coupon_id,
        status: uc.status,
        receive_time: uc.receive_time,
        use_time: uc.use_time,
        expire_time: uc.expire_time,
        coupon: couponData
      };
    });
    
    res.json({
      code: 200,
      message: 'success',
      data: formattedCoupons
    });
  } catch (error) {
    console.error('获取我的优惠券失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

module.exports = router;
