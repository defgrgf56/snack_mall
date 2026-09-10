// pages/order-comment/order-comment.js
const app = getApp()
const errorHandler = require('../../utils/error-handler')

Page({
  data: {
    orderId: null,
    orderItems: [],
    submitting: false
  },

  onLoad(options) {
    const { orderId } = options
    
    if (!orderId) {
      errorHandler.showToast('订单ID不能为空', 'none')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    this.setData({ orderId })
    this.loadOrderItems()
  },

  /**
   * 加载订单商品
   */
  async loadOrderItems() {
    try {
      wx.showLoading({ title: '加载中...', mask: true })
      
      // 获取订单详情
      const order = await app.api.order.getOrderDetail(this.data.orderId)
      
      // 过滤出未评价的商品
      const orderItems = order.items.filter(item => !item.is_reviewed).map(item => ({
        id: item.id,
        product_id: item.product_id,
        product: item.product,
        price: item.price,
        quantity: item.quantity,
        rating: 5, // 默认5星
        content: '',
        images: [],
        is_anonymous: false
      }))

      if (orderItems.length === 0) {
        errorHandler.showToast('没有待评价的商品', 'none')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
        return
      }

      this.setData({ orderItems })
    } catch (error) {
      // 错误已由 errorHandler 处理
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 星级评分点击
   */
  onRatingTap(e) {
    const { itemId, rating } = e.currentTarget.dataset
    const { orderItems } = this.data
    
    const index = orderItems.findIndex(item => item.id === itemId)
    if (index === -1) return

    orderItems[index].rating = parseInt(rating)
    this.setData({ orderItems })
  },

  /**
   * 评价内容输入
   */
  onContentInput(e) {
    const { itemId } = e.currentTarget.dataset
    const { value } = e.detail
    const { orderItems } = this.data
    
    const index = orderItems.findIndex(item => item.id === itemId)
    if (index === -1) return

    orderItems[index].content = value
    this.setData({ orderItems })
  },

  /**
   * 上传图片
   */
  async onUploadImage(e) {
    const { itemId } = e.currentTarget.dataset
    const { orderItems } = this.data
    
    const index = orderItems.findIndex(item => item.id === itemId)
    if (index === -1) return

    const item = orderItems[index]
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

      wx.showLoading({ title: '上传中...', mask: true })

      const request = require('../../services/request')

      // 依次上传图片
      for (const filePath of res.tempFilePaths) {
        try {
          const uploadRes = await request.upload(filePath)
          item.images.push(uploadRes.url)
        } catch (error) {
          console.error('上传图片失败:', error)
          errorHandler.showToast('部分图片上传失败', 'none')
        }
      }

      this.setData({ orderItems })
    } catch (error) {
      console.error('选择图片失败:', error)
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 删除图片
   */
  onDeleteImage(e) {
    const { itemId, index: imgIndex } = e.currentTarget.dataset
    const { orderItems } = this.data
    
    const index = orderItems.findIndex(item => item.id === itemId)
    if (index === -1) return

    orderItems[index].images.splice(imgIndex, 1)
    this.setData({ orderItems })
  },

  /**
   * 匿名评价切换
   */
  onAnonymousChange(e) {
    const { itemId } = e.currentTarget.dataset
    const { value } = e.detail
    const { orderItems } = this.data
    
    const index = orderItems.findIndex(item => item.id === itemId)
    if (index === -1) return

    orderItems[index].is_anonymous = value
    this.setData({ orderItems })
  },

  /**
   * 提交评价
   */
  async onSubmit() {
    if (this.data.submitting) return

    const { orderItems, orderId } = this.data

    // 验证评价内容
    for (const item of orderItems) {
      if (!item.content.trim()) {
        errorHandler.showToast(`请填写${item.product.name}的评价内容`, 'none')
        return
      }
    }

    this.setData({ submitting: true })

    try {
      wx.showLoading({ title: '提交中...', mask: true })

      // 依次提交每个商品的评价
      for (const item of orderItems) {
        await app.api.review.submitReview({
          order_item_id: item.id,
          rating: item.rating,
          content: item.content,
          images: item.images,
          is_anonymous: item.is_anonymous ? 1 : 0
        })
      }

      wx.hideLoading()
      errorHandler.showSuccess('评价成功')

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      wx.hideLoading()
      this.setData({ submitting: false })
    }
  }
})