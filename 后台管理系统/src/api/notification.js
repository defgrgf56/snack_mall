// src/api/notification.js - 管理员通知 API
import request from '@/utils/request'

export function getNotifications(params) {
  return request({ url: '/admin/notifications', method: 'get', params })
}

export function getUnreadCount() {
  return request({ url: '/admin/notifications/unread-count', method: 'get' })
}

export function markAsRead(id) {
  return request({ url: `/admin/notifications/${id}/read`, method: 'put' })
}

export function markAllRead() {
  return request({ url: '/admin/notifications/read-all', method: 'put' })
}

export function deleteNotification(id) {
  return request({ url: `/admin/notifications/${id}`, method: 'delete' })
}