// routes/points-task.js - 积分任务路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PointsTask, UserTaskProgress, User, PointsLog } = require('../models');
const Response = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

/**
 * @route   GET /api/points-task/list
 * @desc    获取任务列表（带用户进度）
 * @access  Private
 */
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // daily, weekly, once

    const where = { status: 1 };
    if (type) {
      where.type = type;
    }

    const tasks = await PointsTask.findAll({
      where,
      order: [['sort', 'DESC'], ['created_at', 'DESC']]
    });

    // 获取用户任务进度
    const taskIds = tasks.map(t => t.id);
    const progress = await UserTaskProgress.findAll({
      where: {
        user_id: userId,
        task_id: { [Op.in]: taskIds }
      }
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.task_id] = p;
    });

    // 合并任务和进度
    const tasksWithProgress = tasks.map(task => {
      const userProgress = progressMap[task.id];
      return {
        ...task.toJSON(),
        user_progress: userProgress ? {
          current_count: userProgress.current_count,
          status: userProgress.status,
          completed_at: userProgress.completed_at
        } : {
          current_count: 0,
          status: 0,
          completed_at: null
        }
      };
    });

    return Response.success(res, tasksWithProgress, '获取任务列表成功');
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return Response.error(res, '获取任务列表失败', 500);
  }
});

/**
 * @route   POST /api/points-task/progress
 * @desc    更新任务进度（由业务代码调用）
 * @access  Private
 */
router.post('/progress', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { task_key, increment = 1 } = req.body;

    // 1. 查找任务
    const task = await PointsTask.findOne({
      where: { task_key, status: 1 },
      transaction
    });

    if (!task) {
      await transaction.rollback();
      return Response.error(res, '任务不存在', 404);
    }

    // 2. 获取或创建用户任务进度
    let progress = await UserTaskProgress.findOne({
      where: {
        user_id: userId,
        task_id: task.id
      },
      transaction
    });

    if (!progress) {
      progress = await UserTaskProgress.create({
        user_id: userId,
        task_id: task.id,
        current_count: 0,
        status: 0
      }, { transaction });
    }

    // 3. 如果任务是每日或每周任务，检查是否需要重置
    if (task.type === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const progressDate = new Date(progress.updated_at);
      progressDate.setHours(0, 0, 0, 0);
      
      if (progressDate < today) {
        // 重置每日任务
        progress.current_count = 0;
        progress.status = 0;
        progress.completed_at = null;
      }
    } else if (task.type === 'weekly') {
      const now = new Date();
      const progressDate = new Date(progress.updated_at);
      const daysDiff = Math.floor((now - progressDate) / (1000 * 60 * 60 * 24));
      const nowDay = now.getDay();
      const progressDay = progressDate.getDay();
      
      // 判断是否跨周（简单判断：超过7天或者已经是新的一周）
      if (daysDiff >= 7 || (nowDay < progressDay)) {
        progress.current_count = 0;
        progress.status = 0;
        progress.completed_at = null;
      }
    }

    // 4. 更新进度
    if (progress.status !== 2) { // 未领取奖励的任务才能增加进度
      progress.current_count += increment;
      
      // 检查是否完成
      if (progress.current_count >= task.target_count && progress.status === 0) {
        progress.status = 1; // 已完成
        progress.completed_at = new Date();
      }
      
      await progress.save({ transaction });
    }

    await transaction.commit();

    return Response.success(res, {
      current_count: progress.current_count,
      target_count: task.target_count,
      status: progress.status,
      is_completed: progress.status >= 1
    }, '更新任务进度成功');
  } catch (error) {
    await transaction.rollback();
    console.error('更新任务进度失败:', error);
    return Response.error(res, '更新任务进度失败', 500);
  }
});

/**
 * @route   POST /api/points-task/claim/:taskId
 * @desc    领取任务奖励
 * @access  Private
 */
router.post('/claim/:taskId', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    // 1. 查找任务
    const task = await PointsTask.findByPk(taskId, { transaction });
    if (!task) {
      await transaction.rollback();
      return Response.error(res, '任务不存在', 404);
    }

    // 2. 查找用户任务进度
    const progress = await UserTaskProgress.findOne({
      where: {
        user_id: userId,
        task_id: taskId
      },
      transaction
    });

    if (!progress) {
      await transaction.rollback();
      return Response.error(res, '任务进度不存在', 404);
    }

    // 3. 检查任务状态
    if (progress.status !== 1) {
      await transaction.rollback();
      return Response.error(res, progress.status === 0 ? '任务未完成' : '奖励已领取', 400);
    }

    // 4. 发放积分奖励
    const user = await User.findByPk(userId, { transaction });
    await user.increment('points', { by: task.points_reward, transaction });

    // 5. 更新任务状态
    await progress.update({ status: 2 }, { transaction });

    // 6. 记录积分日志
    await PointsLog.create({
      user_id: userId,
      type: 'task',
      points: task.points_reward,
      balance: user.points + task.points_reward,
      description: `完成任务：${task.name}`
    }, { transaction });

    await transaction.commit();

    return Response.success(res, {
      points_reward: task.points_reward,
      total_points: user.points + task.points_reward
    }, '领取奖励成功');
  } catch (error) {
    await transaction.rollback();
    console.error('领取奖励失败:', error);
    return Response.error(res, '领取奖励失败', 500);
  }
});

/**
 * @route   GET /api/points-task/my-progress
 * @desc    获取我的任务进度
 * @access  Private
 */
router.get('/my-progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const progress = await UserTaskProgress.findAll({
      where: { user_id: userId },
      include: [
        {
          model: PointsTask,
          as: 'task',
          where: { status: 1 }
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    return Response.success(res, progress, '获取任务进度成功');
  } catch (error) {
    console.error('获取任务进度失败:', error);
    return Response.error(res, '获取任务进度失败', 500);
  }
});

/**
 * @route   GET /api/points-task/summary
 * @desc    获取任务完成概况
 * @access  Private
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 今日完成的任务数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCompleted = await UserTaskProgress.count({
      where: {
        user_id: userId,
        status: { [Op.gte]: 1 },
        completed_at: { [Op.gte]: today }
      }
    });

    // 总完成任务数
    const totalCompleted = await UserTaskProgress.count({
      where: {
        user_id: userId,
        status: 2 // 已领取奖励
      }
    });

    // 待领取奖励的任务数
    const pendingClaim = await UserTaskProgress.count({
      where: {
        user_id: userId,
        status: 1 // 已完成未领取
      }
    });

    return Response.success(res, {
      today_completed: todayCompleted,
      total_completed: totalCompleted,
      pending_claim: pendingClaim
    }, '获取任务概况成功');
  } catch (error) {
    console.error('获取任务概况失败:', error);
    return Response.error(res, '获取任务概况失败', 500);
  }
});

module.exports = router;
