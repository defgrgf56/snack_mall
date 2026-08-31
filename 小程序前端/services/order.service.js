// services/order.service.js - 订单相关接口

import http from './http'

/**
 * 订单服务
 */
export default {
  /**
   * 创建订单
   */
  createOrder(data) {
    return http.post('/orders', data, { showLoading: true, loadingText: '提交订单中...' })
  },

  /**
   * 获取订单列表
   */
  getOrders(params = {}) {
    return http.get('/orders', params)
  },

  /**
   * 获取订单详情
   */
  getOrderDetail(id) {
    return http.get(`/orders/${id}`)
  },

  /**
   * 取消订单
   */
  cancelOrder(id) {
    return http.put(`/orders/${id}/cancel`, {}, { showLoading: true, loadingText: '取消中...' })
  },

  /**
   * 确认收货
   */
  confirmOrder(id) {
    return http.put(`/orders/${id}/receive`, {}, { showLoading: true, loadingText: '确认中...' })
  },

  /**
   * 删除订单
   */
  deleteOrder(id) {
    return http.delete(`/orders/${id}`, {}, { showLoading: true, loadingText: '删除中...' })
  },

  /**
   * 获取订单统计
   */
  getOrderStats() {
    return http.get('/orders/stats')
  },
}