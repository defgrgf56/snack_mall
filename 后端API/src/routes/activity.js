// routes/activity.js - 活动专区路由
const express = require('express');
const router = express.Router();
const { Activity, Product, ActivityProduct } = require('../models');
const { Op } = require('sequelize');

/**
 * 获取活动列表
 * GET /api/activities
 */
router.get('/', async (req, res) => {
  try {
    const { type, status = 1, page = 1, pageSize = 10 } = req.query;
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const now = new Date();
    
    // 构建查询条件
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = parseInt(status);
    }
    
    // 如果查询进行中的活动，添加时间条件
    if (status == 1) {
      where.start_time = { [Op.lte]: now };
      where.end_time = { [Op.gte]: now };
    }
    
    const { count, rows } = await Activity.findAndCountAll({
      where,
      order: [['sort', 'DESC'], ['created_at', 'DESC']],
      offset,
      limit
    });
    
    // 计算剩余时间
    const activities = rows.map(item => {
      const data = item.toJSON();
      
      if (data.status === 1) {
        data.remaining_time = Math.max(0, Math.floor((new Date(data.end_time) - now) / 1000));
      } else if (data.status === 2) {
        data.remaining_time = Math.max(0, Math.floor((new Date(data.start_time) - now) / 1000));
      } else {
        data.remaining_time = 0;
      }
      
      return data;
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: activities,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 获取活动详情
 * GET /api/activities/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Activity.findByPk(id, {
      include: [{
        model: Product,
        as: 'products',
        through: {
          attributes: ['discount', 'special_price', 'sort']
        },
        attributes: ['id', 'name', 'cover', 'description', 'price', 'stock', 'sales']
      }]
    });
    
    if (!activity) {
      return res.status(404).json({
        code: 404,
        message: '活动不存在'
      });
    }
    
    const data = activity.toJSON();
    const now = new Date();
    
    // 计算剩余时间
    if (data.status === 1) {
      data.remaining_time = Math.max(0, Math.floor((new Date(data.end_time) - now) / 1000));
    } else if (data.status === 2) {
      data.remaining_time = Math.max(0, Math.floor((new Date(data.start_time) - now) / 1000));
    } else {
      data.remaining_time = 0;
    }
    
    // 处理商品列表
    if (data.products) {
      data.products = data.products.map(product => {
        const p = { ...product };
        // 计算活动价格
        if (p.ActivityProduct) {
          if (p.ActivityProduct.special_price) {
            p.activity_price = p.ActivityProduct.special_price;
          } else if (p.ActivityProduct.discount) {
            p.activity_price = (p.price * p.ActivityProduct.discount / 10).toFixed(2);
          }
        }
        return p;
      });
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data
    });
  } catch (error) {
    console.error('获取活动详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 获取活动商品列表
 * GET /api/activities/:id/products
 */
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    
    const activity = await Activity.findByPk(id);
    
    if (!activity) {
      return res.status(404).json({
        code: 404,
        message: '活动不存在'
      });
    }
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const { count, rows } = await ActivityProduct.findAndCountAll({
      where: { activity_id: id },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'description', 'price', 'stock', 'sales']
      }],
      order: [['sort', 'DESC']],
      offset,
      limit
    });
    
    // 处理商品数据
    const products = rows.map(item => {
      const product = item.product ? item.product.toJSON() : {};
      
      // 添加活动价格
      if (item.special_price) {
        product.activity_price = item.special_price;
      } else if (item.discount) {
        product.activity_price = (product.price * item.discount / 10).toFixed(2);
      }
      
      product.discount = item.discount;
      
      return product;
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: products,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取活动商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
