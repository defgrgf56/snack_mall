// pages/product-detail/product-detail.js - 重构后的商品详情页
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    productId: null,
    product: null,
    quantity: 1,
    isFavorited: false,
    favoriteId: null
  },

  onLoad(options) {
    if (!options.id) {
      errorHandler.handle(new Error('商品不存在'))
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({ productId: options.id })
    this.loadProductDetail()
    this.checkFavoriteStatus()
  },

  /**
   * 加载商品详情
   */
  async loadProductDetail() {
    try {
      const product = await this.loadData(
        () => app.api.product.getProductDetail(this.data.productId),
        { showLoading: true }
      )

      // 处理图片数组
      let images = []
      if (product.images) {
        images = typeof product.images === 'string' 
          ? JSON.parse(product.images) 
          : product.images
      }
      if (images.length === 0 && product.cover) {
        images = [product.cover]
      }

      this.setData({
        product: {
          ...product,
          images
        }
      })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 检查收藏状态
   */
  async checkFavoriteStatus() {
    if (!app.store.isLoggedIn()) return

    try {
      const result = await app.api.favorite.checkFavorite(this.data.productId)
      this.setData({
        isFavorited: result.is_favorited,
        favoriteId: result.favorite_id
      })
    } catch (error) {
      // 静默失败
    }
  },

  /**
   * 数量减少
   */
  handleMinus() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },

  /**
   * 数量增加
   */
  handlePlus() {
    const { product, quantity } = this.data

    if (quantity >= product.stock) {
      errorHandler.handle(new Error('库存不足'))
      return
    }

    this.setData({ quantity: quantity + 1 })
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
      errorHandler.handle(new Error('库存不足'))
    } else {
      this.setData({ quantity: value })
    }
  },

  /**
   * 加入购物车
   */
  async handleAddToCart() {
    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    const { productId, quantity } = this.data

    try {
      await app.api.cart.addToCart(productId, quantity)
      errorHandler.showSuccess('已加入购物车')
      app.store.updateCartCount()
      
      // 重置数量
      this.setData({ quantity: 1 })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 立即购买
   */
  async handleBuyNow() {
    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    const { productId, quantity } = this.data

    try {
      await app.api.cart.addToCart(productId, quantity)
      wx.switchTab({ url: '/pages/cart/cart' })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 收藏/取消收藏
   */
  async handleFavorite() {
    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    try {
      if (this.data.isFavorited) {
        // 取消收藏
        await app.api.favorite.deleteFavorite(this.data.favoriteId)
        this.setData({ isFavorited: false, favoriteId: null })
        errorHandler.showSuccess('取消收藏')
      } else {
        // 添加收藏
        const result = await app.api.favorite.addFavorite(this.data.productId)
        this.setData({ 
          isFavorited: true,
          favoriteId: result.id || result.favorite_id
        })
        errorHandler.showSuccess('收藏成功')
      }
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 返回首页
   */
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  /**
   * 跳转购物车
   */
  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' })
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
}))