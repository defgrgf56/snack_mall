// routes/seckill.js - 秒杀活动路由
const express = require('express');
const router = express.Router();
const { Seckill, Product } = require('../models');
const { Op } = require('sequelize');

/**
 * 获取秒杀活动列表
 * GET /api/seckills
 */
router.get('/', async (req, res) => {
  try {
    const { status = 1, page = 1, pageSize = 10 } = req.query;
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const now = new Date();
    
    // 构建查询条件
    const where = {};
    
    if (status) {
      where.status = parseInt(status);
    }
    
    // 如果查询进行中的秒杀，添加时间条件
    if (status == 1) {
      where.start_time = { [Op.lte]: now };
      where.end_time = { [Op.gte]: now };
    }
    
    const { count, rows } = await Seckill.findAndCountAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'price', 'stock', 'sales']
      }],
      order: [['sort', 'DESC'], ['created_at', 'DESC']],
      offset,
      limit
    });
    
    // 计算剩余时间和进度
    const seckills = rows.map(item => {
      const data = item.toJSON();
      
      // 计算剩余时间（秒）
      if (data.status === 1) {
        data.remaining_time = Math.max(0, Math.floor((new Date(data.end_time) - now) / 1000));
      } else if (data.status === 2) {
        data.remaining_time = Math.max(0, Math.floor((new Date(data.start_time) - now) / 1000));
      } else {
        data.remaining_time = 0;
      }
      
      // 计算进度百分比
      data.progress = data.stock > 0 ? Math.floor((data.sold / (data.stock + data.sold)) * 100) : 100;
      
      // 计算折扣
      if (data.original_price > 0) {
        data.discount = Math.floor((data.seckill_price / data.original_price) * 10);
      }
      
      return data;
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: seckills,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取秒杀列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 获取秒杀详情
 * GET /api/seckills/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const seckill = await Seckill.findByPk(id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'description', 'price', 'stock', 'sales']
      }]
    });
    
    if (!seckill) {
      return res.status(404).json({
        code: 404,
        message: '秒杀活动不存在'
      });
    }
    
    const data = seckill.toJSON();
    const now = new Date();
    
    // 计算剩余时间
    if (data.status === 1) {
      data.remaining_time = Math.max(0, Math.floor((new Date(data.end_time) - now) / 1000));
    } else if (data.status === 2) {
      data.remaining_time = Math.max(0, Math.floor((new Date(data.start_time) - now) / 1000));
    } else {
      data.remaining_time = 0;
    }
    
    // 计算进度
    data.progress = data.stock > 0 ? Math.floor((data.sold / (data.stock + data.sold)) * 100) : 100;
    
    // 计算折扣
    if (data.original_price > 0) {
      data.discount = Math.floor((data.seckill_price / data.original_price) * 10);
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data
    });
  } catch (error) {
    console.error('获取秒杀详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;
