// routes/search.js - 搜索相关路由
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product, SearchHistory, SearchHot, Category } = require('../models');
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
router.get('/hot', async (req, res) => {
  try {
    // 获取热门搜索关键词（按搜索次数降序，取前10条）
    const hotKeywords = await SearchHot.findAll({
      where: { is_show: 1 },
      order: [
        ['sort', 'DESC'],
        ['search_count', 'DESC']
      ],
      limit: 10,
      attributes: ['id', 'keyword', 'search_count']
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: hotKeywords
    });
  } catch (error) {
    console.error('获取热门搜索失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 搜索商品
 * GET /api/search/products
 */
router.get('/products', async (req, res) => {
  try {
    const { 
      keyword, 
      category_id, 
      price_min, 
      price_max, 
      sort = 'default',
      page = 1, 
      pageSize = 20 
    } = req.query;

    if (!keyword || keyword.trim().length === 0) {
      return res.json({
        code: 400,
        message: '请输入搜索关键词'
      });
    }

    // 构建查询条件
    const where = {
      name: { [Op.like]: `%${keyword}%` },
      status: 1
    };

    // 分类筛选
    if (category_id) {
      where.category_id = category_id;
    }

    // 价格区间筛选
    if (price_min) {
      where.price = { [Op.gte]: price_min };
    }
    if (price_max) {
      if (where.price) {
        where.price = { [Op.and]: [where.price, { [Op.lte]: price_max }] };
      } else {
        where.price = { [Op.lte]: price_max };
      }
    }

    // 排序
    let order = [];
    switch (sort) {
      case 'sales':
        order = [['sales', 'DESC']];
        break;
      case 'price_asc':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
        order = [['price', 'DESC']];
        break;
      default:
        order = [['sales', 'DESC'], ['created_at', 'DESC']];
    }

    const offset = (page - 1) * pageSize;

    // 查询商品
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      attributes: ['id', 'name', 'cover', 'price', 'original_price', 'sales', 'stock', 'description']
    });

    res.json({
      code: 200,
      message: '搜索成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('搜索商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 记录搜索历史（需要登录）
 * POST /api/search/history
 */
router.post('/history', authenticateToken, async (req, res) => {
  try {
    const { keyword } = req.body;
    const userId = req.user.id;

    if (!keyword || keyword.trim().length === 0) {
      return res.json({
        code: 400,
        message: '搜索关键词不能为空'
      });
    }

    // 查找或创建用户搜索历史
    const [history, created] = await SearchHistory.findOrCreate({
      where: { user_id: userId, keyword: keyword.trim() },
      defaults: { search_count: 1 }
    });

    // 如果已存在，更新搜索次数和时间
    if (!created) {
      history.search_count += 1;
      history.updated_at = new Date();
      await history.save();
    }

    // 更新全局热搜统计
    const [hotSearch, hotCreated] = await SearchHot.findOrCreate({
      where: { keyword: keyword.trim() },
      defaults: { search_count: 1, is_show: 1 }
    });

    if (!hotCreated) {
      hotSearch.search_count += 1;
      await hotSearch.save();
    }

    res.json({
      code: 200,
      message: '记录成功'
    });
  } catch (error) {
    console.error('记录搜索历史失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 获取用户搜索历史（需要登录）
 * GET /api/search/history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const history = await SearchHistory.findAll({
      where: { user_id: userId },
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'keyword', 'search_count', 'updated_at']
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: history
    });
  } catch (error) {
    console.error('获取搜索历史失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 删除单条搜索历史（需要登录）
 * DELETE /api/search/history/:id
 */
router.delete('/history/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await SearchHistory.destroy({
      where: { id, user_id: userId }
    });

    if (result === 0) {
      return res.json({
        code: 404,
        message: '记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除搜索历史失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 清空搜索历史（需要登录）
 * DELETE /api/search/history
 */
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await SearchHistory.destroy({
      where: { user_id: userId }
    });

    res.json({
      code: 200,
      message: '清空成功'
    });
  } catch (error) {
    console.error('清空搜索历史失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;