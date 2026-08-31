// store/index.js - 全局状态管理

const { STORAGE_KEY } = require('../constants/index')
const logger = require('../utils/logger')

class Store {
  constructor() {
    this.state = {
      // 用户信息
      userInfo: null,
      token: null,
      
      // 购物车
      cartCount: 0,
      
      // 系统信息
      systemInfo: null
    }
    
    // 监听器
    this.listeners = new Map()
    
    // 初始化
    this.init()
  }

  /**
   * 初始化状态
   */
  init() {
    // 从本地存储恢复状态
    this.state.token = wx.getStorageSync(STORAGE_KEY.TOKEN) || null
    this.state.userInfo = wx.getStorageSync(STORAGE_KEY.USER_INFO) || null
    
    // 获取系统信息
    this.state.systemInfo = wx.getSystemInfoSync()
    
    logger.info('Store 初始化完成', this.state)
  }

  /**
   * 获取状态
   */
  getState(key) {
    return key ? this.state[key] : this.state
  }

  /**
   * 设置状态
   */
  setState(updates) {
    const oldState = { ...this.state }
    
    Object.keys(updates).forEach(key => {
      this.state[key] = updates[key]
    })
    
    logger.info('State 更新:', updates)
    
    // 通知监听器
    this.notify(oldState, this.state)
  }

  /**
   * 订阅状态变化
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key).add(callback)
    
    // 返回取消订阅函数
    return () => {
      this.listeners.get(key)?.delete(callback)
    }
  }

  /**
   * 通知监听器
   */
  notify(oldState, newState) {
    Object.keys(newState).forEach(key => {
      if (oldState[key] !== newState[key]) {
        const listeners = this.listeners.get(key)
        if (listeners) {
          listeners.forEach(callback => {
            callback(newState[key], oldState[key])
          })
        }
      }
    })
  }

  // ========== 用户相关 ==========

  /**
   * 获取 Token
   */
  getToken() {
    return this.state.token
  }

  /**
   * 设置登录信息
   */
  setAuth(token, userInfo) {
    this.setState({ token, userInfo })
    
    // 持久化到本地
    wx.setStorageSync(STORAGE_KEY.TOKEN, token)
    wx.setStorageSync(STORAGE_KEY.USER_INFO, userInfo)
    
    logger.info('登录成功', { userInfo })
  }

  /**
   * 更新用户信息
   */
  setUserInfo(userInfo) {
    this.setState({ userInfo })
    wx.setStorageSync(STORAGE_KEY.USER_INFO, userInfo)
  }

  /**
   * 退出登录
   */
  logout() {
    this.setState({
      token: null,
      userInfo: null,
      cartCount: 0
    })
    
    // 清除本地存储
    wx.removeStorageSync(STORAGE_KEY.TOKEN)
    wx.removeStorageSync(STORAGE_KEY.USER_INFO)
    
    // 清除购物车徽标
    wx.removeTabBarBadge({ index: 2 }).catch(() => {})
    
    logger.info('已退出登录')
  }

  /**
   * 检查登录状态
   */
  isLoggedIn() {
    return !!this.state.token
  }

  // ========== 购物车相关 ==========

  /**
   * 更新购物车数量
   */
  async updateCartCount() {
    if (!this.isLoggedIn()) {
      this.setCartCount(0)
      return
    }

    try {
      const api = require('../services/api/index')
      const result = await api.cart.getCartCount()
      this.setCartCount(result.count || 0)
    } catch (error) {
      logger.error('更新购物车数量失败', error)
    }
  }

  /**
   * 设置购物车数量
   */
  setCartCount(count) {
    this.setState({ cartCount: count })
    
    // 更新 TabBar 徽标
    if (count > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: count > 99 ? '99+' : String(count)
      }).catch(() => {})
    } else {
      wx.removeTabBarBadge({ index: 2 }).catch(() => {})
    }
    
    // 更新自定义 TabBar
    this.updateCustomTabBar(count)
  }

  /**
   * 更新自定义 TabBar
   */
  updateCustomTabBar(count) {
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (typeof page.getTabBar === 'function' && page.getTabBar()) {
        page.getTabBar().setData({
          cartCount: count
        })
      }
    })
  }
}

module.exports = Store