// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    apiBase: 'http://localhost:3000/api', // 后端API地址
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
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${this.globalData.apiBase}/user/info`,
          header: {
            'Authorization': `Bearer ${this.globalData.token}`
          },
          success: resolve,
          fail: reject
        })
      })
      
      if (res.data.code === 200) {
        this.globalData.userInfo = res.data.data
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
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.apiBase}/auth/dev-login`,
        method: 'POST',
        success: (response) => {
          if (response.data.code === 200) {
            const { token, userInfo } = response.data.data
            this.globalData.token = token
            this.globalData.userInfo = userInfo
            wx.setStorageSync('token', token)
            wx.setStorageSync('userInfo', userInfo)
            resolve(userInfo)
          } else {
            reject(response.data.message || '开发登录失败')
          }
        },
        fail: reject
      })
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
  updateCartCount() {
    const token = this.globalData.token
    if (!token) {
      this.globalData.cartCount = 0
      return
    }

    wx.request({
      url: `${this.globalData.apiBase}/cart/count`,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.globalData.cartCount = res.data.data.count
          // 更新tabBar徽标
          if (this.globalData.cartCount > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: String(this.globalData.cartCount)
            })
          } else {
            wx.removeTabBarBadge({
              index: 2
            })
          }
        }
      }
    })
  }
})
