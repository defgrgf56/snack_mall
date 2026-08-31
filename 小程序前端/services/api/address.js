// services/api/address.js - 地址相关 API

const request = require('../request')

module.exports = {
  /**
   * 获取地址列表
   */
  getAddressList() {
    return request.get('/addresses')
  },

  /**
   * 获取默认地址
   */
  getDefaultAddress() {
    return request.get('/addresses/default')
  },

  /**
   * 获取地址详情
   */
  getAddressDetail(id) {
    return request.get(`/addresses/${id}`)
  },

  /**
   * 创建地址
   */
  createAddress(data) {
    return request.post('/addresses', data)
  },

  /**
   * 更新地址
   */
  updateAddress(id, data) {
    return request.put(`/addresses/${id}`, data)
  },

  /**
   * 删除地址
   */
  deleteAddress(id) {
    return request.delete(`/addresses/${id}`)
  },

  /**
   * 设置默认地址
   */
  setDefaultAddress(id) {
    return request.put(`/addresses/${id}/default`)
  }
}