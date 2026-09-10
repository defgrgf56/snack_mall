// services/api/order.js - 订单相关 API

const request = require('../request')

module.exports = {
  /**
   * 创建订单
   */
  createOrder(data) {
    return request.post('/orders', data, {
      loading: true,
      loadingText: '提交订单中...'
    })
  },

  /**
   * 获取订单列表
   */
  getOrders(params) {
    return request.get('/orders', params)
  },

  /**
   * 获取订单详情
   */
  getOrderDetail(orderId) {
    return request.get(`/orders/${orderId}`)
  },

  /**
   * 取消订单
   */
  cancelOrder(orderId) {
    return request.put(`/orders/${orderId}/cancel`)
  },

  /**
   * 确认收货
   */
  confirmReceive(orderId) {
    return request.put(`/orders/${orderId}/receive`)
  },

  /**
   * 删除订单
   */
  deleteOrder(orderId) {
    return request.delete(`/orders/${orderId}`)
  },

  /**
   * 获取订单统计
   */
  getOrderStats() {
    return request.get('/orders/stats')
  },

  /**
   * 模拟支付订单（开发/测试环境）
   */
  payOrderMock(orderId) {
    return request.post(`/orders/${orderId}/pay-mock`, {}, {
      loading: true,
      loadingText: '支付中...'
    })
  }
}