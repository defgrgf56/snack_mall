// pages/review-list/review-list.js - 重构后的评价列表页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    productId: null,
    reviews: [],
    stats: null,
    filterRating: '', // 筛选评分
    showImageOnly: false // 只看有图
  },

  onLoad(options) {
    if (options.productId) {
      this.setData({ productId: options.productId })
      this.loadStats()
      this.loadReviews(true)
    }
  },

  onShow() {
    // 页面显示时不自动刷新
  },

  /**
   * 加载评价统计
   */
  async loadStats() {
    try {
      const stats = await app.api.review.getReviewStats(this.data.productId)
      this.setData({ stats })
    } catch (error) {
      // 静默失败
    }
  },

  /**
   * 加载评价列表
   */
  async loadReviews(reset = false) {
    try {
      const items = await this.loadList(
        (page, pageSize) => this.fetchReviews(page, pageSize),
        { reset, listKey: 'reviews' }
      )

      // 格式化时间
      let reviews = this.data.reviews.map(review => ({
        ...review,
        created_at: this.formatTime(review.created_at)
      }))

      // 如果开启只看有图，过滤
      if (this.data.showImageOnly) {
        reviews = reviews.filter(review => review.images && review.images.length > 0)
      }

      this.setData({ reviews })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 获取评价数据
   */
  async fetchReviews(page, pageSize) {
    const params = {
      page,
      limit: pageSize,
      rating: this.data.filterRating || undefined
    }
    return await app.api.review.getProductReviews(this.data.productId, params)
  },

  /**
   * 加载更多
   */
  async loadMoreData() {
    await this.loadReviews(false)
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadStats()
    await this.loadReviews(true)
    wx.stopPullDownRefresh()
  },

  /**
   * 筛选评分
   */
  onFilterTap(e) {
    const { rating } = e.currentTarget.dataset

    if (rating === this.data.filterRating) return

    this.setData({ filterRating: rating })
    this.loadReviews(true)
  },

  /**
   * 切换只看有图
   */
  onShowImageToggle() {
    this.setData({
      showImageOnly: !this.data.showImageOnly
    })
    this.loadReviews(true)
  },

  /**
   * 预览图片
   */
  onPreviewImage(e) {
    const { images, index } = e.currentTarget.dataset
    const urls = images.map(img => img.image_url || img)

    wx.previewImage({
      urls,
      current: urls[index]
    })
  },

  /**
   * 点赞
   */
  async onLikeTap(e) {
    const { id } = e.currentTarget.dataset

    try {
      const result = await app.api.review.likeReview(id)

      // 更新点赞数
      const reviews = this.data.reviews.map(review => {
        if (review.id === id) {
          return {
            ...review,
            likes: result.likes,
            is_liked: true
          }
        }
        return review
      })

      this.setData({ reviews })
      errorHandler.showSuccess('点赞成功')
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 格式化时间
   */
  formatTime(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`
    } else if (diff < 7 * day) {
      return `${Math.floor(diff / day)}天前`
    } else {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}))