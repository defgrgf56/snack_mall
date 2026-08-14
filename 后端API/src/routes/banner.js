// src/routes/banner.js - 轮播图路由
const express = require('express')
const router = express.Router()
const { Banner } = require('../models')

// 获取轮播图列表
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']],
      limit: 10
    })
    res.json({ code: 200, message: 'success', data: banners })
  } catch (error) {
    console.error('获取轮播图失败:', error)
    res.json({ code: 500, message: '获取失败', data: [] })
  }
})

module.exports = router

