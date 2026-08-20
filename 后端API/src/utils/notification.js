// src/utils/notification.js - 通知工具函数
const { Notification } = require('../models');

/**
 * 创建通知
 * @param {Number} userId - 用户ID
 * @param {String} type - 通知类型: order/activity/system
 * @param {String} title - 通知标题
 * @param {String} content - 通知内容
 * @param {Number} relatedId - 关联ID(可选)
 */
async function createNotification(userId, type, title, content, relatedId = null) {
  try {
    await Notification.create({
      user_id: userId,
      type,
      title,
      content,
      related_id: relatedId
    });
    console.log(`✓ 通知已创建: ${title} -> 用户${userId}`);
  } catch (error) {
    console.error('创建通知失败:', error);
  }
}

/**
 * 订单状态变更通知
 */
const orderNotifications = {
  // 订单已支付
  paid: (userId, orderNo, orderId) => {
    return createNotification(
      userId,
      'order',
      '订单支付成功',
      `您的订单 ${orderNo} 已支付成功，商家正在备货中`,
      orderId
    );
  },

  // 订单已发货
  shipped: (userId, orderNo, orderId) => {
    return createNotification(
      userId,
      'order',
      '订单已发货',
      `您的订单 ${orderNo} 已发货，请注意查收`,
      orderId
    );
  },

  // 订单已完成
  completed: (userId, orderNo, orderId) => {
    return createNotification(
      userId,
      'order',
      '订单已完成',
      `您的订单 ${orderNo} 已完成，期待您的好评`,
      orderId
    );
  },

  // 订单已取消
  cancelled: (userId, orderNo, orderId) => {
    return createNotification(
      userId,
      'order',
      '订单已取消',
      `您的订单 ${orderNo} 已取消`,
      orderId
    );
  },

  // 退款审核通过
  refundApproved: (userId, orderNo, orderId) => {
    return createNotification(
      userId,
      'order',
      '退款审核通过',
      `您的订单 ${orderNo} 退款申请已通过审核，退款正在处理中`,
      orderId
    );
  },

  // 退款被拒绝
  refundRejected: (userId, orderNo, reason, orderId) => {
    return createNotification(
      userId,
      'order',
      '退款申请被拒绝',
      `您的订单 ${orderNo} 退款申请未通过: ${reason}`,
      orderId
    );
  },

  // 退款成功
  refundSuccess: (userId, orderNo, amount, orderId) => {
    return createNotification(
      userId,
      'order',
      '退款成功',
      `您的订单 ${orderNo} 已成功退款 ¥${amount}，预计1-3个工作日到账`,
      orderId
    );
  }
};

/**
 * 优惠活动通知
 */
const activityNotifications = {
  // 优惠券发放
  coupon: (userId, couponName) => {
    return createNotification(
      userId,
      'activity',
      '优惠券到账',
      `您获得了一张优惠券: ${couponName}，快去使用吧`
    );
  },

  // 积分到账
  points: (userId, points, reason) => {
    return createNotification(
      userId,
      'activity',
      '积分到账',
      `您获得了 ${points} 积分，原因: ${reason}`
    );
  },

  // 限时活动
  limitedOffer: (userId, title, content) => {
    return createNotification(
      userId,
      'activity',
      title,
      content
    );
  }
};

/**
 * 系统公告
 */
const systemNotifications = {
  // 系统维护通知
  maintenance: (userId, startTime, endTime) => {
    return createNotification(
      userId,
      'system',
      '系统维护通知',
      `系统将于 ${startTime} 至 ${endTime} 进行维护，期间部分功能可能无法使用`
    );
  },

  // 系统升级通知
  upgrade: (userId, content) => {
    return createNotification(
      userId,
      'system',
      '系统升级通知',
      content
    );
  },

  // 重要公告
  announcement: (userId, title, content) => {
    return createNotification(
      userId,
      'system',
      title,
      content
    );
  }
};

/**
 * 批量发送通知(给所有用户)
 */
async function broadcastNotification(type, title, content) {
  try {
    const { User } = require('../models');
    const users = await User.findAll({
      where: { status: 1 },
      attributes: ['id']
    });

    const notifications = users.map(user => ({
      user_id: user.id,
      type,
      title,
      content,
      is_read: 0
    }));

    await Notification.bulkCreate(notifications);
    console.log(`✓ 批量通知已发送: ${title} -> ${users.length}个用户`);
  } catch (error) {
    console.error('批量发送通知失败:', error);
  }
}

module.exports = {
  createNotification,
  orderNotifications,
  activityNotifications,
  systemNotifications,
  broadcastNotification
};
