// src/routes/category.js - 分类路由
const express = require('express')
const router = express.Router()
const { Category } = require('../models')

// 获取分类列表
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort', 'ASC']]
    })
    res.json({ code: 200, message: 'success', data: categories })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.json({ code: 500, message: '获取失败', data: [] })
  }
})

module.exports = router

