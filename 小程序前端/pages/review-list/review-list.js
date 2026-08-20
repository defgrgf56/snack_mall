// pages/review-list/review-list.js
Page({
  data: {
    productId: null,
    reviews: [],
    stats: null,
    filterRating: '', // 筛选评分
    showImageOnly: false, // 只看有图
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    if (options.productId) {
      this.setData({ productId: options.productId })
      this.loadStats()
      this.loadReviews()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      reviews: [],
      hasMore: true
    })
    this.loadStats()
    this.loadReviews().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadReviews()
    }
  },

  /**
   * 加载评价统计
   */
  loadStats() {
    const app = getApp()
    
    wx.request({
      url: `${app.globalData.apiBase}/reviews/product/${this.data.productId}/stats`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 200) {
          this.setData({ stats: res.data.data })
        }
      }
    })
  },

  /**
   * 加载评价列表
   */
  loadReviews() {
    return new Promise((resolve) => {
      if (this.data.loading) {
        resolve()
        return
      }

      this.setData({ loading: true })

      const app = getApp()
      const { productId, page, pageSize, filterRating } = this.data

      wx.request({
        url: `${app.globalData.apiBase}/reviews/product/${productId}`,
        method: 'GET',
        data: {
          page,
          pageSize,
          rating: filterRating
        },
        success: (res) => {
          if (res.data && res.data.code === 200) {
            const newReviews = res.data.data.list || []
            const allReviews = page === 1 ? newReviews : [...this.data.reviews, ...newReviews]
            
            // 格式化时间
            const formattedReviews = allReviews.map(review => ({
              ...review,
              created_at: this.formatTime(review.created_at)
            }))

            this.setData({
              reviews: formattedReviews,
              hasMore: newReviews.length >= pageSize,
              loading: false
            })
          } else {
            this.setData({ loading: false })
          }
          resolve()
        },
        fail: () => {
          this.setData({ loading: false })
          resolve()
        }
      })
    })
  },

  /**
   * 筛选评分
   */
  onFilterTap(e) {
    const { rating } = e.currentTarget.dataset
    
    if (rating === this.data.filterRating) {
      return
    }

    this.setData({
      filterRating: rating,
      page: 1,
      reviews: [],
      hasMore: true
    })

    this.loadReviews()
  },

  /**
   * 切换只看有图
   */
  onShowImageToggle() {
    this.setData({
      showImageOnly: !this.data.showImageOnly
    })

    // 过滤有图评价
    if (this.data.showImageOnly) {
      const imageReviews = this.data.reviews.filter(review => 
        review.images && review.images.length > 0
      )
      this.setData({ reviews: imageReviews })
    } else {
      // 重新加载全部
      this.setData({
        page: 1,
        reviews: [],
        hasMore: true
      })
      this.loadReviews()
    }
  },

  /**
   * 预览图片
   */
  onPreviewImage(e) {
    const { images, index } = e.currentTarget.dataset
    const urls = images.map(img => img.image_url)
    
    wx.previewImage({
      urls,
      current: urls[index]
    })
  },

  /**
   * 点赞
   */
  onLikeTap(e) {
    const { id } = e.currentTarget.dataset
    const app = getApp()

    wx.request({
      url: `${app.globalData.apiBase}/reviews/${id}/like`,
      method: 'POST',
      success: (res) => {
        if (res.data && res.data.code === 200) {
          // 更新点赞数
          const reviews = this.data.reviews.map(review => {
            if (review.id === id) {
              return {
                ...review,
                likes: res.data.data.likes
              }
            }
            return review
          })

          this.setData({ reviews })

          wx.showToast({
            title: '点赞成功',
            icon: 'success',
            duration: 1000
          })
        }
      }
    })
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
})
