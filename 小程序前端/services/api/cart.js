// services/api/cart.js - 购物车相关 API

const request = require('../request')

module.exports = {
  /**
   * 获取购物车列表
   */
  getCart() {
    return request.get('/cart')
  },

  /**
   * 获取购物车数量
   */
  getCartCount() {
    return request.get('/cart/count')
  },

  /**
   * 添加到购物车
   * 支持两种调用方式：
   * 1. addToCart(productId, quantity) - 传统方式
   * 2. addToCart({ product_id, quantity }) - 对象方式
   */
  addToCart(productIdOrData, quantity) {
    let requestData
    
    if (typeof productIdOrData === 'object') {
      // 对象方式
      requestData = {
        product_id: productIdOrData.product_id,
        quantity: productIdOrData.quantity
      }
    } else {
      // 传统方式
      requestData = {
        product_id: productIdOrData,
        quantity: quantity
      }
    }
    
    return request.post('/cart/add', requestData)
  },

  /**
   * 更新购物车商品数量
   */
  updateCartItem(cartId, quantity) {
    return request.put(`/cart/${cartId}`, { quantity })
  },

  /**
   * 更新购物车选中状态
   */
  updateCartSelected(cartId, selected) {
    return request.put(`/cart/${cartId}/selected`, { selected })
  },

  /**
   * 批量更新购物车选中状态
   */
  batchUpdateCartSelected(cartIds, selected) {
    return request.put('/cart/batch-selected', { ids: cartIds, selected })
  },

  /**
   * 删除购物车商品
   */
  deleteCartItem(cartId) {
    return request.delete(`/cart/${cartId}`)
  },

  /**
   * 批量删除购物车
   */
  batchDeleteCart(cartIds) {
    return request.post('/cart/batch-delete', { ids: cartIds })
  },

  /**
   * 清空购物车
   */
  clearCart() {
    return request.delete('/cart/clear')
  },

  /**
   * 购物车结算
   */
  settle(cartIds) {
    // 支持字符串和数组两种格式
    const ids = Array.isArray(cartIds) ? cartIds.join(',') : cartIds
    return request.get('/cart/settle', { ids })
  }
}