// utils/auth.js - 认证相关工具函数

const { api } = require('../config/api.js')

/**
 * 检查登录状态
 */
function checkLogin() {
  const app = getApp()
  return !!app.globalData.token
}

/**
 * 需要登录才能执行的操作
 */
function requireLogin(callback) {
  if (checkLogin()) {
    callback && callback()
    return true
  } else {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/user/user'
          })
        }
      }
    })
    return false
  }
}

/**
 * 开发环境快速登录
 */
async function quickLogin() {
  const app = getApp()
  
  try {
    wx.showLoading({ title: '登录中...' })
    
    const res = await api.devLogin()
    
    if (res.code === 200) {
      const { token, userInfo } = res.data
      
      // 保存登录信息
      app.globalData.token = token
      app.globalData.userInfo = userInfo
      wx.setStorageSync('token', token)
      wx.setStorageSync('userInfo', userInfo)
      
      // 更新购物车数量
      app.updateCartCount()
      
      wx.hideLoading()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      return userInfo
    } else {
      wx.hideLoading()
      wx.showToast({
        title: res.message || '登录失败',
        icon: 'none'
      })
      throw new Error(res.message)
    }
  } catch (error) {
    wx.hideLoading()
    wx.showToast({
      title: '登录失败',
      icon: 'none'
    })
    throw error
  }
}

/**
 * 微信登录
 */
async function wxLogin() {
  const app = getApp()
  
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '登录中...' })
    
    wx.login({
      success: async (loginRes) => {
        if (loginRes.code) {
          try {
            const res = await api.login(loginRes.code)
            
            if (res.code === 200) {
              const { token, userInfo } = res.data
              
              // 保存登录信息
              app.globalData.token = token
              app.globalData.userInfo = userInfo
              wx.setStorageSync('token', token)
              wx.setStorageSync('userInfo', userInfo)
              
              // 更新购物车数量
              app.updateCartCount()
              
              wx.hideLoading()
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })
              
              resolve(userInfo)
            } else {
              wx.hideLoading()
              wx.showToast({
                title: res.message || '登录失败',
                icon: 'none'
              })
              reject(res.message)
            }
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
            reject(error)
          }
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
}

/**
 * 退出登录
 */
function logout() {
  const app = getApp()
  
  wx.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        app.logout()
        
        wx.showToast({
          title: '已退出登录',
          icon: 'success'
        })
        
        // 刷新当前页面
        setTimeout(() => {
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          if (currentPage.onLoad) {
            currentPage.onLoad()
          }
        }, 1000)
      }
    }
  })
}

module.exports = {
  checkLogin,
  requireLogin,
  quickLogin,
  wxLogin,
  logout
}
