// pages/coupon-list/coupon-list.js - 重构后的优惠券列表页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    activeTab: 0, // 0:未使用 1:已使用 2:已过期
    tabs: ['未使用', '已使用', '已过期'],
    coupons: []
  },

  onLoad(options) {
    // 从参数获取初始tab
    if (options.tab !== undefined) {
      this.setData({ activeTab: parseInt(options.tab) })
    }
  },

  onShow() {
    this.loadCoupons()
  },

  /**
   * 切换Tab
   */
  switchTab(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeTab: index })
    this.loadCoupons()
  },

  /**
   * 加载优惠券列表
   */
  async loadCoupons() {
    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    try {
      const result = await this.loadData(
        () => app.api.coupon.getMyCoupons({ status: this.data.activeTab }),
        { showLoading: true }
      )

      const coupons = result || []
      this.setData({ coupons })
      this.setPageEmpty(coupons.length === 0)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadCoupons()
    wx.stopPullDownRefresh()
  },

  /**
   * 使用优惠券（跳转到商品列表）
   */
  useCoupon(e) {
    const { id } = e.currentTarget.dataset
    wx.switchTab({
      url: '/pages/category/category'
    })
  },

  /**
   * 去领券（跳转到首页）
   */
  goGetCoupons() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
}))