// src/stores/notification.js - 通知状态管理 + WebSocket
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
import { getUnreadCount } from '@/api/notification'

// 通知类型 → 图标/颜色映射
const TYPE_META = {
  order:   { title: '新订单',   color: '#409eff' },
  favorite: { title: '新收藏', color: '#e6a23c' },
  review:  { title: '新评价',   color: '#67c23a' },
  system:  { title: '系统通知', color: '#909399' }
}

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const notifications = ref([]) // 实时推送的新通知（内存暂存）
  const wsConnected = ref(false)

  let ws = null
  let reconnectTimer = null
  let reconnectAttempts = 0
  const MAX_RECONNECT = 10
  const RECONNECT_INTERVAL = 3000

  // 获取 token
  function getToken() {
    return localStorage.getItem('admin_token') || ''
  }

  // 从后端拉取未读数
  async function fetchUnreadCount() {
    try {
      const data = await getUnreadCount()
      unreadCount.value = data.count || 0
    } catch (e) {
      // 静默失败，不影响页面
    }
  }

  // 连接 WebSocket
  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    const token = getToken()
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    // 后端 WebSocket 和 API 同端口
    const wsUrl = `${protocol}//${host}/ws/admin?token=${token}`

    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('[WS] 已连接')
      wsConnected.value = true
      reconnectAttempts = 0
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'notification') {
          const data = msg.data
          // 更新计数与列表
          unreadCount.value++
          notifications.value.unshift(data)
          if (notifications.value.length > 50) {
            notifications.value.length = 50
          }
          // 弹出右上角提示
          const meta = TYPE_META[data.type] || TYPE_META.system
          ElNotification({
            title: data.title || meta.title,
            message: data.content,
            type: data.type === 'order' ? 'success' : 'info',
            duration: 5000
          })
        } else if (msg.type === 'connected') {
          console.log('[WS] 服务器确认连接, adminId:', msg.adminId)
        }
      } catch (e) {
        console.error('[WS] 消息解析失败:', e)
      }
    }

    ws.onclose = () => {
      console.log('[WS] 连接断开')
      wsConnected.value = false
      ws = null
      scheduleReconnect()
    }

    ws.onerror = (err) => {
      console.error('[WS] 错误:', err)
      ws.close()
    }
  }

  // 自动重连
  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT) {
      console.warn('[WS] 达到最大重连次数，停止重连')
      return
    }
    if (reconnectTimer) clearTimeout(reconnectTimer)

    reconnectTimer = setTimeout(() => {
      reconnectAttempts++
      console.log(`[WS] 第 ${reconnectAttempts} 次重连...`)
      connect()
    }, RECONNECT_INTERVAL)
  }

  // 断开
  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    reconnectAttempts = MAX_RECONNECT // 阻止自动重连
    if (ws) {
      ws.close()
      ws = null
    }
    wsConnected.value = false
  }

  // 标记已读后更新本地计数
  function decrementUnread() {
    if (unreadCount.value > 0) unreadCount.value--
  }

  function clearUnread() {
    unreadCount.value = 0
  }

  return {
    unreadCount,
    notifications,
    wsConnected,
    connect,
    disconnect,
    fetchUnreadCount,
    decrementUnread,
    clearUnread
  }
})