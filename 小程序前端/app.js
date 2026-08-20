// app.js
const { api } = require('./config/api.js')

// 获取API基础地址
function getApiBase() {
  // 统一使用localhost,开发工具测试
  return 'http://localhost:3000/api'
  
  // 如果要真机预览,请手动改成你的IP:
  // return 'http://10.105.120.132:3000/api'
}

App({
  globalData: {
    userInfo: null,
    token: null,
    apiBase: getApiBase(), // 自动根据环境选择API地址
    cartCount: 0
  },

  onLaunch() {
    console.log('小程序启动')
    
    // 检查登录状态
    this.checkLogin()
  },

  /**
   * 检查登录状态
   */
  checkLogin() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      // 验证token是否有效
      this.validateToken()
    }
  },

  /**
   * 验证token有效性
   */
  async validateToken() {
    try {
      const res = await api.getUserInfo()
      
      if (res.code === 200) {
        this.globalData.userInfo = res.data
        // 更新购物车数量
        this.updateCartCount()
      } else {
        // token失效，清除登录信息
        this.logout()
      }
    } catch (error) {
      console.error('验证token失败:', error)
      this.logout()
    }
  },

  /**
   * 开发环境快速登录
   */
  devLogin() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await api.devLogin()
        
        if (res.code === 200) {
          const { token, userInfo } = res.data
          this.globalData.token = token
          this.globalData.userInfo = userInfo
          wx.setStorageSync('token', token)
          wx.setStorageSync('userInfo', userInfo)
          
          // 更新购物车数量
          this.updateCartCount()
          
          resolve(userInfo)
        } else {
          reject(res.message || '开发登录失败')
        }
      } catch (error) {
        reject(error)
      }
    })
  },

  /**
   * 微信登录
   */
  login() {
    return new Promise((resolve, reject) => {
      wx.showLoading({ title: '登录中...' })
      
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送code到后端换取token
            wx.request({
              url: `${this.globalData.apiBase}/auth/login`,
              method: 'POST',
              data: {
                code: res.code
              },
              success: (response) => {
                wx.hideLoading()
                
                if (response.data.code === 200) {
                  const { token, userInfo } = response.data.data
                  this.globalData.token = token
                  this.globalData.userInfo = userInfo
                  wx.setStorageSync('token', token)
                  wx.setStorageSync('userInfo', userInfo)
                  
                  // 更新购物车数量
                  this.updateCartCount()
                  
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  })
                  
                  resolve(userInfo)
                } else {
                  wx.showToast({
                    title: response.data.message || '登录失败',
                    icon: 'none'
                  })
                  reject(response.data.message)
                }
              },
              fail: (error) => {
                wx.hideLoading()
                wx.showToast({
                  title: '网络请求失败',
                  icon: 'none'
                })
                reject(error)
              }
            })
          } else {
            wx.hideLoading()
            reject('获取code失败')
          }
        },
        fail: (error) => {
          wx.hideLoading()
          reject(error)
        }
      })
    })
  },

  /**
   * 退出登录
   */
  logout() {
    this.globalData.token = null
    this.globalData.userInfo = null
    this.globalData.cartCount = 0
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    // 清除购物车徽标
    wx.removeTabBarBadge({ index: 2 })
  },

  /**
   * 更新购物车数量
   */
  async updateCartCount() {
    const token = this.globalData.token
    if (!token) {
      this.globalData.cartCount = 0
      // 更新自定义TabBar
      this.updateCustomTabBar(0)
      return
    }

    try {
      const res = await api.getCartCount()
      
      if (res.code === 200) {
        this.globalData.cartCount = res.data.count
        // 更新自定义TabBar
        this.updateCustomTabBar(res.data.count)
      }
    } catch (error) {
      console.error('获取购物车数量失败:', error)
    }
  },

  /**
   * 更新自定义TabBar购物车数量
   */
  updateCustomTabBar(count) {
    // 更新全局数据
    this.globalData.cartCount = count
    
    // 获取所有页面
    const pages = getCurrentPages()
    
    // 更新所有页面的TabBar
    pages.forEach(page => {
      if (typeof page.getTabBar === 'function' && page.getTabBar()) {
        page.getTabBar().setData({
          cartCount: count
        })
      }
    })
  }
})
