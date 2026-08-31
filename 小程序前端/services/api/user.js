// services/api/user.js - 用户相关 API

const request = require('../request')

module.exports = {
  /**
   * 获取用户信息
   */
  getUserInfo() {
    return request.get('/user/info')
  },

  /**
   * 更新用户信息
   */
  updateUserInfo(data) {
    return request.put('/user/info', data)
  },

  /**
   * 获取订单统计
   */
  getOrderStats() {
    return request.get('/orders/stats')
  }
}