// routes/points-transfer.js - 积分转赠路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PointsTransfer, User, PointsLog } = require('../models');
const Response = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

/**
 * @route   POST /api/points-transfer/transfer
 * @desc    转赠积分给好友
 * @access  Private
 */
router.post('/transfer', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const fromUserId = req.user.id;
    const { to_user_id, points, message = '' } = req.body;

    // 1. 验证参数
    if (!to_user_id || !points) {
      await transaction.rollback();
      return Response.error(res, '参数不完整', 400);
    }

    if (points <= 0) {
      await transaction.rollback();
      return Response.error(res, '转赠积分必须大于0', 400);
    }

    if (points < 10) {
      await transaction.rollback();
      return Response.error(res, '转赠积分最少10分', 400);
    }

    if (fromUserId === to_user_id) {
      await transaction.rollback();
      return Response.error(res, '不能转赠给自己', 400);
    }

    // 2. 检查转出用户积分是否足够
    const fromUser = await User.findByPk(fromUserId, { transaction });
    if (!fromUser) {
      await transaction.rollback();
      return Response.error(res, '用户不存在', 404);
    }

    if (fromUser.points < points) {
      await transaction.rollback();
      return Response.error(res, '积分不足', 400);
    }

    // 3. 检查接收用户是否存在
    const toUser = await User.findByPk(to_user_id, { transaction });
    if (!toUser) {
      await transaction.rollback();
      return Response.error(res, '接收用户不存在', 404);
    }

    // 4. 检查今日转赠次数限制（每日最多转赠5次）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransferCount = await PointsTransfer.count({
      where: {
        from_user_id: fromUserId,
        created_at: { [Op.gte]: today },
        status: 1
      },
      transaction
    });

    if (todayTransferCount >= 5) {
      await transaction.rollback();
      return Response.error(res, '每日最多转赠5次', 400);
    }

    // 5. 检查今日转赠总积分限制（每日最多转赠500积分）
    const todayTransferPoints = await PointsTransfer.sum('points', {
      where: {
        from_user_id: fromUserId,
        created_at: { [Op.gte]: today },
        status: 1
      },
      transaction
    }) || 0;

    if (todayTransferPoints + points > 500) {
      await transaction.rollback();
      return Response.error(res, `每日最多转赠500积分，今日已转赠${todayTransferPoints}积分`, 400);
    }

    // 6. 扣除转出用户积分
    await fromUser.decrement('points', { by: points, transaction });

    // 7. 增加接收用户积分
    await toUser.increment('points', { by: points, transaction });

    // 8. 创建转赠记录
    const transfer = await PointsTransfer.create({
      from_user_id: fromUserId,
      to_user_id,
      points,
      message: message.substring(0, 200),
      status: 1
    }, { transaction });

    // 9. 记录积分日志
    await PointsLog.create({
      user_id: fromUserId,
      type: 'transfer_out',
      points: -points,
      balance: fromUser.points - points,
      description: `转赠积分给用户${toUser.nickname || toUser.phone}`
    }, { transaction });

    await PointsLog.create({
      user_id: to_user_id,
      type: 'transfer_in',
      points: points,
      balance: toUser.points + points,
      description: `收到来自${fromUser.nickname || fromUser.phone}的积分转赠`
    }, { transaction });

    await transaction.commit();

    return Response.success(res, {
      transfer_id: transfer.id,
      remaining_points: fromUser.points - points,
      to_user: {
        id: toUser.id,
        nickname: toUser.nickname || toUser.phone,
        avatar: toUser.avatar
      }
    }, '转赠成功');
  } catch (error) {
    await transaction.rollback();
    console.error('转赠积分失败:', error);
    return Response.error(res, '转赠失败', 500);
  }
});

/**
 * @route   GET /api/points-transfer/records
 * @desc    获取转赠记录
 * @access  Private
 */
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (type === 'sent') {
      where.from_user_id = userId;
    } else if (type === 'received') {
      where.to_user_id = userId;
    } else {
      where = {
        [Op.or]: [
          { from_user_id: userId },
          { to_user_id: userId }
        ]
      };
    }

    const { count, rows } = await PointsTransfer.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'phone', 'nickname', 'avatar']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'phone', 'nickname', 'avatar']
        }
      ]
    });

    return Response.success(res, {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit)
    }, '获取转赠记录成功');
  } catch (error) {
    console.error('获取转赠记录失败:', error);
    return Response.error(res, '获取记录失败', 500);
  }
});

/**
 * @route   GET /api/points-transfer/today-stats
 * @desc    获取今日转赠统计
 * @access  Private
 */
router.get('/today-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 今日转出次数
    const todaySentCount = await PointsTransfer.count({
      where: {
        from_user_id: userId,
        created_at: { [Op.gte]: today },
        status: 1
      }
    });

    // 今日转出积分
    const todaySentPoints = await PointsTransfer.sum('points', {
      where: {
        from_user_id: userId,
        created_at: { [Op.gte]: today },
        status: 1
      }
    }) || 0;

    // 今日收到次数
    const todayReceivedCount = await PointsTransfer.count({
      where: {
        to_user_id: userId,
        created_at: { [Op.gte]: today },
        status: 1
      }
    });

    // 今日收到积分
    const todayReceivedPoints = await PointsTransfer.sum('points', {
      where: {
        to_user_id: userId,
        created_at: { [Op.gte]: today },
        status: 1
      }
    }) || 0;

    return Response.success(res, {
      sent: {
        count: todaySentCount,
        points: todaySentPoints,
        remaining_count: Math.max(0, 5 - todaySentCount),
        remaining_points: Math.max(0, 500 - todaySentPoints)
      },
      received: {
        count: todayReceivedCount,
        points: todayReceivedPoints
      }
    }, '获取今日统计成功');
  } catch (error) {
    console.error('获取今日统计失败:', error);
    return Response.error(res, '获取统计失败', 500);
  }
});

module.exports = router;
