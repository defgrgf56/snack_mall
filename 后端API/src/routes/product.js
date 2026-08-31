// src/routes/product.js - 商品路由
const express = require('express')
const router = express.Router()
const { Product } = require('../models')

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const { 
      category_id, 
      is_hot, 
      is_new, 
      keyword, 
      page = 1, 
      limit = 20,
      sort_by = 'default' // 排序方式：default-默认, price_asc-价格升序, price_desc-价格降序, sales-销量, rating-好评
    } = req.query
    
    const { sequelize } = require('../models')
    const { Op } = require('sequelize')
    
    // 构建WHERE条件
    let whereConditions = ['p.status = 1']
    let replacements = []
    
    if (category_id) {
      whereConditions.push('p.category_id = ?')
      replacements.push(category_id)
    }
    if (is_hot) {
      whereConditions.push('p.is_hot = 1')
    }
    if (is_new) {
      whereConditions.push('p.is_new = 1')
    }
    if (keyword) {
      whereConditions.push('p.name LIKE ?')
      replacements.push(`%${keyword}%`)
    }
    
    const whereClause = whereConditions.join(' AND ')
    
    // 根据排序方式设置排序规则
    let orderClause = 'ORDER BY p.sort DESC, p.created_at DESC'
    
    switch (sort_by) {
      case 'price_asc':
        orderClause = 'ORDER BY actual_price ASC'
        break
      case 'price_desc':
        orderClause = 'ORDER BY actual_price DESC'
        break
      case 'sales':
        orderClause = 'ORDER BY p.sales DESC'
        break
      case 'rating':
        orderClause = 'ORDER BY p.rating DESC'
        break
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit)
    replacements.push(parseInt(limit), offset)
    
    // 使用原生SQL查询，关联活动价格
    const products = await sequelize.query(`
      SELECT 
        p.*,
        COALESCE(
          MIN(
            CASE 
              WHEN ap.special_price IS NOT NULL THEN ap.special_price
              WHEN ap.discount IS NOT NULL THEN ROUND(p.price * ap.discount / 10, 2)
              ELSE NULL
            END
          ),
          p.price
        ) as actual_price,
        CASE 
          WHEN MIN(ap.activity_id) IS NOT NULL THEN 1
          ELSE 0
        END as has_activity
      FROM products p
      LEFT JOIN activity_products ap ON (
        ap.product_id = p.id
        AND ap.activity_id IN (
          SELECT id FROM activities 
          WHERE status = 1 
          AND NOW() BETWEEN start_time AND end_time
        )
      )
      WHERE ${whereClause}
      GROUP BY p.id
      ${orderClause}
      LIMIT ? OFFSET ?
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    })
    
    // 转换价格字段
    const formattedProducts = products.map(p => ({
      ...p,
      price: parseFloat(p.price),
      actual_price: parseFloat(p.actual_price),
      has_activity: p.has_activity === 1
    }))
    
    res.json({
      code: 200,
      message: 'success',
      data: { items: formattedProducts, total: formattedProducts.length }
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.json({ code: 500, message: '获取失败', data: { items: [], total: 0 } })
  }
})

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const { sequelize } = require('../models')
    
    // 使用原生SQL查询，关联活动价格
    const products = await sequelize.query(`
      SELECT 
        p.*,
        COALESCE(
          MIN(
            CASE 
              WHEN ap.special_price IS NOT NULL THEN ap.special_price
              WHEN ap.discount IS NOT NULL THEN ROUND(p.price * ap.discount / 10, 2)
              ELSE NULL
            END
          ),
          p.price
        ) as actual_price,
        CASE 
          WHEN MIN(ap.activity_id) IS NOT NULL THEN 1
          ELSE 0
        END as has_activity
      FROM products p
      LEFT JOIN activity_products ap ON (
        ap.product_id = p.id
        AND ap.activity_id IN (
          SELECT id FROM activities 
          WHERE status = 1 
          AND NOW() BETWEEN start_time AND end_time
        )
      )
      WHERE p.id = ?
      GROUP BY p.id
    `, {
      replacements: [req.params.id],
      type: sequelize.QueryTypes.SELECT
    })
    
    if (products.length > 0) {
      const product = products[0]
      // 转换价格字段为数字
      product.price = parseFloat(product.price)
      product.actual_price = parseFloat(product.actual_price)
      product.has_activity = product.has_activity === 1
      
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
