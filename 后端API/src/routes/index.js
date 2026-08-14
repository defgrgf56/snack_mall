// src/routes/index.js - 路由入口
const express = require('express')
const router = express.Router()

// 导入子路由
const authRoutes = require('./auth')
const productRoutes = require('./product')
const cartRoutes = require('./cart')
const orderRoutes = require('./order')
const userRoutes = require('./user')
const addressRoutes = require('./address')
const couponRoutes = require('./coupon')
const bannerRoutes = require('./banner')
const categoryRoutes = require('./category')
const adminRoutes = require('./admin')

// 注册路由
router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)
router.use('/user', userRoutes)
router.use('/addresses', addressRoutes)
router.use('/coupons', couponRoutes)
router.use('/banners', bannerRoutes)
router.use('/categories', categoryRoutes)
router.use('/admin', adminRoutes)

// 根路由
router.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  })
})

module.exports = router
