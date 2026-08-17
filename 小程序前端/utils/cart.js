// utils/cart.js - 购物车相关工具函数

const { api } = require('../config/api.js')
const { requireLogin } = require('./auth.js')

/**
 * 添加到购物车
 */
async function addToCart(productId, quantity = 1) {
  // 检查登录
  if (!requireLogin()) {
    return false
  }
  
  try {
    wx.showLoading({ title: '加入购物车...' })
    
    const res = await api.addToCart({
      product_id: productId,
      quantity: quantity
    })
    
    wx.hideLoading()
    
    if (res.code === 200) {
      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      })
      
      // 更新购物车数量
      const app = getApp()
      app.updateCartCount()
      
      return true
    } else {
      wx.showToast({
        title: res.message || '加入失败',
        icon: 'none'
      })
      return false
    }
  } catch (error) {
    wx.hideLoading()
    wx.showToast({
      title: '加入失败',
      icon: 'none'
    })
    return false
  }
}

/**
 * 更新购物车商品数量
 */
async function updateCartItemQuantity(cartId, quantity) {
  try {
    const res = await api.updateCartItem(cartId, quantity)
    
    if (res.code === 200) {
      // 更新购物车数量
      const app = getApp()
      app.updateCartCount()
      return true
    } else {
      wx.showToast({
        title: res.message || '更新失败',
        icon: 'none'
      })
      return false
    }
  } catch (error) {
    wx.showToast({
      title: '更新失败',
      icon: 'none'
    })
    return false
  }
}

/**
 * 删除购物车商品
 */
async function deleteCartItem(cartId) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '提示',
      content: '确定要删除这个商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' })
            
            const result = await api.deleteCartItem(cartId)
            
            wx.hideLoading()
            
            if (result.code === 200) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 更新购物车数量
              const app = getApp()
              app.updateCartCount()
              
              resolve(true)
            } else {
              wx.showToast({
                title: result.message || '删除失败',
                icon: 'none'
              })
              resolve(false)
            }
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
            resolve(false)
          }
        } else {
          resolve(false)
        }
      }
    })
  })
}

/**
 * 批量删除购物车
 */
async function batchDeleteCart(cartIds) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '提示',
      content: `确定要删除选中的${cartIds.length}个商品吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' })
            
            const result = await api.batchDeleteCart(cartIds)
            
            wx.hideLoading()
            
            if (result.code === 200) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 更新购物车数量
              const app = getApp()
              app.updateCartCount()
              
              resolve(true)
            } else {
              wx.showToast({
                title: result.message || '删除失败',
                icon: 'none'
              })
              resolve(false)
            }
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
            resolve(false)
          }
        } else {
          resolve(false)
        }
      }
    })
  })
}

/**
 * 清空购物车
 */
async function clearCart() {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空购物车吗？此操作不可恢复',
      confirmText: '清空',
      confirmColor: '#ff6b00',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '清空中...' })
            
            const result = await api.clearCart()
            
            wx.hideLoading()
            
            if (result.code === 200) {
              wx.showToast({
                title: '已清空购物车',
                icon: 'success'
              })
              
              // 更新购物车数量
              const app = getApp()
              app.updateCartCount()
              
              resolve(true)
            } else {
              wx.showToast({
                title: result.message || '清空失败',
                icon: 'none'
              })
              resolve(false)
            }
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '清空失败',
              icon: 'none'
            })
            resolve(false)
          }
        } else {
          resolve(false)
        }
      }
    })
  })
}

/**
 * 获取购物车列表
 */
async function getCartList() {
  if (!requireLogin()) {
    return []
  }
  
  try {
    const res = await api.getCart()
    
    if (res.code === 200) {
      return res.data || []
    } else {
      return []
    }
  } catch (error) {
    return []
  }
}

/**
 * 计算购物车总价
 */
function calculateTotal(cartItems, selectedIds = []) {
  let total = 0
  let count = 0
  
  cartItems.forEach(item => {
    if (selectedIds.length === 0 || selectedIds.includes(item.id)) {
      if (item.selected !== false) {
        total += parseFloat(item.product.price) * item.quantity
        count += item.quantity
      }
    }
  })
  
  return {
    total: total.toFixed(2),
    count: count
  }
}

module.exports = {
  addToCart,
  updateCartItemQuantity,
  deleteCartItem,
  batchDeleteCart,
  clearCart,
  getCartList,
  calculateTotal
}
