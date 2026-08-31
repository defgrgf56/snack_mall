// services/auth.service.js - 认证相关接口

import http from './http'

/**
 * 认证服务
 */
export default {
  /**
   * 微信登录
   */
  login(code) {
    return http.post('/auth/login', { code }, {
      needAuth: false,
      showLoading: true,
      loadingText: '登录中...',
    })
  },

  /**
   * 开发环境快速登录
   */
  devLogin() {
    return http.post('/auth/dev-login', {}, {
      needAuth: false,
      showLoading: true,
      loadingText: '登录中...',
    })
  },

  /**
   * 更新用户资料
   */
  updateProfile(data) {
    return http.post('/auth/update-profile', data)
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return http.get('/user/info')
  },

  /**
   * 更新用户信息
   */
  updateUserInfo(data) {
    return http.put('/user/info', data)
  },
}