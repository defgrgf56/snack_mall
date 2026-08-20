// routes/points-ranking.js - 积分排行榜路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { User, PointsLog } = require('../models');
const Response = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

/**
 * @route   GET /api/points-ranking/total
 * @desc    获取总积分排行榜
 * @access  Public
 */
router.get('/total', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const rankings = await User.findAll({
      attributes: [
        'id',
        'phone',
        'nickname',
        'avatar',
        'points',
        [sequelize.literal('(@rank := @rank + 1)'), 'rank']
      ],
      where: {
        points: { [Op.gt]: 0 }
      },
      order: [['points', 'DESC'], ['id', 'ASC']],
      limit: parseInt(limit),
      raw: true
    });

    // 初始化rank变量
    await sequelize.query('SET @rank = 0');

    return Response.success(res, rankings, '获取总积分排行榜成功');
  } catch (error) {
    console.error('获取总积分排行榜失败:', error);
    return Response.error(res, '获取排行榜失败', 500);
  }
});

/**
 * @route   GET /api/points-ranking/daily
 * @desc    获取今日积分增长排行榜
 * @access  Public
 */
router.get('/daily', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 统计今日积分增长
    const rankings = await PointsLog.findAll({
      attributes: [
        'user_id',
        [sequelize.fn('SUM', sequelize.col('points')), 'daily_points']
      ],
      where: {
        created_at: { [Op.gte]: today },
        points: { [Op.gt]: 0 } // 只统计获得的积分
      },
      group: ['user_id'],
      order: [[sequelize.fn('SUM', sequelize.col('points')), 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'phone', 'nickname', 'avatar']
        }
      ]
    });

    const formattedRankings = rankings.map((item, index) => ({
      rank: index + 1,
      user_id: item.user_id,
      phone: item.user?.phone || '未知用户',
      nickname: item.user?.nickname || '未知用户',
      avatar: item.user?.avatar,
      daily_points: parseInt(item.getDataValue('daily_points'))
    }));

    return Response.success(res, formattedRankings, '获取今日积分排行榜成功');
  } catch (error) {
    console.error('获取今日积分排行榜失败:', error);
    return Response.error(res, '获取排行榜失败', 500);
  }
});

/**
 * @route   GET /api/points-ranking/weekly
 * @desc    获取本周积分增长排行榜
 * @access  Public
 */
router.get('/weekly', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // 计算本周一的日期
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    // 统计本周积分增长
    const rankings = await PointsLog.findAll({
      attributes: [
        'user_id',
        [sequelize.fn('SUM', sequelize.col('points')), 'weekly_points']
      ],
      where: {
        created_at: { [Op.gte]: monday },
        points: { [Op.gt]: 0 }
      },
      group: ['user_id'],
      order: [[sequelize.fn('SUM', sequelize.col('points')), 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'phone', 'nickname', 'avatar']
        }
      ]
    });

    const formattedRankings = rankings.map((item, index) => ({
      rank: index + 1,
      user_id: item.user_id,
      phone: item.user?.phone || '未知用户',
      nickname: item.user?.nickname || '未知用户',
      avatar: item.user?.avatar,
      weekly_points: parseInt(item.getDataValue('weekly_points'))
    }));

    return Response.success(res, formattedRankings, '获取本周积分排行榜成功');
  } catch (error) {
    console.error('获取本周积分排行榜失败:', error);
    return Response.error(res, '获取排行榜失败', 500);
  }
});

/**
 * @route   GET /api/points-ranking/my-rank
 * @desc    获取我的排名
 * @access  Private
 */
router.get('/my-rank', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'total' } = req.query; // total, daily, weekly

    let myRank = 0;
    let myPoints = 0;

    if (type === 'total') {
      // 总积分排名
      const user = await User.findByPk(userId, {
        attributes: ['points']
      });
      myPoints = user.points;

      const higherCount = await User.count({
        where: {
          points: { [Op.gt]: myPoints }
        }
      });
      myRank = higherCount + 1;
    } else if (type === 'daily') {
      // 今日排名
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const myDailyPoints = await PointsLog.sum('points', {
        where: {
          user_id: userId,
          created_at: { [Op.gte]: today },
          points: { [Op.gt]: 0 }
        }
      }) || 0;
      myPoints = myDailyPoints;

      // 计算排名
      const higherUsers = await PointsLog.findAll({
        attributes: [
          'user_id',
          [sequelize.fn('SUM', sequelize.col('points')), 'daily_points']
        ],
        where: {
          created_at: { [Op.gte]: today },
          points: { [Op.gt]: 0 }
        },
        group: ['user_id'],
        having: sequelize.literal(`SUM(points) > ${myDailyPoints}`)
      });
      myRank = higherUsers.length + 1;
    } else if (type === 'weekly') {
      // 本周排名
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const myWeeklyPoints = await PointsLog.sum('points', {
        where: {
          user_id: userId,
          created_at: { [Op.gte]: monday },
          points: { [Op.gt]: 0 }
        }
      }) || 0;
      myPoints = myWeeklyPoints;

      const higherUsers = await PointsLog.findAll({
        attributes: [
          'user_id',
          [sequelize.fn('SUM', sequelize.col('points')), 'weekly_points']
        ],
        where: {
          created_at: { [Op.gte]: monday },
          points: { [Op.gt]: 0 }
        },
        group: ['user_id'],
        having: sequelize.literal(`SUM(points) > ${myWeeklyPoints}`)
      });
      myRank = higherUsers.length + 1;
    }

    return Response.success(res, {
      type,
      rank: myRank,
      points: myPoints
    }, '获取我的排名成功');
  } catch (error) {
    console.error('获取我的排名失败:', error);
    return Response.error(res, '获取排名失败', 500);
  }
});

module.exports = router;
