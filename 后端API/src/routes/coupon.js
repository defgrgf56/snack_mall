// src/routes/coupon.js - 优惠券路由
const express = require('express')
const router = express.Router()
const { Coupon } = require('../models')

// 获取可用优惠券
router.get('/available', async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: { status: 1 },
      limit: 10
    })
    res.json({ code: 200, message: 'success', data: coupons })
  } catch (error) {
    res.json({ code: 200, message: 'success', data: [] })
  }
})

module.exports = router
