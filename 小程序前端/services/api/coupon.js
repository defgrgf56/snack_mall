// services/api/coupon.js - 优惠券相关API
const request = require('../request')

/**
 * 获取可领取的优惠券列表
 */
function getAvailableCoupons(params) {
  return request.get('/coupons/available', params, { needAuth: false })
}

/**
 * 获取我的优惠券
 * @param {Object} params - { status: 0|1|2 } 0:未使用 1:已使用 2:已过期
 */
function getMyCoupons(params) {
  return request.get('/coupons/my', params)
}

/**
 * 领取优惠券
 * @param {Number} couponId - 优惠券ID
 */
function receiveCoupon(couponId) {
  return request.post(`/coupons/${couponId}/receive`)
}

module.exports = {
  getAvailableCoupons,
  getMyCoupons,
  receiveCoupon
}