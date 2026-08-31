// services/api/notification.js - 通知相关 API

const request = require('../request')

/**
 * 获取通知列表
 */
function getNotifications(params) {
  return request.get('/notifications', params)
}

/**
 * 获取未读数量
 */
function getUnreadCount() {
  return request.get('/notifications/unread-count')
}

/**
 * 标记已读
 */
function markRead(id) {
  return request.put(`/notifications/${id}/read`)
}

/**
 * 标记全部已读
 */
function markAllRead() {
  return request.put('/notifications/read-all')
}

/**
 * 删除通知
 */
function deleteNotification(id) {
  return request.delete(`/notifications/${id}`)
}

/**
 * 清空已读消息
 */
function clearRead() {
  return request.delete('/notifications/clear-read')
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  clearRead
}