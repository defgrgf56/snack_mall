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
    const { status, page = 1, pageSize = 10 } = req.query;
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const now = new Date();
    
    // 不再使用数据库的 status 字段筛选，获取所有秒杀后动态计算
    const { count, rows } = await Seckill.findAndCountAll({
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'price', 'stock', 'sales']
      }],
      order: [['sort', 'DESC'], ['created_at', 'DESC']],
      offset: 0,
      limit: 10000
    });
    
    // 动态计算秒杀状态
    let seckills = rows.map(item => {
      const data = item.toJSON();
      const startTime = new Date(data.start_time);
      const endTime = new Date(data.end_time);
      
      // 根据时间计算实际状态
      if (now < startTime) {
        data.status = 2; // 未开始
        data.remaining_time = Math.max(0, Math.floor((startTime - now) / 1000));
      } else if (now >= startTime && now <= endTime) {
        data.status = 1; // 进行中
        data.remaining_time = Math.max(0, Math.floor((endTime - now) / 1000));
      } else {
        data.status = 0; // 已结束
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
    
    // 如果指定了 status，则根据动态计算的状态进行筛选
    if (status !== undefined && status !== '') {
      seckills = seckills.filter(item => item.status === parseInt(status));
    }
    
    // 应用分页
    const total = seckills.length;
    const paginatedSeckills = seckills.slice(offset, offset + limit);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: paginatedSeckills,
        pagination: {
          total: total,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
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
