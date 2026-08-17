// pages/product-detail/product-detail.js
const { api } = require('../../config/api.js')
const { addToCart } = require('../../utils/cart.js')
const { formatPrice } = require('../../utils/format.js')

Page({
  data: {
    productId: null,
    product: null,
    quantity: 1,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ productId: options.id })
      this.loadProductDetail()
    } else {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow() {
    // 更新购物车数量
    const app = getApp()
    app.updateCartCount()
  },

  /**
   * 加载商品详情
   */
  async loadProductDetail() {
    this.setData({ loading: true })
    
    try {
      const res = await api.getProductDetail(this.data.productId)
      
      if (res.code === 200) {
        // 处理图片数组
        let images = []
        if (res.data.images) {
          images = typeof res.data.images === 'string' 
            ? JSON.parse(res.data.images) 
            : res.data.images
        }
        if (images.length === 0 && res.data.cover) {
          images = [res.data.cover]
        }
        
        this.setData({
          product: {
            ...res.data,
            images: images
          },
          loading: false
        })
      } else {
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('加载商品详情失败', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  /**
   * 数量减少
   */
  handleMinus() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      })
    }
  },

  /**
   * 数量增加
   */
  handlePlus() {
    const { product, quantity } = this.data
    
    if (quantity >= product.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      quantity: quantity + 1
    })
  },

  /**
   * 输入数量
   */
  handleQuantityInput(e) {
    const value = parseInt(e.detail.value) || 1
    const { product } = this.data
    
    if (value < 1) {
      this.setData({ quantity: 1 })
    } else if (value > product.stock) {
      this.setData({ quantity: product.stock })
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
    } else {
      this.setData({ quantity: value })
    }
  },

  /**
   * 加入购物车
   */
  async handleAddToCart() {
    const { productId, quantity } = this.data
    
    const success = await addToCart(productId, quantity)
    
    if (success) {
      // 重置数量
      this.setData({ quantity: 1 })
    }
  },

  /**
   * 立即购买
   */
  async handleBuyNow() {
    const { productId, quantity } = this.data
    
    // 先加入购物车
    const success = await addToCart(productId, quantity)
    
    if (success) {
      // 跳转到购物车
      wx.switchTab({
        url: '/pages/cart/cart'
      })
    }
  },

  /**
   * 返回首页
   */
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 跳转购物车
   */
  goCart() {
    wx.switchTab({
      url: '/pages/cart/cart'
    })
  },

  /**
   * 分享商品
   */
  onShareAppMessage() {
    const { product } = this.data
    return {
      title: product.name,
      path: `/pages/product-detail/product-detail?id=${product.id}`,
      imageUrl: product.cover
    }
  }
})
