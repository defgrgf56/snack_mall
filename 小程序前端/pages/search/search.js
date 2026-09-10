// pages/search/search.js - 重构后的搜索页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')
const { STORAGE_KEY } = require('../../constants/index')

const app = getApp()

Page(createPageMixin({
  data: {
    keyword: '',
    history: [],
    hotKeywords: [],
    suggestions: [],
    showSuggestions: false,
    products: [],
    searched: false,  // 是否已执行搜索
    
    // 排序
    sortType: 'default',
    sortOptions: [
      { value: 'default', label: '综合' },
      { value: 'sales', label: '销量' },
      { value: 'price_asc', label: '价格↑' },
      { value: 'price_desc', label: '价格↓' }
    ],
    
    // 导航栏
    statusBarHeight: 0,
    navBarHeight: 0,
    autoFocus: true
  },

  onLoad(options) {
    this.setNavBarInfo()
    this.loadHistory()
    this.loadHotKeywords()
  },

  /**
   * 设置导航栏信息
   */
  setNavBarInfo() {
    const systemInfo = app.store.getState('systemInfo')
    const menuButton = wx.getMenuButtonBoundingClientRect()
    
    const statusBarHeight = systemInfo.statusBarHeight
    const navBarHeight = (menuButton.top - statusBarHeight) + menuButton.height + 10
    
    this.setData({
      statusBarHeight,
      navBarHeight
    })
  },

  /**
   * 加载搜索历史
   */
  async loadHistory() {
    try {
      // 优先从后端获取（需登录）
      if (app.store.isLoggedIn()) {
        const result = await app.api.search.getSearchHistory()
        const history = (result || []).map(item => item.keyword)
        this.setData({ history })
      } else {
        // 未登录使用本地存储
        const history = wx.getStorageSync(STORAGE_KEY.SEARCH_HISTORY) || []
        this.setData({ history })
      }
    } catch (error) {
      // 失败时回退到本地存储
      const history = wx.getStorageSync(STORAGE_KEY.SEARCH_HISTORY) || []
      this.setData({ history })
    }
  },

  /**
   * 加载热门搜索词
   */
  async loadHotKeywords() {
    try {
      const result = await app.api.search.getHotKeywords()
      const keywords = result.map(item => item.keyword)
      this.setData({ hotKeywords: keywords })
    } catch (error) {
      // 失败时使用默认值
      this.setData({
        hotKeywords: ['坚果', '巧克力', '饼干', '零食大礼包']
      })
    }
  },

  /**
   * 保存搜索历史
   */
  async saveHistory(keyword) {
    try {
      // 保存到后端（需登录）
      if (app.store.isLoggedIn()) {
        await app.api.search.saveSearchHistory(keyword)
        await this.loadHistory() // 重新加载历史
      } else {
        // 未登录保存到本地
        let history = this.data.history
        history = history.filter(item => item !== keyword)
        history.unshift(keyword)
        history = history.slice(0, 10)
        
        wx.setStorageSync(STORAGE_KEY.SEARCH_HISTORY, history)
        this.setData({ history })
      }
    } catch (error) {
      // 失败时保存到本地
      let history = this.data.history
      history = history.filter(item => item !== keyword)
      history.unshift(keyword)
      history = history.slice(0, 10)
      
      wx.setStorageSync(STORAGE_KEY.SEARCH_HISTORY, history)
      this.setData({ history })
    }
  },

  /**
   * 输入关键词
   */
  async onKeywordInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })

    // 如果输入为空，隐藏联想
    if (!keyword.trim()) {
      this.setData({
        showSuggestions: false,
        suggestions: []
      })
      return
    }

    // 防抖：延迟请求联想词
    if (this._suggestTimer) {
      clearTimeout(this._suggestTimer)
    }

    this._suggestTimer = this.$setTimeout(async () => {
      try {
        const result = await app.api.search.getSearchSuggestions({ 
          keyword: keyword.trim() 
        })
        const suggestions = (result || []).map(item => item.keyword || item)
        this.setData({
          suggestions,
          showSuggestions: suggestions.length > 0
        })
      } catch (error) {
        // 静默失败
      }
    }, 300)
  },

  /**
   * 点击联想词
   */
  onSuggestionTap(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({
      keyword,
      showSuggestions: false
    })
    this.onSearch()
  },

  /**
   * 清除输入框
   */
  onClearInput() {
    this.setData({
      keyword: '',
      autoFocus: true,
      showSuggestions: false,
      suggestions: [],
      searched: false,  // 清除搜索状态
      products: []      // 清空商品列表
    })
  },

  /**
   * 执行搜索
   */
  async onSearch() {
    const keyword = this.data.keyword.trim()
    
    if (!keyword) {
      errorHandler.handle(new Error('请输入搜索关键词'))
      return
    }

    // 保存历史
    this.saveHistory(keyword)

    // 隐藏联想
    this.setData({ 
      showSuggestions: false,
      searched: true  // 标记已执行搜索
    })

    // 执行搜索
    await this.loadProducts()
  },

  /**
   * 加载商品列表
   */
  async loadProducts() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return

    const params = {
      keyword,
      page: 1,
      pageSize: 20
    }

    // 根据排序类型添加参数
    if (this.data.sortType !== 'default') {
      params.sortBy = this.data.sortType
    }

    try {
      const result = await this.loadData(
        () => app.api.search.searchProducts(params),
        { showLoading: true }
      )

      const products = result.list || result.items || []
      this.setData({ products })
      this.setPageEmpty(products.length === 0)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 排序切换
   */
  onSortChange(e) {
    const { sort } = e.currentTarget.dataset
    this.setData({ sortType: sort })
    this.loadProducts()
  },

  /**
   * 点击历史记录
   */
  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ keyword })
    this.onSearch()
  },

  /**
   * 点击热门搜索
   */
  onHotKeywordTap(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ keyword })
    this.onSearch()
  },

  /**
   * 清空搜索历史
   */
  async onClearHistory() {
    const confirmed = await errorHandler.confirm({
      content: '确定清空搜索历史吗？'
    })

    if (!confirmed) return

    try {
      // 清空后端历史（需登录）
      if (app.store.isLoggedIn()) {
        await app.api.search.clearSearchHistory()
      }
      
      // 清空本地历史
      wx.removeStorageSync(STORAGE_KEY.SEARCH_HISTORY)
      this.setData({ history: [] })
      errorHandler.showSuccess('已清空')
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 取消搜索（返回上一页）
   */
  onCancel() {
    wx.navigateBack()
  },

  /**
   * 商品点击
   */
  onProductTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    })
  },

  /**
   * 加入购物车
   */
  async onAddToCart(e) {
    const { id } = e.currentTarget.dataset

    if (!app.store.isLoggedIn()) {
      errorHandler.handle(new Error('请先登录'), { code: 'NOT_LOGGED_IN' })
      return
    }

    try {
      await app.api.cart.addToCart(id, 1)
      errorHandler.showSuccess('已加入购物车')
      app.store.updateCartCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 返回
   */
  onBack() {
    wx.navigateBack()
  }
}))