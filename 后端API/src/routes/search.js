// routes/search.js - 搜索相关路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { SearchHistory, SearchHot, Product } = require('../models');
const Response = require('../utils/response');
const { Op } = require('sequelize');

/**
 * @route   GET /api/search/history
 * @desc    获取用户搜索历史
 * @access  Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const histories = await SearchHistory.findAll({
      where: { user_id: userId },
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'keyword', 'search_count', 'updated_at']
    });

    return Response.success(res, histories, '获取搜索历史成功');
  } catch (error) {
    console.error('获取搜索历史失败:', error);
    return Response.error(res, '获取搜索历史失败', 500);
  }
});

/**
 * @route   POST /api/search/history
 * @desc    保存搜索历史
 * @access  Private
 */
router.post('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.body;

    if (!keyword || keyword.trim() === '') {
      return Response.error(res, '搜索关键词不能为空', 400);
    }

    const trimmedKeyword = keyword.trim();

    // 查找是否已存在该搜索记录
    const existingHistory = await SearchHistory.findOne({
      where: {
        user_id: userId,
        keyword: trimmedKeyword
      }
    });

    if (existingHistory) {
      // 更新搜索次数和时间
      await existingHistory.update({
        search_count: existingHistory.search_count + 1,
        updated_at: new Date()
      });
    } else {
      // 创建新的搜索记录
      await SearchHistory.create({
        user_id: userId,
        keyword: trimmedKeyword,
        search_count: 1
      });
    }

    // 同步更新热门搜索统计
    const hotSearch = await SearchHot.findOne({
      where: { keyword: trimmedKeyword }
    });

    if (hotSearch) {
      await hotSearch.update({
        search_count: hotSearch.search_count + 1
      });
    } else {
      await SearchHot.create({
        keyword: trimmedKeyword,
        search_count: 1,
        is_show: 1
      });
    }

    return Response.success(res, null, '保存搜索历史成功');
  } catch (error) {
    console.error('保存搜索历史失败:', error);
    return Response.error(res, '保存搜索历史失败', 500);
  }
});

/**
 * @route   DELETE /api/search/history/:id
 * @desc    删除单条搜索历史
 * @access  Private
 */
router.delete('/history/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await SearchHistory.destroy({
      where: {
        id,
        user_id: userId
      }
    });

    if (result === 0) {
      return Response.error(res, '搜索历史不存在', 404);
    }

    return Response.success(res, null, '删除搜索历史成功');
  } catch (error) {
    console.error('删除搜索历史失败:', error);
    return Response.error(res, '删除搜索历史失败', 500);
  }
});

/**
 * @route   DELETE /api/search/history
 * @desc    清空所有搜索历史
 * @access  Private
 */
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await SearchHistory.destroy({
      where: { user_id: userId }
    });

    return Response.success(res, null, '清空搜索历史成功');
  } catch (error) {
    console.error('清空搜索历史失败:', error);
    return Response.error(res, '清空搜索历史失败', 500);
  }
});

/**
 * @route   GET /api/search/hot
 * @desc    获取热门搜索词
 * @access  Public
 */
router.get('/hot', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const hotSearches = await SearchHot.findAll({
      where: { is_show: 1 },
      order: [
        ['sort', 'DESC'],
        ['search_count', 'DESC']
      ],
      limit: parseInt(limit),
      attributes: ['id', 'keyword', 'search_count']
    });

    return Response.success(res, hotSearches, '获取热门搜索成功');
  } catch (error) {
    console.error('获取热门搜索失败:', error);
    return Response.error(res, '获取热门搜索失败', 500);
  }
});

/**
 * @route   GET /api/search/suggest
 * @desc    搜索联想词（基于商品名称）
 * @access  Public
 */
router.get('/suggest', async (req, res) => {
  try {
    const { keyword, limit = 10 } = req.query;

    if (!keyword || keyword.trim() === '') {
      return Response.success(res, [], '关键词为空');
    }

    const trimmedKeyword = keyword.trim();

    // 从商品名称中模糊匹配
    const products = await Product.findAll({
      where: {
        name: {
          [Op.like]: `%${trimmedKeyword}%`
        },
        status: 1
      },
      attributes: ['name'],
      limit: parseInt(limit),
      group: ['name']
    });

    // 提取商品名称作为联想词
    const suggestions = products.map(p => p.name);

    // 也可以从热门搜索中匹配
    const hotSuggestions = await SearchHot.findAll({
      where: {
        keyword: {
          [Op.like]: `%${trimmedKeyword}%`
        },
        is_show: 1
      },
      attributes: ['keyword'],
      order: [['search_count', 'DESC']],
      limit: 5
    });

    const hotKeywords = hotSuggestions.map(h => h.keyword);

    // 合并并去重
    const allSuggestions = [...new Set([...hotKeywords, ...suggestions])];

    return Response.success(res, allSuggestions.slice(0, parseInt(limit)), '获取搜索联想成功');
  } catch (error) {
    console.error('获取搜索联想失败:', error);
    return Response.error(res, '获取搜索联想失败', 500);
  }
});

module.exports = router;
