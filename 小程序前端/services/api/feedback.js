// services/api/feedback.js - 意见反馈API
const request = require('../request')

/**
 * 提交反馈
 */
function submitFeedback(data) {
  return request.post('/feedbacks', data)
}

/**
 * 获取反馈列表
 */
function getFeedbackList(params) {
  return request.get('/feedbacks', params).then(res => {
    // 适配数据格式
    if (res.list) {
      return { items: res.list, ...res }
    }
    return res
  })
}

/**
 * 获取反馈详情
 */
function getFeedbackDetail(id) {
  return request.get(`/feedbacks/${id}`)
}

/**
 * 删除反馈
 */
function deleteFeedback(id) {
  return request.delete(`/feedbacks/${id}`)
}

module.exports = {
  submitFeedback,
  getFeedbackList,
  getFeedbackDetail,
  deleteFeedback
}