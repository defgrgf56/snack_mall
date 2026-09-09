// routes/search.js - 搜索相关路由
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product, SearchHistory, SearchHot } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * 获取搜索建议
 * GET /api/search/suggestions?keyword=关键词
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return res.json({
        code: 200,
        message: '关键词至少2个字符',
        data: []
      });
    }

    // 从商品表中模糊匹配商品名称
    const products = await Product.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` },
        status: 1
      },
      attributes: ['name'],
      limit: 8,
      group: ['name']
    });

    // 提取唯一的商品名称
    const suggestions = [...new Set(products.map(p => p.name))];

    res.json({
      code: 200,
      message: '获取成功',
      data: suggestions
    });
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 获取热门搜索
 * GET /api/search/hot
 */