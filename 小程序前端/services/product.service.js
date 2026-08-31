// services/product.service.js - 商品相关接口

import http from './http'

/**
 * 商品服务
 */
export default {
  /**
   * 获取商品分类
   */
  getCategories() {
    return http.get('/categories', {}, { needAuth: false })
  },

  /**
   * 获取商品列表
   */
  getProducts(params = {}) {
    return http.get('/products', params, { needAuth: false })
  },

  /**
   * 获取商品详情
   */
  getProductDetail(id) {
    return http.get(`/products/${id}`, {}, { needAuth: false })
  },

  /**
   * 获取轮播图
   */
  getBanners() {
    return http.get('/banners', {}, { needAuth: false })
  },

  /**
   * 搜索商品
   */
  searchProducts(keyword, params = {}) {
    return http.get('/products/search', { keyword, ...params }, { needAuth: false })
  },

  /**
   * 获取热门搜索
   */
  getHotSearch() {
    return http.get('/search/hot', {}, { needAuth: false })
  },

  /**
   * 获取搜索历史
   */
  getSearchHistory() {
    return http.get('/search/history')
  },

  /**
   * 添加搜索历史
   */
  addSearchHistory(keyword) {
    return http.post('/search/history', { keyword })
  },

  /**
   * 清空搜索历史
   */
  clearSearchHistory() {
    return http.delete('/search/history')
  },
}