// routes/check-in.js - 签到系统路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { CheckInRecord, User, PointsLog } = require('../models');
const Response = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

// 签到奖励配置
const CHECK_IN_REWARDS = {
  1: 5,    // 第1天：5积分
  2: 10,   // 第2天：10积分
  3: 15,   // 第3天：15积分
  4: 20,   // 第4天：20积分
  5: 25,   // 第5天：25积分
  6: 30,   // 第6天：30积分
  7: 50    // 第7天：50积分（连续签到奖励）
};

/**
 * @route   POST /api/check-in
 * @desc    签到
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // 1. 检查今天是否已签到
    const existingCheckIn = await CheckInRecord.findOne({
      where: {
        user_id: userId,
        check_date: todayStr
      },
      transaction
    });

    if (existingCheckIn) {
      await transaction.rollback();
      return Response.error(res, '今日已签到', 400);
    }

    // 2. 获取昨天的签到记录，计算连续签到天数
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayCheckIn = await CheckInRecord.findOne({
      where: {
        user_id: userId,
        check_date: yesterdayStr
      },
      transaction
    });

    let continuousDays = 1;
    if (yesterdayCheckIn) {
      continuousDays = yesterdayCheckIn.continuous_days + 1;
      // 连续签到超过7天，重新开始计数
      if (continuousDays > 7) {
        continuousDays = 1;
      }
    }

    // 3. 计算奖励积分
    const points = CHECK_IN_REWARDS[continuousDays] || 5;

    // 4. 创建签到记录
    const checkIn = await CheckInRecord.create({
      user_id: userId,
      check_date: todayStr,
      points,
      continuous_days: continuousDays
    }, { transaction });

    // 5. 增加用户积分
    const user = await User.findByPk(userId, { transaction });
    await user.increment('points', { by: points, transaction });

    // 6. 记录积分日志
    await PointsLog.create({
      user_id: userId,
      type: 'check_in',
      points: points,
      balance: user.points + points,
      description: `签到获得积分（连续${continuousDays}天）`
    }, { transaction });

    await transaction.commit();

    return Response.success(res, {
      points,
      continuous_days: continuousDays,
      total_points: user.points + points,
      is_continuous: continuousDays > 1
    }, '签到成功');
  } catch (error) {
    await transaction.rollback();
    console.error('签到失败:', error);
    return Response.error(res, '签到失败', 500);
  }
});

/**
 * @route   GET /api/check-in/status
 * @desc    获取签到状态
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // 查询今日是否已签到
    const todayCheckIn = await CheckInRecord.findOne({
      where: {
        user_id: userId,
        check_date: todayStr
      }
    });

    const isCheckedIn = !!todayCheckIn;
    let continuousDays = 0;

    if (isCheckedIn) {
      continuousDays = todayCheckIn.continuous_days;
    } else {
      // 查询昨天的记录，判断连续天数
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const yesterdayCheckIn = await CheckInRecord.findOne({
        where: {
          user_id: userId,
          check_date: yesterdayStr
        }
      });

      if (yesterdayCheckIn) {
        continuousDays = yesterdayCheckIn.continuous_days;
      }
    }

    // 获取本月签到天数
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthCheckInCount = await CheckInRecord.count({
      where: {
        user_id: userId,
        check_date: {
          [Op.gte]: firstDayOfMonth.toISOString().split('T')[0]
        }
      }
    });

    return Response.success(res, {
      is_checked_in: isCheckedIn,
      continuous_days: continuousDays,
      month_check_in_count: monthCheckInCount,
      next_reward: CHECK_IN_REWARDS[continuousDays + 1] || 5,
      reward_config: CHECK_IN_REWARDS
    }, '获取签到状态成功');
  } catch (error) {
    console.error('获取签到状态失败:', error);
    return Response.error(res, '获取签到状态失败', 500);
  }
});

/**
 * @route   GET /api/check-in/records
 * @desc    获取签到记录
 * @access  Private
 */
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await CheckInRecord.findAndCountAll({
      where: { user_id: userId },
      order: [['check_date', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return Response.success(res, {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit)
    }, '获取签到记录成功');
  } catch (error) {
    console.error('获取签到记录失败:', error);
    return Response.error(res, '获取签到记录失败', 500);
  }
});

/**
 * @route   GET /api/check-in/calendar/:year/:month
 * @desc    获取指定月份的签到日历
 * @access  Private
 */
router.get('/calendar/:year/:month', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.params;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const records = await CheckInRecord.findAll({
      where: {
        user_id: userId,
        check_date: {
          [Op.between]: [
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ]
        }
      },
      order: [['check_date', 'ASC']]
    });

    // 转换为日历格式
    const calendar = records.map(record => ({
      date: record.check_date,
      points: record.points,
      continuous_days: record.continuous_days
    }));

    return Response.success(res, {
      year: parseInt(year),
      month: parseInt(month),
      calendar
    }, '获取签到日历成功');
  } catch (error) {
    console.error('获取签到日历失败:', error);
    return Response.error(res, '获取签到日历失败', 500);
  }
});

module.exports = router;
