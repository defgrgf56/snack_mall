// services/api/refund.js - 退款相关 API

const request = require('../request')

module.exports = {
  /**
   * 获取退款列表
   */
  async getRefundList(params) {
    const result = await request.get('/refunds', params)
    // 适配后端返回格式：将 list 转为 items
    return {
      items: result.list || [],
      pagination: result.pagination
    }
  },

  /**
   * 获取退款详情
   */
  getRefundDetail(refundId) {
    return request.get(`/refunds/${refundId}`)
  },

  /**
   * 创建退款申请
   */
  createRefund(data) {
    return request.post('/refunds', data, {
      loading: true,
      loadingText: '提交中...'
    })
  },

  /**
   * 取消退款
   */
  cancelRefund(refundId) {
    return request.put(`/refunds/${refundId}/cancel`)
  }
}