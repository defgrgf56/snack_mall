// pages/review-submit/review-submit.js - 重构后的评价提交页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')
const { API_BASE_URL } = require('../../config/env')
const request = require('../../services/request')

const app = getApp()

Page(createPageMixin({
  data: {
    orderItemId: null,
    orderItem: null,
    rating: 5,
    ratingText: '非常满意',
    content: '',
    images: [],       // 存储已上传的服务器URL
    isAnonymous: false,
    uploading: false,  // 是否正在上传图片
    submitting: false, // 是否正在提交评价
    uploadProgress: 0  // 上传进度计数
  },

  onLoad(options) {
    if (options.orderItemId) {
      this.setData({ orderItemId: options.orderItemId })
      this.loadOrderItem()
    }
  },

  /** 加载订单商品信息 */
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

  /** 点击星级评分 */
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

  /** 输入评价内容 */
  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  /** 选择图片 */
  onChooseImage() {
    if (this.data.uploading) return

    const remainCount = 9 - this.data.images.length
    if (remainCount <= 0) {
      errorHandler.showToast('最多上传9张图片', 'none')
      return
    }

    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImages(res.tempFilePaths)
      }
    })
  },

  /** 上传图片到服务器 */
  async uploadImages(filePaths) {
    this.setData({ uploading: true, uploadProgress: 0 })

    const total = filePaths.length
    let successCount = 0

    for (const filePath of filePaths) {
      try {
        const result = await request.upload(filePath, { loadingText: '上传中...' })
        // 拼接完整URL（服务器返回相对路径如 /uploads/202609/xxx.jpg）
        const fullUrl = API_BASE_URL.replace('/api', '') + result.url
        this.data.images.push(fullUrl)
        successCount++
      } catch (error) {
        console.error('上传图片失败:', error)
      }
      this.setData({ uploadProgress: successCount })
    }

    this.setData({
      images: [...this.data.images],
      uploading: false,
      uploadProgress: 0
    })

    if (successCount > 0 && successCount < total) {
      errorHandler.showToast(`成功上传${successCount}张，${total - successCount}张失败`, 'none')
    } else if (successCount === total) {
      errorHandler.showToast('图片上传成功', 'success')
    } else {
      errorHandler.showToast('图片上传失败', 'none')
    }
  },

  /** 删除图片 */
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  /** 切换匿名 */
  onAnonymousChange(e) {
    this.setData({ isAnonymous: e.detail.value })
  },

  /** 表单验证 */
  validateForm() {
    if (!this.data.orderItemId) {
      throw new Error('订单商品信息错误')
    }
    return true
  },

  /** 提交评价 */
  async onSubmit() {
    if (this.data.submitting || this.data.uploading) return

    try {
      this.validateForm()
      this.setData({ submitting: true })

      const { orderItemId, rating, content, images, isAnonymous } = this.data

      const reviewData = {
        order_item_id: orderItemId,
        rating,
        content,
        images,
        is_anonymous: isAnonymous ? 1 : 0
      }

      await this.loadData(
        () => app.api.review.submitReview(reviewData),
        { showLoading: true, loadingText: '提交中...' }
      )

      errorHandler.showSuccess('评价成功')

      this.$setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      this.setData({ submitting: false })
      errorHandler.handle(error)
    }
  }
}))