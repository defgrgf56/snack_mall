// services/api/product.js - 商品相关 API

const request = require('../request')

module.exports = {
  /**
   * 获取分类列表
   */
  getCategories() {
    return request.get('/categories', {}, { needAuth: false })
  },

  /**
   * 获取商品列表
   */
  getProducts(params) {
    return request.get('/products', params, { needAuth: false })
  },

  /**
   * 获取商品详情
   */
  getProductDetail(id) {
    return request.get(`/products/${id}`, {}, { needAuth: false })
  },

  /**
   * 获取轮播图
   */
  getBanners() {
    return request.get('/banners', {}, { needAuth: false })
  },

  /**
   * 搜索商品
   */
  searchProducts(keyword, params = {}) {
    return request.get('/products', { keyword, ...params }, { needAuth: false })
  }
}