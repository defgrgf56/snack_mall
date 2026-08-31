// services/api/seckill.js - 秒杀相关API
const request = require('../request')

/**
 * 获取秒杀活动列表
 */
function getSeckills(params) {
  return request.get('/seckills', params, { needAuth: false })
}

/**
 * 获取秒杀详情
 */
function getSeckillDetail(id) {
  return request.get(`/seckills/${id}`, {}, { needAuth: false })
}

/**
 * 参与秒杀
 */
function joinSeckill(seckillId, data) {
  return request.post(`/seckills/${seckillId}/join`, data)
}

module.exports = {
  getSeckills,
  getSeckillDetail,
  joinSeckill
}