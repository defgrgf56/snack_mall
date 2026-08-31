// services/cart.service.js - 购物车相关接口

import http from './http'

/**
 * 购物车服务
 */
export default {
  /**
   * 获取购物车列表
   */
  getCart() {
    return http.get('/cart')
  },

  /**
   * 添加到购物车
   */
  addToCart(data) {
    return http.post('/cart/add', data, { showLoading: true, loadingText: '加入购物车...' })
  },

  /**
   * 更新购物车商品数量
   */
  updateCartItem(id, quantity) {
    return http.put(`/cart/${id}`, { quantity })
  },

  /**
   * 删除购物车商品
   */
  deleteCartItem(id) {
    return http.delete(`/cart/${id}`, {}, { showLoading: true, loadingText: '删除中...' })
  },

  /**
   * 批量删除购物车
   */
  batchDeleteCart(ids) {
    return http.post('/cart/batch-delete', { ids }, { showLoading: true, loadingText: '删除中...' })
  },

  /**
   * 清空购物车
   */
  clearCart() {
    return http.delete('/cart/clear', {}, { showLoading: true, loadingText: '清空中...' })
  },

  /**
   * 获取购物车数量
   */
  getCartCount() {
    return http.get('/cart/count')
  },

  /**
   * 购物车结算
   */
  settleCart(ids) {
    return http.get(`/cart/settle?ids=${ids}`)
  },
}