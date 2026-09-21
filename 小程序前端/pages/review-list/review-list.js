// pages/review-list/review-list.js - 重构后的评价列表页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    productId: null,
    reviews: [],
    stats: null,
    filterRating: '',  // 筛选评分：空=全部，'1'-'5'=对应评分
    showImageOnly: false, // 只看有图
    _liking: false      // 防止重复点赞
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

  /** 加载评价统计 */
  async loadStats() {
    try {
      const stats = await app.api.review.getProductReviewStats(this.data.productId)
      // 汇总分类计数（后端 ratingStats 数组按星级1~5排列）
      if (stats.ratingStats && stats.ratingStats.length === 5) {
        stats.midCount = stats.ratingStats[2].count || 0  // 3星
        stats.badCount = (stats.ratingStats[0].count || 0) + (stats.ratingStats[1].count || 0)  // 1~2星
      }
      this.setData({ stats })
    } catch (error) {
      // 静默失败
    }
  },

  /** 加载评价列表 */
  async loadReviews(reset = false) {
    try {
      await this.loadList(
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

  /** 获取评价数据（提取 list 数组） */
  async fetchReviews(page, pageSize) {
    const params = {
      page,
      limit: pageSize
    }
    // 评分筛选：好评=4~5星，中评=3星，差评=1~2星
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
    const result = await app.api.review.getProductReviews(this.data.productId, params)
    // 后端返回 { list: [...], pagination: {...} }
    return result.list || []
  },

  /** 加载更多 */
  async loadMoreData() {
    await this.loadReviews(false)
  },

  /** 下拉刷新 */
  async onPullDownRefresh() {
    await this.loadStats()
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

  /** 切换只看有图 */
  onShowImageToggle() {
    this.setData({
      showImageOnly: !this.data.showImageOnly
    })
    this.loadReviews(true)
  },

  /** 头像加载失败，切换为默认头像 */
  onAvatarError(e) {
    const { index } = e.currentTarget.dataset
    const key = `reviews[${index}].user.avatar`
    this.setData({ [key]: '/images/default-avatar.png' })
  },

  /** 预览图片 */
  onPreviewImage(e) {
    const { images, index } = e.currentTarget.dataset
    const urls = images.map(img => img.image_url || img)

    wx.previewImage({
      urls,
      current: urls[index]
    })
  },

  /** 点赞（防抖） */
  async onLikeTap(e) {
    const { id } = e.currentTarget.dataset

    // 防止重复点击
    if (this.data._liking) return

    // 检查是否已点赞
    const review = this.data.reviews.find(r => r.id === id)
    if (review && review.is_liked) {
      errorHandler.showToast('已经点赞过了', 'none')
      return
    }

    this.setData({ _liking: true })

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
      errorHandler.showToast('点赞成功', 'success')
    } catch (error) {
      // 错误已统一处理
    } finally {
      this.setData({ _liking: false })
    }
  },

  /** 格式化时间为相对时间 */
  formatTime(dateStr) {
    // iOS 不支持 "yyyy-MM-dd HH:mm:ss"，需要替换空格为 T
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