// utils/taskTrigger.js - 任务触发工具
const { PointsTask, UserTaskProgress, User, PointsLog } = require('../models');
const { Op } = require('sequelize');

/**
 * 触发任务进度更新
 * @param {Number} userId - 用户ID
 * @param {String} taskKey - 任务标识
 * @param {Number} increment - 进度增量，默认1
 * @param {Object} transaction - 事务对象（可选）
 */
async function triggerTask(userId, taskKey, increment = 1, transaction = null) {
  try {
    // 1. 查找任务
    const task = await PointsTask.findOne({
      where: { task_key: taskKey, status: 1 },
      transaction
    });

    if (!task) {
      console.log(`任务不存在: ${taskKey}`);
      return null;
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

    // 3. 检查任务是否需要重置（每日/每周任务）
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
        console.log(`任务完成: ${task.name} (用户${userId})`);
      }
      
      await progress.save({ transaction });
      
      return {
        task_id: task.id,
        task_name: task.name,
        current_count: progress.current_count,
        target_count: task.target_count,
        status: progress.status,
        is_completed: progress.status >= 1
      };
    }

    return null;
  } catch (error) {
    console.error('触发任务失败:', error);
    return null;
  }
}

/**
 * 批量触发多个任务
 * @param {Number} userId - 用户ID
 * @param {Array<String>} taskKeys - 任务标识数组
 * @param {Object} transaction - 事务对象（可选）
 */
async function triggerMultipleTasks(userId, taskKeys, transaction = null) {
  const results = [];
  for (const taskKey of taskKeys) {
    const result = await triggerTask(userId, taskKey, 1, transaction);
    if (result) {
      results.push(result);
    }
  }
  return results;
}

/**
 * 常用任务触发快捷方法
 */
const TaskTriggers = {
  // 完成订单
  async onOrderComplete(userId, transaction = null) {
    const tasks = ['first_order']; // 可以触发多个任务
    return await triggerMultipleTasks(userId, tasks, transaction);
  },

  // 评价商品
  async onProductReview(userId, transaction = null) {
    return await triggerTask(userId, 'review_product', 1, transaction);
  },

  // 分享商品
  async onProductShare(userId, transaction = null) {
    return await triggerTask(userId, 'share_product', 1, transaction);
  },

  // 浏览商品
  async onProductBrowse(userId, transaction = null) {
    return await triggerTask(userId, 'browse_product', 1, transaction);
  },

  // 添加购物车
  async onAddToCart(userId, transaction = null) {
    return await triggerTask(userId, 'add_to_cart', 1, transaction);
  },

  // 邀请好友
  async onInviteFriend(userId, transaction = null) {
    return await triggerTask(userId, 'invite_friend', 1, transaction);
  },

  // 签到
  async onCheckIn(userId, transaction = null) {
    return await triggerTask(userId, 'daily_check_in', 1, transaction);
  }
};

module.exports = {
  triggerTask,
  triggerMultipleTasks,
  TaskTriggers
};
