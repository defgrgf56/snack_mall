// routes/lottery.js - 积分抽奖路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { LotteryActivity, LotteryPrize, LotteryRecord, User, PointsLog, Coupon, UserCoupon } = require('../models');
const Response = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

/**
 * @route   GET /api/lottery/activities
 * @desc    获取抽奖活动列表
 * @access  Public
 */
router.get('/activities', async (req, res) => {
  try {
    const now = new Date();
    
    const activities = await LotteryActivity.findAll({
      where: {
        status: 1,
        start_time: { [Op.lte]: now },
        end_time: { [Op.gte]: now }
      },
      include: [
        {
          model: LotteryPrize,
          as: 'prizes',
          order: [['sort', 'DESC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return Response.success(res, { activities }, '获取抽奖活动成功');
  } catch (error) {
    console.error('获取抽奖活动失败:', error);
    return Response.error(res, '获取抽奖活动失败', 500);
  }
});

/**
 * @route   GET /api/lottery/activities/:id
 * @desc    获取抽奖活动详情
 * @access  Public
 */
router.get('/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await LotteryActivity.findOne({
      where: { id },
      include: [
        {
          model: LotteryPrize,
          as: 'prizes',
          order: [['sort', 'DESC']]
        }
      ]
    });

    if (!activity) {
      return Response.error(res, '活动不存在', 404);
    }

    return Response.success(res, activity, '获取活动详情成功');
  } catch (error) {
    console.error('获取活动详情失败:', error);
    return Response.error(res, '获取活动详情失败', 500);
  }
});

/**
 * @route   POST /api/lottery/draw
 * @route   POST /api/lottery/draw/:activityId
 * @desc    参与抽奖
 * @access  Private
 */
router.post('/draw/:activityId?', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const activityId = req.params.activityId || req.body.activity_id;

    if (!activityId) {
      await transaction.rollback();
      return Response.error(res, '活动ID不能为空', 400);
    }

    // 1. 检查活动是否存在并有效
    const activity = await LotteryActivity.findOne({
      where: { id: activityId, status: 1 },
      include: [{ model: LotteryPrize, as: 'prizes' }],
      transaction
    });

    if (!activity) {
      await transaction.rollback();
      return Response.error(res, '活动不存在或已结束', 404);
    }

    const now = new Date();
    if (now < activity.start_time || now > activity.end_time) {
      await transaction.rollback();
      return Response.error(res, '活动未开始或已结束', 400);
    }

    // 2. 检查用户积分
    const user = await User.findByPk(userId, { transaction });
    if (user.points < activity.points_per_draw) {
      await transaction.rollback();
      return Response.error(res, '积分不足', 400);
    }

    // 3. 检查每日抽奖次数限制
    if (activity.daily_limit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = await LotteryRecord.count({
        where: {
          user_id: userId,
          activity_id: activityId,
          created_at: { [Op.gte]: today }
        },
        transaction
      });

      if (todayCount >= activity.daily_limit) {
        await transaction.rollback();
        return Response.error(res, `每日最多抽奖${activity.daily_limit}次`, 400);
      }
    }

    // 4. 检查总抽奖次数限制
    if (activity.total_limit) {
      const totalCount = await LotteryRecord.count({
        where: {
          user_id: userId,
          activity_id: activityId
        },
        transaction
      });

      if (totalCount >= activity.total_limit) {
        await transaction.rollback();
        return Response.error(res, `该活动最多参与${activity.total_limit}次`, 400);
      }
    }

    // 5. 扣除积分
    await user.decrement('points', { by: activity.points_per_draw, transaction });

    // 6. 执行抽奖逻辑（概率算法）
    const prize = await drawPrize(activity.prizes, transaction);

    if (!prize) {
      await transaction.rollback();
      return Response.error(res, '抽奖失败', 500);
    }

    // 7. 创建抽奖记录
    const record = await LotteryRecord.create({
      user_id: userId,
      activity_id: activityId,
      prize_id: prize.id,
      prize_name: prize.name,
      prize_type: prize.type,
      prize_value: prize.value,
      points_cost: activity.points_per_draw,
      status: 0
    }, { transaction });

    // 8. 更新奖品中奖次数和库存
    await prize.increment('win_count', { by: 1, transaction });
    if (prize.stock !== null) {
      await prize.decrement('stock', { by: 1, transaction });
    }

    // 9. 自动发放奖励（积分类奖品）
    if (prize.type === 1) {
      // 积分奖励
      const pointsReward = parseInt(prize.value);
      await user.increment('points', { by: pointsReward, transaction });
      await record.update({ status: 1 }, { transaction });
      
      await PointsLog.create({
        user_id: userId,
        type: 'lottery',
        points: pointsReward,
        balance: user.points - activity.points_per_draw + pointsReward,
        description: `抽奖获得积分：${prize.name}`
      }, { transaction });
    } else if (prize.type === 2) {
      // 优惠券奖励
      const couponId = parseInt(prize.value);
      await UserCoupon.create({
        user_id: userId,
        coupon_id: couponId,
        status: 0,
        source: 'lottery'
      }, { transaction });
      await record.update({ status: 1 }, { transaction });
    }

    // 10. 记录积分消耗日志
    await PointsLog.create({
      user_id: userId,
      type: 'lottery',
      points: -activity.points_per_draw,
      balance: user.points - activity.points_per_draw,
      description: `参与抽奖：${activity.name}`
    }, { transaction });

    await transaction.commit();

    return Response.success(res, {
      prize: {
        id: prize.id,
        name: prize.name,
        image: prize.image,
        type: prize.type,
        value: prize.value
      },
      record_id: record.id,
      remaining_points: user.points - activity.points_per_draw
    }, '抽奖成功');
  } catch (error) {
    await transaction.rollback();
    console.error('抽奖失败:', error);
    return Response.error(res, '抽奖失败', 500);
  }
});

