// pages/activity-detail/activity-detail.js - 活动详情页
const createPageMixin = require('../../mixins/page-mixin')
const { ACTIVITY_TYPE } = require('../../constants/index')

const app = getApp()

Page(createPageMixin({
  data: {
    activityId: null,
    activity: null,
    products: [],
    
    // 倒计时
    countdown: {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    countdownTimer: null,
    
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
    loadingMore: false
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({
        title: '活动不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.setData({ activityId: id })
    this.loadActivityData()
  },

  onUnload() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
  },

  /**
   * 加载活动数据
   */
  async loadActivityData() {
    try {
      this.setPageLoading(true)
      
      const [activity, productsRes] = await Promise.all([
        app.api.activity.getActivityDetail(this.data.activityId),
        app.api.activity.getActivityProducts(this.data.activityId, {
          page: 1,
          pageSize: this.data.pageSize
        })
      ])
      
      this.setData({
        activity,
        products: productsRes.list || [],
        hasMore: productsRes.pagination?.page < productsRes.pagination?.totalPages,
        page: 1
      })
      
      // 启动倒计时
      if (activity.status === 1 || activity.status === 2) {
        this.startCountdown()
      }
    } catch (error) {
      console.error('加载活动数据失败:', error)
      this.setPageError(error)
    } finally {
      this.setPageLoading(false)
    }
  },

  /**
   * 加载更多商品
   */
  async loadMoreProducts() {
    if (this.data.loadingMore || !this.data.hasMore) {
      return
    }
    
    try {
      this.setData({ loadingMore: true })
      
      const nextPage = this.data.page + 1
      const res = await app.api.activity.getActivityProducts(this.data.activityId, {
        page: nextPage,
        pageSize: this.data.pageSize
      })
      
      this.setData({
        products: [...this.data.products, ...(res.list || [])],
        page: nextPage,
        hasMore: res.pagination?.page < res.pagination?.totalPages
      })
    } catch (error) {
      console.error('加载更多商品失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  /**
   * 启动倒计时
   */
  startCountdown() {
    const updateCountdown = () => {
      const activity = this.data.activity
      if (!activity) return
      
      const now = new Date().getTime()
      let targetTime
      
      if (activity.status === 1) {
        // 进行中：倒计时到结束
        targetTime = new Date(activity.end_time.replace(/-/g, '/')).getTime()
      } else if (activity.status === 2) {
        // 未开始：倒计时到开始
        targetTime = new Date(activity.start_time.replace(/-/g, '/')).getTime()
      } else {
        return
      }
      
      const diff = Math.max(0, targetTime - now)
      
      if (diff === 0) {
        // 倒计时结束，重新加载活动
        clearInterval(this.data.countdownTimer)
        setTimeout(() => {
          this.loadActivityData()
        }, 1000)
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      this.setData({
        countdown: {
          days: days.toString().padStart(2, '0'),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        }
      })
    }
    
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    this.setData({ countdownTimer: timer })
  },

  /**
   * 跳转到商品详情
   */
  goProductDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  /**
   * 加入购物车
   */
  async handleAddToCart(e) {
    const { id } = e.currentTarget.dataset
    
    // 检查登录
    if (!app.store.isLoggedIn()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }
    
    try {
      wx.showLoading({ title: '加入中...' })
      
      await app.api.cart.addToCart({
        product_id: id,
        quantity: 1
      })
      
      // 更新购物车数量
      await app.store.updateCartCount()
      
      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      })
    } catch (error) {
      console.error('加入购物车失败:', error)
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    try {
      await this.loadActivityData()
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 触底加载更多
   */
  onReachBottom() {
    this.loadMoreProducts()
  }
}))