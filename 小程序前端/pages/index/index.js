// pages/index/index.js
const { api } = require('../../config/api.js')
const { addToCart } = require('../../utils/cart.js')

Page({
  data: {
    banners: [],
    categories: [],
    hotProducts: [],
    newProducts: [],
    loading: true,
    navBarHeight: 0,  // 导航栏高度
    menuTop: 0,       // 胶囊按钮上边距
    menuHeight: 0     // 胶囊按钮高度
  },

  onLoad() {
    this.setNavBarInfo()
    this.loadData()
  },

  /**
   * 设置导航栏信息
   */
  setNavBarInfo() {
    // 获取胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    
    // 计算导航栏高度：胶囊按钮下边距 + 胶囊按钮高度 + 胶囊按钮上边距
    const navBarHeight = menuButtonInfo.bottom + menuButtonInfo.top - systemInfo.statusBarHeight
    
    this.setData({
      navBarHeight: navBarHeight,
      menuTop: menuButtonInfo.top,
      menuHeight: menuButtonInfo.height
    })
  },

  onShow() {
    // 更新购物车数量
    const app = getApp()
    app.updateCartCount()
    
    // 设置TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
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
      // 并行请求多个接口
      const results = await Promise.allSettled([
        this.loadBanners(),
        this.loadCategories(),
        this.loadHotProducts(),
        this.loadNewProducts()
      ])

      // 提取成功的结果
      const banners = results[0].status === 'fulfilled' ? results[0].value : []
      const categories = results[1].status === 'fulfilled' ? results[1].value : []
      const hotProducts = results[2].status === 'fulfilled' ? results[2].value : []
      const newProducts = results[3].status === 'fulfilled' ? results[3].value : []

      console.log('轮播图数量:', banners.length)
      console.log('分类数量:', categories.length)
      console.log('热门商品数量:', hotProducts.length)
      console.log('新品数量:', newProducts.length)

      this.setData({
        banners,
        categories: categories.slice(0, 8), // 只显示前8个分类
        hotProducts,
        newProducts,
        loading: false
      })
    } catch (error) {
      console.error('加载数据失败', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  /**
   * 加载轮播图
   */
  async loadBanners() {
    try {
      const res = await api.getBanners()
      return res.data || []
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
      const res = await api.getCategories()
      return res.data || []
    } catch (error) {
      console.log('加载分类失败', error)
      return []
    }
  },

  /**
   * 加载热门商品
   */
  async loadHotProducts() {
    try {
      const res = await api.getProducts({
        is_hot: 1,
        page: 1,
        pageSize: 6
      })
      return res.data.items || []
    } catch (error) {
      console.log('加载热门商品失败', error)
      return []
    }
  },

  /**
   * 加载新品
   */
  async loadNewProducts() {
    try {
      const res = await api.getProducts({
        is_new: 1,
        page: 1,
        pageSize: 6
      })
      return res.data.items || []
    } catch (error) {
      console.log('加载新品失败', error)
      return []
    }
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
        wx.switchTab({
          url: '/pages/category/category'
        })
        break
      case 3: // 外链
        wx.setClipboardData({
          data: link_value,
          success: () => {
            wx.showToast({
              title: '链接已复制',
              icon: 'success'
            })
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
    
    // 阻止冒泡到商品详情
    e.stopPropagation()
    
    const success = await addToCart(id, 1)
    if (success) {
      // 刷新购物车数量
      const app = getApp()
      app.updateCartCount()
    }
  }
})
