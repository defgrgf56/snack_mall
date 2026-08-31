// services/api/activity.js - 活动相关API
const request = require('../request')

/**
 * 获取活动列表
 */
function getActivities(params) {
  return request.get('/activities', params, { needAuth: false })
}

/**
 * 获取活动详情
 */
function getActivityDetail(id) {
  return request.get(`/activities/${id}`, {}, { needAuth: false })
}

/**
 * 获取活动商品列表
 */
function getActivityProducts(id, params) {
  return request.get(`/activities/${id}/products`, params, { needAuth: false })
}

module.exports = {
  getActivities,
  getActivityDetail,
  getActivityProducts
}