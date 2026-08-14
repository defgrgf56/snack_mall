// src/routes/product.js - 商品路由
const express = require('express')
const router = express.Router()
const { Product } = require('../models')

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { category_id, is_hot, is_new, keyword, page = 1, limit = 20 } = req.query
    const where = { status: 1 }
    
    if (category_id) {
      where.category_id = category_id
    }
    if (is_hot) {
      where.is_hot = 1
    }
    if (is_new) {
      where.is_new = 1
    }
    if (keyword) {
      const { Op } = require('sequelize')
      where.name = { [Op.like]: `%${keyword}%` }
    }
    
    const products = await Product.findAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['sort', 'DESC'], ['created_at', 'DESC']]
    })
    
    res.json({
      code: 200,
      message: 'success',
      data: { items: products, total: products.length }
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.json({ code: 500, message: '获取失败', data: { items: [], total: 0 } })
  }
})

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (product) {
      res.json({ code: 200, message: 'success', data: product })
    } else {
      res.json({ code: 404, message: '商品不存在', data: null })
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    res.json({ code: 500, message: '服务器错误', data: null })
  }
})

module.exports = router
