// pages/index/index.js - 重构后的首页
const createPageMixin = require('../../mixins/page-mixin')
const { BANNER_LINK_TYPE } = require('../../constants/index')
const errorHandler = require('../../utils/error-handler')
const { IS_DEV } = require('../../config/env')
const Diagnostic = require('../../utils/diagnostic')

const app = getApp()

Page(createPageMixin({
  data: {
    banners: [],
    categories: [],
    hotProducts: [],
    newProducts: [],
    coupons: [],
    couponsLoop: [], // 循环展示的优惠券列表
    couponDisplayCount: 1, // 同时显示的优惠券数量
    seckills: [],
    activities: [],
    
    // 秒杀倒计时
    seckillCountdown: {
      hours: '00',
      minutes: '00',
      seconds: '00'
    },
    
    // 导航栏配置
    navBarHeight: 0,
    menuTop: 0,
    menuHeight: 0,
    menuLeft: 0,
    logoRight: 0,
    
    // 开发模式
    isDev: IS_DEV
  },

  onLoad() {
    this.initNavBar()
    this.loadPageData()
  },

  onShow() {
    // 设置 TabBar 选中状态和购物车数量
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ 
        selected: 0,
        cartCount: app.store.getState('cartCount') || 0
      })
    }
  },

  onUnload() {
    // 清理倒计时
    if (this._seckillTimer) {
      clearInterval(this._seckillTimer)
    }
  },

  /**
   * 初始化导航栏
   */
  initNavBar() {
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    const systemInfo = app.store.getState('systemInfo')
    
    const navBarHeight = menuButtonInfo.bottom + menuButtonInfo.top - systemInfo.statusBarHeight
    const logoRight = systemInfo.windowWidth - menuButtonInfo.left + (20 / 750 * systemInfo.windowWidth)
    
    this.setData({
      navBarHeight,
      menuTop: menuButtonInfo.top,
      menuHeight: menuButtonInfo.height,
      menuLeft: menuButtonInfo.left,
      logoRight
    })
  },

  /**
   * 加载页面数据
   */
  async loadPageData() {
    try {
      this.setPageLoading(true)
      
      // 并行加载所有数据
      const [
        banners,
        categories,
        hotProducts,
        newProducts,
        coupons,
        seckills,
        activities
      ] = await Promise.allSettled([
        app.api.product.getBanners(),
        app.api.product.getCategories(),
        this.loadHotProducts(),
        this.loadNewProducts(),
        this.loadCoupons(),
        this.loadSeckills(),
        this.loadActivities()
      ])

      // 检查关键数据加载失败
      const errors = []
      if (banners.status === 'rejected') errors.push(`轮播图: ${banners.reason.message}`)
      if (categories.status === 'rejected') errors.push(`分类: ${categories.reason.message}`)
      if (hotProducts.status === 'rejected') errors.push(`热门商品: ${hotProducts.reason.message}`)
      if (newProducts.status === 'rejected') errors.push(`新品: ${newProducts.reason.message}`)

      // 如果有关键数据加载失败，显示错误提示
      if (errors.length > 0) {
        console.error('首页数据加载失败:', errors)
        wx.showToast({
          title: `部分数据加载失败`,
          icon: 'none',
          duration: 2000
        })
      }

      // 安全获取数组数据的辅助函数
      const safeArray = (promiseResult, limit) => {
        if (promiseResult.status !== 'fulfilled') return []
        const value = promiseResult.value
        const arr = Array.isArray(value) ? value : []
        return limit ? arr.slice(0, limit) : arr
      }

      this.setData({
        banners: safeArray(banners),
        categories: safeArray(categories, 8),
        hotProducts: safeArray(hotProducts),
        newProducts: safeArray(newProducts),
        coupons: safeArray(coupons, 5),
        seckills: safeArray(seckills, 10),
        activities: safeArray(activities, 4)
      })

      // 处理优惠券循环数据
      this.prepareCouponsLoop()

      // 启动秒杀倒计时
      if (this.data.seckills.length > 0) {
        this.startSeckillCountdown()
      }
    } catch (error) {
      console.error('首页加载异常:', error)
      this.setPageError(error)
    } finally {
      this.setPageLoading(false)
    }
  },

  /**
   * 加载热门商品
   */
  async loadHotProducts() {
    const result = await app.api.product.getProducts({
      is_hot: 1,
      page: 1,
      pageSize: 6
    })
    return result.items || []
  },

  /**
   * 加载新品
   */
  async loadNewProducts() {
    const result = await app.api.product.getProducts({
      is_new: 1,
      page: 1,
      pageSize: 6
    })
    return result.items || []
  },

  /**
   * 加载优惠券
   */
  async loadCoupons() {
    try {
      // 优惠券接口需要登录，未登录时返回空数组
      if (!app.store.isLoggedIn()) {
        return []
      }
      const result = await app.api.coupon.getAvailableCoupons({ page: 1, limit: 5 })
      // 确保返回数组
      const coupons = Array.isArray(result) ? result : (result.items || [])
      // 格式化日期
      return coupons.map(coupon => ({
        ...coupon,
        start_time: this.formatCouponDate(coupon.start_time),
        end_time: this.formatCouponDate(coupon.end_time)
      }))
    } catch (error) {
      return []
    }
  },

  /**
   * 格式化优惠券日期 (YYYY-MM-DD HH:mm:ss -> MM.DD)
   */
  formatCouponDate(dateStr) {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr.replace(/-/g, '/'))
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${month}.${day}`
    } catch (error) {
      return ''
    }
  },

  /**
   * 准备优惠券循环数据
   * 如果优惠券少于3张，复制数据实现无缝循环
   */
  prepareCouponsLoop() {
    const coupons = this.data.coupons
    if (coupons.length === 0) {
      this.setData({ couponsLoop: [] })
      return
    }

    let couponsLoop = []
    
    // 如果优惠券数量较少，复制多次确保循环流畅
    if (coupons.length < 3) {
      // 复制3遍确保循环无缝
      couponsLoop = [...coupons, ...coupons, ...coupons].map((item, index) => ({
        ...item,
        loopIndex: `${item.id}_${index}` // 添加唯一标识
      }))
    } else {
      couponsLoop = coupons.map((item, index) => ({
        ...item,
        loopIndex: `${item.id}_${index}`
      }))
    }

    this.setData({ 
      couponsLoop,
      couponDisplayCount: 1 // 一次显示1张优惠券
    })
  },

  /**
   * 加载秒杀活动
   */
  async loadSeckills() {
    try {
      const result = await app.api.seckill.getSeckills({ status: 1, page: 1, pageSize: 10 })
      // 后端返回 { list: [], pagination: {} } 格式
      return Array.isArray(result.list) ? result.list : []
    } catch (error) {
      return []
    }
  },

  /**
   * 加载活动专区
   */
  async loadActivities() {
    try {
      const result = await app.api.activity.getActivities({ status: 1, page: 1, pageSize: 4 })
      // 后端可能返回 { list: [] } 或直接返回数组
      return Array.isArray(result) ? result : (Array.isArray(result.list) ? result.list : [])
    } catch (error) {
      return []
    }
  },

  /**
   * 启动秒杀倒计时
   */
  startSeckillCountdown() {
    const seckills = this.data.seckills
    if (seckills.length === 0) return

    let countdown = seckills[0].remaining_time || 0

    const updateCountdown = () => {
      if (countdown <= 0) {
        clearInterval(this._seckillTimer)
        this.loadSeckills().then(data => {
          this.setData({ seckills: data.slice(0, 10) })
          if (data.length > 0) {
            this.startSeckillCountdown()
          }
        })
        return
      }

      const hours = Math.floor(countdown / 3600)
      const minutes = Math.floor((countdown % 3600) / 60)
      const seconds = countdown % 60

      this.setData({
        seckillCountdown: {
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        }
      })

      countdown--
    }

    updateCountdown()
    this._seckillTimer = this.$setInterval(updateCountdown, 1000)
  },

  /**
   * 轮播图点击
   */
  onBannerTap(e) {
    const { item } = e.currentTarget.dataset
    const { link_type, link_value } = item

    switch (link_type) {
      case BANNER_LINK_TYPE.PRODUCT:
        wx.navigateTo({
          url: `/pages/product-detail/product-detail?id=${link_value}`
        })
        break
      case BANNER_LINK_TYPE.CATEGORY:
        wx.switchTab({ url: '/pages/category/category' })
        break
      case BANNER_LINK_TYPE.EXTERNAL:
        wx.setClipboardData({
          data: link_value,
          success: () => {
            errorHandler.showSuccess('链接已复制')
          }
        })
        break
    }
  },

  /**
   * 跳转搜索页
   */
  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  /**
   * 跳转分类页
   */
  goCategory(e) {
    wx.switchTab({ url: '/pages/category/category' })
  },

  /**
   * 跳转商品详情
   */
  goProductDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  /**
   * 快速加入购物车
   */
  async handleAddToCart(e) {
    const { id } = e.currentTarget.dataset
    
    // 检查登录
    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    try {
      await app.api.cart.addToCart(id, 1)
      errorHandler.showSuccess('已加入购物车')
      app.store.updateCartCount()
    } catch (error) {
      // 错误已由 errorHandler 统一处理
    }
  },

  /**
   * 领取优惠券
   */
  async receiveCoupon(e) {
    const { id } = e.currentTarget.dataset

    // 检查登录
    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    try {
      await app.api.coupon.receiveCoupon(id)
      errorHandler.showSuccess('领取成功')
      this.loadCoupons()
    } catch (error) {
      // 错误已由 errorHandler 统一处理
    }
  },

  /**
   * 跳转到我的优惠券
   */
  goMyCoupons() {
    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    wx.navigateTo({ url: '/pages/coupon-list/coupon-list' })
  },

  /**
   * 跳转到秒杀列表
   */
  goSeckillList() {
    wx.navigateTo({ url: '/pages/seckill-list/seckill-list' })
  },

  /**
   * 跳转到活动详情
   */
  goActivityDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/activity-detail/activity-detail?id=${id}` })
  },

  /**
   * 系统诊断（开发模式）
   */
  async runDiagnostic() {
    try {
      wx.showLoading({ title: '诊断中...' })
      await Diagnostic.showDiagnosticModal()
    } catch (error) {
      console.error('诊断失败:', error)
      errorHandler.showToast('诊断失败')
    } finally {
      wx.hideLoading()
    }
  }
}))