// services/api/review.js - 评价API
const request = require('../request')

/**
 * 提交评价
 */
const submitReview = (data) => {
  return request({
    url: '/reviews',
    method: 'POST',
    data
  })
}

/**
 * 获取商品评价列表
 */
const getProductReviews = (productId, params = {}) => {
  return request({
    url: `/reviews/product/${productId}`,
    method: 'GET',
    data: params
  })
}

/**
 * 获取商品评价统计
 */
const getProductReviewStats = (productId) => {
  return request({
    url: `/reviews/product/${productId}/stats`,
    method: 'GET'
  })
}

/**
 * 获取待评价订单商品列表
 */
const getPendingReviews = () => {
  return request({
    url: '/reviews/pending',
    method: 'GET'
  })
}

/**
 * 获取我的评价列表
 */
const getMyReviews = (params = {}) => {
  return request({
    url: '/reviews/my',
    method: 'GET',
    data: params
  })
}

module.exports = {
  submitReview,
  getProductReviews,
  getProductReviewStats,
  getPendingReviews,
  getMyReviews
}