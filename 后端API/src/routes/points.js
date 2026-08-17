// src/routes/points.js - 积分路由
const express = require('express');
const router = express.Router();
const { PointsLog, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * 获取积分记录
 * GET /api/points/logs
 * Query: page, pageSize
 */
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    
    const { count, rows: logs } = await PointsLog.findAndCountAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset
    });
    
    // 格式化数据
    const formattedLogs = logs.map(log => ({
      id: log.id,
      points: log.points,
      type: log.type,
      type_text: getPointsTypeText(log.type),
      remark: log.remark,
      created_at: log.created_at
    }));
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        list: formattedLogs,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(count / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('获取积分记录失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取积分余额
 * GET /api/points/balance
 */
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'points']
    });
    
    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        points: user.points || 0
      }
    });
  } catch (error) {
    console.error('获取积分余额失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 积分类型文本转换
 */
function getPointsTypeText(type) {
  const typeMap = {
    1: '签到',
    2: '消费获得',
    3: '积分兑换',
    4: '退款返还',
    5: '系统赠送',
    6: '活动奖励'
  };
  return typeMap[type] || '其他';
}

module.exports = router;
