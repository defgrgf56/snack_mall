// pages/category/category.js - 重构后的分类页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    categories: [],
    currentIndex: 0,
    products: [],
    currentCategoryId: null,
    
    // 排序
    sortType: 'default', // default, sales, price, new
    priceOrder: 'desc', // asc, desc
    
    // 高度
    windowHeight: 0,
    searchBarHeight: 0,
    circleNavHeight: 0,
    filterBarHeight: 0,
    mainContentHeight: 0,
    productsScrollHeight: 0,
    emptyStateHeight: 0
  },

  onLoad(options) {
    this.setWindowHeight()
    this.loadCategories()
  },

  onShow() {
    // 设置 TabBar 选中状态和购物车数量
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ 
        selected: 1,
        cartCount: app.store.getState('cartCount') || 0
      })
    }
  },

  /**
   * 设置窗口高度
   */
  setWindowHeight() {
    const systemInfo = app.store.getState('systemInfo')
    const windowHeight = systemInfo.windowHeight
    
    // 转换rpx到px
    const rpxToPx = systemInfo.windowWidth / 750
    
    const searchBarHeight = 70 * rpxToPx
    const circleNavHeight = 160 * rpxToPx
    const filterBarHeight = 88 * rpxToPx
    
    const mainContentHeight = windowHeight - searchBarHeight - circleNavHeight
    const productsScrollHeight = mainContentHeight - filterBarHeight
    
    this.setData({
      windowHeight,
      searchBarHeight,
      circleNavHeight,
      filterBarHeight,
      mainContentHeight,
      productsScrollHeight,
      emptyStateHeight: productsScrollHeight
    })
  },

  /**
   * 加载分类列表
   */
  async loadCategories() {
    try {
      const categories = await this.loadData(
        () => app.api.product.getCategories(),
        { showLoading: true }
      )

      if (categories.length > 0) {
        this.setData({
          categories,
          currentCategoryId: categories[0].id
        })

        this.loadProducts(categories[0].id)
      }
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 加载商品列表
   */
  async loadProducts(categoryId) {
    const params = {
      category_id: categoryId,
      status: 1,
      page: 1,
      limit: 20
    }

    // 根据排序类型添加参数
    switch (this.data.sortType) {
      case 'sales':
        params.order_by = 'sales'
        params.order = 'desc'
        break
      case 'price':
        params.order_by = 'price'
        params.order = this.data.priceOrder
        break
      case 'new':
        params.order_by = 'created_at'
        params.order = 'desc'
        break
    }

    try {
      this.setPageLoading(true)
      
      const result = await app.api.product.getProducts(params)
      
      // 处理商品数据，添加榜单信息
      const products = (result.items || []).map((item, index) => {
        if (index < 3 && this.data.sortType === 'sales') {
          item.rank = index + 1
          item.rank_text = `${['热销', '畅销', '爆款'][index]}榜第${index + 1}名`
        }
        return item
      })

      this.setData({ products })
      this.setPageEmpty(products.length === 0)
    } catch (error) {
      // 错误已统一处理
    } finally {
      this.setPageLoading(false)
    }
  },

  /**
   * 切换分类
   */
  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index
    const categoryId = this.data.categories[index].id

    this.setData({
      currentIndex: index,
      currentCategoryId: categoryId,
      sortType: 'default',
      priceOrder: 'desc'
    })

    this.loadProducts(categoryId)
  },

  /**
   * 排序切换
   */
  onSortChange(e) {
    const type = e.currentTarget.dataset.type
    let priceOrder = this.data.priceOrder

    // 如果点击价格排序，切换升降序
    if (type === 'price') {
      if (this.data.sortType === 'price') {
        priceOrder = priceOrder === 'asc' ? 'desc' : 'asc'
      } else {
        priceOrder = 'desc'
      }
    }

    this.setData({
      sortType: type,
      priceOrder
    })

    this.loadProducts(this.data.currentCategoryId)
  },

  /**
   * 搜索
   */
  onSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
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
  }
}))