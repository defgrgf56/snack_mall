// services/api/auth.js - 认证相关 API

const request = require('../request')

module.exports = {
  /**
   * 微信登录
   */
  login(code) {
    return request.post('/auth/login', { code }, {
      needAuth: false,
      loading: true,
      loadingText: '登录中...'
    })
  },

  /**
   * 开发环境快速登录
   */
  devLogin() {
    return request.post('/auth/dev-login', {}, {
      needAuth: false,
      loading: true,
      loadingText: '登录中...'
    })
  },

  /**
   * 更新用户资料
   */
  updateProfile(data) {
    return request.post('/auth/update-profile', data)
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return request.get('/user/info')
  }
}