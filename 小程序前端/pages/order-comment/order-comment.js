// pages/order-comment/order-comment.js - 重构后：接入 page-mixin，统一状态管理
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    orderId: null,
    orderItems: [],
    submitting: false,
    safeAreaBottom: 0
  },

  onLoad(options) {
    const { orderId } = options

    if (!orderId) {
      errorHandler.handle(new Error('订单ID不能为空'))
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({ orderId })
    this._setSafeArea()
    this.loadOrderItems()
  },

  /**
   * 安全区适配
   */
  _setSafeArea() {
    const sysInfo = app.store.getState('systemInfo')
    const bottom = sysInfo?.safeArea
      ? sysInfo.screenHeight - sysInfo.safeArea.bottom
      : 0
    this.setData({ safeAreaBottom: bottom })
  },

  /**
   * 加载订单商品
   */
  async loadOrderItems() {
    try {
      const order = await this.loadData(
        () => app.api.order.getOrderDetail(this.data.orderId),
        { showLoading: true }
      )

      // 过滤出未评价的商品
      const orderItems = order.items
        .filter(item => !item.is_reviewed)
        .map(item => ({
          id: item.id,
          product_id: item.product_id,
          product: item.product,
          price: item.price,
          quantity: item.quantity,
          rating: 5,
          content: '',
          images: [],
          is_anonymous: false
        }))

      if (orderItems.length === 0) {
        errorHandler.handle(new Error('没有待评价的商品'))
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }

      this.setData({ orderItems })
    } catch (error) {
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  /**
   * 星级评分点击
   */
  onRatingTap(e) {
    const { itemId, rating } = e.currentTarget.dataset
    const key = `orderItems[${this._findIndex(itemId)}].rating`
    this.setData({ [key]: parseInt(rating) })
  },

  /**
   * 评价内容输入
   */
  onContentInput(e) {
    const { itemId } = e.currentTarget.dataset
    const key = `orderItems[${this._findIndex(itemId)}].content`
    this.setData({ [key]: e.detail.value })
  },

  /**
   * 上传图片
   */
  async onUploadImage(e) {
    const { itemId } = e.currentTarget.dataset
    const idx = this._findIndex(itemId)
    const item = this.data.orderItems[idx]
    const remainCount = 6 - item.images.length

    try {
      const res = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: remainCount,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        })
      })

      errorHandler.showLoading('上传中...')

      const request = require('../../services/request')
      const { API_BASE_URL } = require('../../config/env')

      const images = [...item.images]
      for (const filePath of res.tempFilePaths) {
        try {
          const uploadRes = await request.upload(filePath)
          const fullUrl = API_BASE_URL.replace('/api', '') + uploadRes.url
          images.push(fullUrl)
        } catch (err) {
          console.error('上传图片失败:', err)
        }
      }

      const key = `orderItems[${idx}].images`
      this.setData({ [key]: images })
    } catch (error) {
      // 用户取消选择图片，静默处理
    } finally {
      errorHandler.hideLoading()
    }
  },

  /**
   * 删除图片
   */
  onDeleteImage(e) {
    const { itemId, index: imgIndex } = e.currentTarget.dataset
    const idx = this._findIndex(itemId)
    const images = [...this.data.orderItems[idx].images]
    images.splice(imgIndex, 1)
    const key = `orderItems[${idx}].images`
    this.setData({ [key]: images })
  },

  /**
   * 匿名评价切换
   */
  onAnonymousChange(e) {
    const { itemId } = e.currentTarget.dataset
    const key = `orderItems[${this._findIndex(itemId)}].is_anonymous`
    this.setData({ [key]: e.detail.value })
  },

  /**
   * 提交评价
   */
  async onSubmit() {
    if (this.data.submitting) return

    const { orderItems } = this.data

    // 验证评价内容
    for (const item of orderItems) {
      if (!item.content.trim()) {
        errorHandler.handle(new Error(`请填写${item.product.name}的评价内容`))
        return
      }
    }

    this.setData({ submitting: true })
    errorHandler.showLoading('提交中...')

    try {
      for (const item of orderItems) {
        await app.api.review.submitReview({
          order_item_id: item.id,
          rating: item.rating,
          content: item.content,
          images: item.images,
          is_anonymous: item.is_anonymous ? 1 : 0
        })
      }

      errorHandler.hideLoading()
      errorHandler.showSuccess('评价成功')

      this.$setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      this.setData({ submitting: false })
    }
  },

  /**
   * 查找订单商品在数组中的索引
   */
  _findIndex(itemId) {
    return this.data.orderItems.findIndex(item => item.id === itemId)
  }
}))