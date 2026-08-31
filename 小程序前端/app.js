// app.js - 重构后的应用入口

const Store = require('./store/index')
const api = require('./services/api/index')
const logger = require('./utils/logger')

App({
  // 全局状态管理
  store: null,
  
  // 全局 API 服务
  api: api,

  onLaunch(options) {
    logger.info('小程序启动', options)
    
    // 初始化状态管理
    this.store = new Store()
    
    // 延迟检查登录状态，确保 app 完全初始化
    setTimeout(() => {
      this.checkLoginStatus()
    }, 100)
  },

  onShow(options) {
    logger.info('小程序显示', options)
  },

  onHide() {
    logger.info('小程序隐藏')
  },

  onError(error) {
    logger.error('小程序错误', error)
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    if (!this.store.isLoggedIn()) {
      logger.info('未登录')
      return
    }

    try {
      // 验证 token 有效性
      const userInfo = await api.auth.getUserInfo()
      this.store.setUserInfo(userInfo)
      
      // 更新购物车数量
      this.store.updateCartCount()
      
      logger.info('登录状态有效', userInfo)
    } catch (error) {
      logger.error('Token 验证失败', error)
      // Token 失效会由 errorHandler 自动处理
    }
  },

  /**
   * 开发环境快速登录
   */
  async devLogin() {
    try {
      const result = await api.auth.devLogin()
      this.store.setAuth(result.token, result.userInfo)
      this.store.updateCartCount()
      
      return result.userInfo
    } catch (error) {
      throw error
    }
  },

  /**
   * 微信登录
   */
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: async (res) => {
          if (!res.code) {
            reject(new Error('获取 code 失败'))
            return
          }

          try {
            const result = await api.auth.login(res.code)
            this.store.setAuth(result.token, result.userInfo)
            this.store.updateCartCount()
            
            resolve(result.userInfo)
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  /**
   * 退出登录
   */
  logout() {
    this.store.logout()
  },

  /**
   * 更新购物车数量
   */
  updateCartCount() {
    return this.store.updateCartCount()
  }
})