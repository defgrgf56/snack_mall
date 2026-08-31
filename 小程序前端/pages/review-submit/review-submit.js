// pages/review-submit/review-submit.js - 重构后的评价提交页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    orderItemId: null,
    orderItem: null,
    rating: 5,
    ratingText: '非常满意',
    content: '',
    images: [],
    isAnonymous: false
  },

  onLoad(options) {
    if (options.orderItemId) {
      this.setData({ orderItemId: options.orderItemId })
      this.loadOrderItem()
    }
  },

  /**
   * 加载订单商品信息
   */
  async loadOrderItem() {
    try {
      const orderItems = await this.loadData(
        () => app.api.review.getPendingReviews(),
        { showLoading: true }
      )

      const orderItem = orderItems.find(item => item.id == this.data.orderItemId)

      if (orderItem) {
        this.setData({ orderItem })
      } else {
        errorHandler.handle(new Error('订单商品不存在'))
        this.$setTimeout(() => wx.navigateBack(), 1500)
      }
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 点击星级评分
   */
  onRatingTap(e) {
    const rating = parseInt(e.currentTarget.dataset.rating)
    const ratingTexts = {
      1: '非常不满意',
      2: '不满意',
      3: '一般',
      4: '满意',
      5: '非常满意'
    }

    this.setData({
      rating,
      ratingText: ratingTexts[rating]
    })
  },

  /**
   * 输入评价内容
   */
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  /**
   * 选择图片
   */
  onChooseImage() {
    const remainCount = 9 - this.data.images.length

    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImages(res.tempFilePaths)
      }
    })
  },

  /**
   * 上传图片
   */
  async uploadImages(filePaths) {
    try {
      wx.showLoading({ title: '上传中...', mask: true })

      const uploadedUrls = []

      for (const filePath of filePaths) {
        try {
          // TODO: 实现图片上传 API
          // const result = await app.api.upload.uploadImage(filePath)
          // uploadedUrls.push(result.url)
          
          // 暂时使用本地路径模拟
          uploadedUrls.push(filePath)
        } catch (error) {
          errorHandler.handle(error)
        }
      }

      wx.hideLoading()

      if (uploadedUrls.length > 0) {
        this.setData({
          images: [...this.data.images, ...uploadedUrls]
        })
        errorHandler.showSuccess('上传成功')
      }
    } catch (error) {
      wx.hideLoading()
      errorHandler.handle(error)
    }
  },

  /**
   * 删除图片
   */
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  /**
   * 切换匿名
   */
  onAnonymousChange(e) {
    this.setData({
      isAnonymous: e.detail.value
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    if (!this.data.orderItemId) {
      throw new Error('订单商品信息错误')
    }
    return true
  },

  /**
   * 提交评价
   */
  async onSubmit() {
    try {
      // 验证表单
      this.validateForm()

      const { orderItemId, rating, content, images, isAnonymous } = this.data

      const reviewData = {
        order_item_id: orderItemId,
        rating,
        content,
        images,
        is_anonymous: isAnonymous ? 1 : 0
      }

      await this.loadData(
        () => app.api.review.createReview(reviewData),
        { showLoading: true, loadingText: '提交中...' }
      )

      errorHandler.showSuccess('评价成功')

      this.$setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      errorHandler.handle(error)
    }
  }
}))