/**
 * 抽奖算法 - 概率计算
 */
async function drawPrize(prizes, transaction) {
  // 过滤掉库存为0的奖品
  const availablePrizes = prizes.filter(p => p.stock === null || p.stock > 0);
  
  if (availablePrizes.length === 0) {
    return null;
  }

  // 计算总概率
  const totalProbability = availablePrizes.reduce((sum, p) => sum + parseFloat(p.probability), 0);
  
  // 生成随机数
  const random = Math.random() * totalProbability;
  
  // 根据概率选择奖品
  let currentProbability = 0;
  for (const prize of availablePrizes) {
    currentProbability += parseFloat(prize.probability);
    if (random <= currentProbability) {
      return prize;
    }
  }
  
  // 兜底返回最后一个奖品
  return availablePrizes[availablePrizes.length - 1];
}

/**
 * @route   GET /api/lottery/records
 * @desc    获取我的抽奖记录
 * @access  Private
 */
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await LotteryRecord.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: LotteryActivity,
          as: 'activity',
          attributes: ['id', 'name']
        }
      ]
    });

    return Response.success(res, {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit)
    }, '获取抽奖记录成功');
  } catch (error) {
    console.error('获取抽奖记录失败:', error);
    return Response.error(res, '获取抽奖记录失败', 500);
  }
});

/**
 * @route   GET /api/lottery/user-draw-count/:activityId
 * @desc    获取用户在指定活动的抽奖次数
 * @access  Private
 */
router.get('/user-draw-count/:activityId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityId } = req.params;

    // 今日抽奖次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await LotteryRecord.count({
      where: {
        user_id: userId,
        activity_id: activityId,
        created_at: { [Op.gte]: today }
      }
    });

    // 总抽奖次数
    const totalCount = await LotteryRecord.count({
      where: {
        user_id: userId,
        activity_id: activityId
      }
    });

    return Response.success(res, {
      today_count: todayCount,
      total_count: totalCount
    }, '获取抽奖次数成功');
  } catch (error) {
    console.error('获取抽奖次数失败:', error);
    return Response.error(res, '获取抽奖次数失败', 500);
  }
});

module.exports = router;
