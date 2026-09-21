// services/api/review.js - 评价API
const request = require('../request')

/**
 * 提交评价
 */
const submitReview = (data) => {
  return request.post('/reviews', data)
}

/**
 * 获取商品评价列表
 */
const getProductReviews = (productId, params = {}) => {
  return request.get(`/reviews/product/${productId}`, params)
}

/**
 * 获取商品评价统计
 */
const getProductReviewStats = (productId) => {
  return request.get(`/reviews/product/${productId}/stats`)
}

/**
 * 获取待评价订单商品列表
 */
const getPendingReviews = () => {
  return request.get('/reviews/pending')
}

/**
 * 获取我的评价列表
 */
const getMyReviews = (params = {}) => {
  return request.get('/reviews/my', params)
}

/**
 * 点赞评价
 */
const likeReview = (reviewId) => {
  return request.post(`/reviews/${reviewId}/like`)
}

module.exports = {
  submitReview,
  getProductReviews,
  getProductReviewStats,
  getPendingReviews,
  getMyReviews,
  likeReview
}