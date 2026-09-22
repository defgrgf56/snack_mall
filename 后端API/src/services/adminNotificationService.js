// src/services/adminNotificationService.js - 管理员通知服务
const { AdminNotification } = require('../models');

/**
 * 创建管理员通知并推送
 * @param {String} type - 通知类型: order/favorite/review/system
 * @param {String} title - 通知标题
 * @param {String} content - 通知内容
 * @param {Number} relatedId - 关联ID（可选）
 * @returns {Object} 创建的通知
 */
async function createAdminNotification(type, title, content, relatedId = null) {
  try {
    const notification = await AdminNotification.create({
      type,
      title,
      content,
      related_id: relatedId,
      is_read: 0
    });

    console.log(`✓ 管理员通知已创建: ${title} (type=${type})`);

    // 推送 WebSocket
    const wsServer = require('../app').get('wsServer');
    if (wsServer) {
      wsServer.broadcast(notification.toJSON());
    }

    return notification;
  } catch (error) {
    console.error('创建管理员通知失败:', error);
    return null;
  }
}

// ==================== 业务触发函数 ====================

/**
 * 新订单通知
 */
async function notifyNewOrder(orderId, orderNo, userName, amount) {
  return createAdminNotification(
    'order',
    '新订单',
    `用户 ${userName} 下单成功，订单号 ${orderNo}，金额 ¥${amount}`,
    orderId
  );
}

/**
 * 新收藏通知
 */
async function notifyNewFavorite(favoriteId, userName, productName) {
  return createAdminNotification(
    'favorite',
    '新收藏',
    `用户 ${userName} 收藏了商品「${productName}」`,
    favoriteId
  );
}

/**
 * 新评价通知
 */
async function notifyNewReview(reviewId, userName, productName, rating, content) {
  const preview = content && content.length > 30
    ? content.substring(0, 30) + '...'
    : content;
  return createAdminNotification(
    'review',
    '新评价',
    `用户 ${userName} 对「${productName}」给出 ${rating} 星评价：${preview}`,
    reviewId
  );
}

module.exports = {
  createAdminNotification,
  notifyNewOrder,
  notifyNewFavorite,
  notifyNewReview
};