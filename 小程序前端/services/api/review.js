// services/api/review.js - 评价相关 API

const request = require('../request')

module.exports = {
  /**
   * 获取待评价订单商品列表
   */
  getPendingReviews() {
    return request.get('/reviews/pending')
  },

  /**
   * 获取商品评价列表
   */
  getProductReviews(productId, params) {
    return request.get(`/reviews/product/${productId}`, params)
  },

  /**
   * 获取商品评价统计
   */
  getReviewStats(productId) {
    return request.get(`/reviews/product/${productId}/stats`)
  },

  /**
   * 创建评价
   */
  createReview(data) {
    return request.post('/reviews', data)
  },

  /**
   * 点赞评价
   */
  likeReview(reviewId) {
    return request.post(`/reviews/${reviewId}/like`)
  }
}