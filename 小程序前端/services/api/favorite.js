// services/api/favorite.js - 收藏相关 API

const request = require('../request')

module.exports = {
  /**
   * 获取收藏列表
   */
  async getFavoriteList(params) {
    const result = await request.get('/favorites', params)
    // 适配后端返回格式：将 list 转为 items
    return {
      items: result.list || [],
      pagination: result.pagination
    }
  },

  /**
   * 添加收藏
   */
  addFavorite(productId) {
    return request.post('/favorites', { product_id: productId })
  },

  /**
   * 删除收藏
   */
  deleteFavorite(favoriteId) {
    return request.delete(`/favorites/${favoriteId}`)
  },

  /**
   * 批量删除收藏
   */
  batchDeleteFavorites(ids) {
    return request.post('/favorites/batch-delete', { ids })
  },

  /**
   * 检查是否已收藏
   */
  checkFavorite(productId) {
    return request.get(`/favorites/check/${productId}`)
  }
}