// pages/product-detail/product-detail.js
const { api } = require('../../config/api.js')
const { addToCart } = require('../../utils/cart.js')
const { formatPrice } = require('../../utils/format.js')

Page({
  data: {
    productId: null,
    product: null,
    quantity: 1,
    loading: true,
    isFavorited: false, // 是否已收藏
    favoriteId: null    // 收藏ID
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ productId: options.id })
      this.loadProductDetail()
      this.checkFavoriteStatus() // 检查收藏状态
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
   * 检查收藏状态
   */
  async checkFavoriteStatus() {
    const app = getApp();
    if (!app.globalData.token) {
      return;
    }

    try {
      const { request } = require('../../utils/request');
      const res = await request(`/favorites/check/${this.data.productId}`, 'GET', {}, true);

      this.setData({
        isFavorited: res.is_favorited || false,
        favoriteId: res.favorite_id || null
      });
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  /**
   * 收藏/取消收藏
   */
  async handleFavorite() {
    const app = getApp();
    if (!app.globalData.token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    try {
      const { request } = require('../../utils/request');
      
      if (this.data.isFavorited) {
        // 取消收藏
        await request(`/favorites/product/${this.data.productId}`, 'DELETE', {}, true);

        this.setData({
          isFavorited: false,
          favoriteId: null
        });
        wx.showToast({
          title: '取消收藏',
          icon: 'success'
        });
      } else {
        // 添加收藏
        await request('/favorites', 'POST', {
          product_id: this.data.productId
        }, true);

        this.setData({
          isFavorited: true
        });
        wx.showToast({
          title: '收藏成功',
          icon: 'success'
        });
        // 重新检查收藏状态获取ID
        this.checkFavoriteStatus();
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
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
