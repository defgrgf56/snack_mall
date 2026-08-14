// pages/index/index.js
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')

Page({
  data: {
    banners: [],
    categories: [],
    coupons: [],
    hotProducts: [],
    newProducts: [],
    loading: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 更新购物车数量
    const app = getApp()
    app.updateCartCount()
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 加载页面数据
   */
  async loadData() {
    this.setData({ loading: true })
    
    try {
      // 并行请求多个接口，使用 Promise.allSettled 避免某个接口失败导致全部失败
      const results = await Promise.allSettled([
        this.loadBanners(),
        this.loadCategories(),
        this.loadCoupons(),
        this.loadHotProducts(),
        this.loadNewProducts()
      ])

      // 提取成功的结果
      const banners = results[0].status === 'fulfilled' ? results[0].value : []
      const categories = results[1].status === 'fulfilled' ? results[1].value : []
      const coupons = results[2].status === 'fulfilled' ? results[2].value : []
      const hotProducts = results[3].status === 'fulfilled' ? results[3].value : []
      const newProducts = results[4].status === 'fulfilled' ? results[4].value : []

      console.log('轮播图数量:', banners.length)
      console.log('轮播图数据:', banners)
      console.log('分类数量:', categories.length)
      console.log('优惠券数量:', coupons.length)
      console.log('热门商品数量:', hotProducts.length)
      console.log('新品数量:', newProducts.length)

      this.setData({
        banners,
        categories: categories.slice(0, 8), // 只显示前8个分类
        coupons: coupons.slice(0, 3), // 只显示前3个优惠券
        hotProducts,
        newProducts,
        loading: false
      })
    } catch (error) {
      console.error('加载数据失败', error)
      this.setData({ loading: false })
    }
  },

  /**
   * 加载轮播图
   */
  async loadBanners() {
    try {
      return await api.get('/banners', {}, false)
    } catch (error) {
      console.log('加载轮播图失败', error)
      return []
    }
  },

  /**
   * 加载分类
   */
  async loadCategories() {
    try {
      return await api.get('/categories', {}, false)
    } catch (error) {
      console.log('加载分类失败', error)
      return []
    }
  },

  /**
   * 加载优惠券
   */
  async loadCoupons() {
    try {
      return await api.get('/coupons/available', {}, false)
    } catch (error) {
      console.log('加载优惠券失败，使用空数据', error)
      return []  // 返回空数组，不影响其他数据加载
    }
  },

  /**
   * 加载热门商品
   */
  async loadHotProducts() {
    const res = await api.get('/products', {
      is_hot: 1,
      page: 1,
      limit: 6
    }, false)
    // 处理返回数据结构
    return res.items || res || []
  },

  /**
   * 加载新品
   */
  async loadNewProducts() {
    const res = await api.get('/products', {
      is_new: 1,
      page: 1,
      limit: 6
    }, false)
    // 处理返回数据结构
    return res.items || res || []
  },

  /**
   * 轮播图点击
   */
  onBannerTap(e) {
    const { item } = e.currentTarget.dataset
    const { link_type, link_value } = item

    switch (link_type) {
      case 1: // 商品
        this.goProductDetail({ currentTarget: { dataset: { id: link_value } } })
        break
      case 2: // 分类
        this.goCategory({ currentTarget: { dataset: { id: link_value } } })
        break
      case 3: // 外链
        // 小程序暂不支持外链，可以复制链接
        wx.setClipboardData({
          data: link_value,
          success: () => {
            util.showSuccess('链接已复制')
          }
        })
        break
    }
  },

  /**
   * 跳转搜索页
   */
  goSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },

  /**
   * 跳转分类页
   */
  goCategory(e) {
    const { id } = e.currentTarget.dataset
    wx.switchTab({
      url: '/pages/category/category'
    })
    // 可以通过事件或全局变量传递分类ID
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
   * 跳转优惠券页
   */
  goCoupon() {
    util.navigateTo('/pages/coupon-list/coupon-list', true)
  },

  /**
   * 领取优惠券
   */
  async receiveCoupon(e) {
    const { id } = e.currentTarget.dataset
    
    try {
      await api.post('/coupons/receive', { coupon_id: id }, true)
      util.showSuccess('领取成功')
      // 重新加载优惠券列表
      const coupons = await this.loadCoupons()
      this.setData({ coupons: coupons.slice(0, 3) })
    } catch (error) {
      // 错误已在request.js中处理
    }
  }
})
