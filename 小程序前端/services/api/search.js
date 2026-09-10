// services/api/search.js - 搜索相关API
const request = require('../request')

/**
 * 获取搜索建议
 */
function getSearchSuggestions(params) {
  return request.get('/search/suggestions', params, { needAuth: false })
}

/**
 * 获取热门搜索词
 */
function getHotKeywords() {
  return request.get('/search/hot', {}, { needAuth: false })
}

/**
 * 搜索商品
 */
function searchProducts(params) {
  return request.get('/search/products', params, { needAuth: false })
}

/**
 * 获取搜索历史
 */
function getSearchHistory() {
  return request.get('/search/history', {}, { needAuth: true })
}

/**
 * 保存搜索历史
 */
function saveSearchHistory(keyword) {
  return request.post('/search/history', { keyword }, { needAuth: true })
}

/**
 * 清空搜索历史
 */
function clearSearchHistory() {
  return request.delete('/search/history', {}, { needAuth: true })
}

/**
 * 删除单条搜索历史
 */
function deleteSearchHistory(id) {
  return request.delete(`/search/history/${id}`, {}, { needAuth: true })
}

module.exports = {
  getSearchSuggestions,
  getHotKeywords,
  searchProducts,
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  deleteSearchHistory
}