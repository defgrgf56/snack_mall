// pages/my-reviews/my-reviews.js
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    reviews: [],
    filterRating: ''
  },

  onLoad() {
    this.loadReviews(true)
  },

  onShow() {
    // 页面显示时不自动刷新
  },

  /** 加载我的评价列表 */
  async loadReviews(reset = false) {
    try {
      await this.loadList(
        (page, pageSize) => this.fetchReviews(page, pageSize),
        { reset, listKey: 'reviews' }
      )

      // 格式化时间
      const reviews = this.data.reviews.map(review => ({
        ...review,
        created_at: this.formatTime(review.created_at)
      }))

      this.setData({ reviews })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /** 获取评价数据 */
  async fetchReviews(page, pageSize) {
    const params = { page, limit: pageSize }
    // 筛选：好评=4~5星，中评=3星，差评=1~2星
    const ratingFilter = this.data.filterRating
    if (ratingFilter === 'good') {
      params.ratingMin = 4
      params.ratingMax = 5
    } else if (ratingFilter === 'mid') {
      params.rating = 3
    } else if (ratingFilter === 'bad') {
      params.ratingMin = 1
      params.ratingMax = 2
    }
    const result = await app.api.review.getMyReviews(params)
    return result.list || []
  },

  /** 加载更多 */
  async loadMoreData() {
    await this.loadReviews(false)
  },

  /** 下拉刷新 */
  async onPullDownRefresh() {
    await this.loadReviews(true)
    wx.stopPullDownRefresh()
  },

  /** 筛选评分 */
  onFilterTap(e) {
    const { rating } = e.currentTarget.dataset
    if (rating === this.data.filterRating) return
    this.setData({ filterRating: rating })
    this.loadReviews(true)
  },

  /** 点击评价跳转商品详情 */
  onReviewTap(e) {
    const { productId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    })
  },

  /** 预览图片 */
  onPreviewImage(e) {
    const { images, index } = e.currentTarget.dataset
    const urls = images.map(img => img.image_url || img)
    wx.previewImage({ urls, current: urls[index] })
  },

  /** 去购物 */
  goShopping() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  /** 格式化时间为相对时间 */
  formatTime(dateStr) {
    const normalized = String(dateStr).replace(' ', 'T')
    const date = new Date(normalized)
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
      const dayNum = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${dayNum}`
    }
  }
}))