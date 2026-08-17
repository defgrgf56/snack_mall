// config/api.js - API配置和封装

const API_BASE_URL = 'http://localhost:3000/api'

/**
 * 统一请求方法
 */
function request(options) {
  const app = getApp()
  
  return new Promise((resolve, reject) => {
    // 添加认证头
    const headers = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    // 如果有token，添加到header
    if (app.globalData.token) {
      headers['Authorization'] = `Bearer ${app.globalData.token}`
    }
    
    wx.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      success: (res) => {
        // 成功响应
        if (res.data.code === 200) {
          resolve(res.data)
        }
        // Token过期或未登录
        else if (res.data.code === 401) {
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          })
          
          // 清除登录信息
          app.logout()
          
          // 跳转到登录页或个人中心
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/user/user'
            })
          }, 1500)
          
          reject(res.data)
        }
        // 其他错误
        else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(error)
      }
    })
  })
}

/**
 * API接口定义
 */
const api = {
  // ==================== 认证接口 ====================
  
  /**
   * 微信登录
   */
  login: (code) => {
    return request({
      url: '/auth/login',
      method: 'POST',
      data: { code }
    })
  },
  
  /**
   * 开发环境登录
   */
  devLogin: () => {
    return request({
      url: '/auth/dev-login',
      method: 'POST'
    })
  },
  
  /**
   * 更新用户资料
   */
  updateProfile: (data) => {
    return request({
      url: '/auth/update-profile',
      method: 'POST',
      data
    })
  },
  
  // ==================== 用户接口 ====================
  
  /**
   * 获取用户信息
   */
  getUserInfo: () => {
    return request({
      url: '/user/info'
    })
  },
  
  /**
   * 更新用户信息
   */
  updateUserInfo: (data) => {
    return request({
      url: '/user/info',
      method: 'PUT',
      data
    })
  },
  
  // ==================== 商品接口 ====================
  
  /**
   * 获取商品分类
   */
  getCategories: () => {
    return request({
      url: '/categories'
    })
  },
  
  /**
   * 获取商品列表
   */
  getProducts: (params) => {
    return request({
      url: '/products',
      data: params
    })
  },
  
  /**
   * 获取商品详情
   */
  getProductDetail: (id) => {
    return request({
      url: `/products/${id}`
    })
  },
  
  /**
   * 获取轮播图
   */
  getBanners: () => {
    return request({
      url: '/banners'
    })
  },
  
  // ==================== 购物车接口 ====================
  
  /**
   * 获取购物车列表
   */
  getCart: () => {
    return request({
      url: '/cart'
    })
  },
  
  /**
   * 添加到购物车
   */
  addToCart: (data) => {
    return request({
      url: '/cart/add',
      method: 'POST',
      data
    })
  },
  
  /**
   * 更新购物车商品数量
   */
  updateCartItem: (id, quantity) => {
    return request({
      url: `/cart/${id}`,
      method: 'PUT',
      data: { quantity }
    })
  },
  
  /**
   * 删除购物车商品
   */
  deleteCartItem: (id) => {
    return request({
      url: `/cart/${id}`,
      method: 'DELETE'
    })
  },
  
  /**
   * 批量删除购物车
   */
  batchDeleteCart: (ids) => {
    return request({
      url: '/cart/batch-delete',
      method: 'POST',
      data: { ids }
    })
  },
  
  /**
   * 清空购物车
   */
  clearCart: () => {
    return request({
      url: '/cart/clear',
      method: 'DELETE'
    })
  },
  
  /**
   * 获取购物车数量
   */
  getCartCount: () => {
    return request({
      url: '/cart/count'
    })
  },
  
  /**
   * 购物车结算
   */
  settleCart: (ids) => {
    return request({
      url: `/cart/settle?ids=${ids}`
    })
  },
  
  // ==================== 地址接口 ====================
  
  /**
   * 获取地址列表
   */
  getAddresses: () => {
    return request({
      url: '/addresses'
    })
  },
  
  /**
   * 获取默认地址
   */
  getDefaultAddress: () => {
    return request({
      url: '/addresses/default'
    })
  },
  
  /**
   * 获取地址详情
   */
  getAddressDetail: (id) => {
    return request({
      url: `/addresses/${id}`
    })
  },
  
  /**
   * 创建地址
   */
  createAddress: (data) => {
    return request({
      url: '/addresses',
      method: 'POST',
      data
    })
  },
  
  /**
   * 更新地址
   */
  updateAddress: (id, data) => {
    return request({
      url: `/addresses/${id}`,
      method: 'PUT',
      data
    })
  },
  
  /**
   * 删除地址
   */
  deleteAddress: (id) => {
    return request({
      url: `/addresses/${id}`,
      method: 'DELETE'
    })
  },
  
  /**
   * 设置默认地址
   */
  setDefaultAddress: (id) => {
    return request({
      url: `/addresses/${id}/default`,
      method: 'PUT'
    })
  },
  
  // ==================== 订单接口 ====================
  
  /**
   * 创建订单
   */
  createOrder: (data) => {
    return request({
      url: '/orders',
      method: 'POST',
      data
    })
  },
  
  /**
   * 获取订单列表
   */
  getOrders: (params) => {
    return request({
      url: '/orders',
      data: params
    })
  },
  
  /**
   * 获取订单详情
   */
  getOrderDetail: (id) => {
    return request({
      url: `/orders/${id}`
    })
  },
  
  /**
   * 取消订单
   */
  cancelOrder: (id) => {
    return request({
      url: `/orders/${id}/cancel`,
      method: 'PUT'
    })
  },
  
  /**
   * 确认收货
   */
  confirmOrder: (id) => {
    return request({
      url: `/orders/${id}/receive`,
      method: 'PUT'
    })
  },
  
  /**
   * 删除订单
   */
  deleteOrder: (id) => {
    return request({
      url: `/orders/${id}`,
      method: 'DELETE'
    })
  },
  
  /**
   * 获取订单统计
   */
  getOrderStats: () => {
    return request({
      url: '/orders/stats'
    })
  }
}

module.exports = {
  API_BASE_URL,
  request,
  api
}
