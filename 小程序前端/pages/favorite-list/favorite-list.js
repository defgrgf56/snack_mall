// pages/favorite-list/favorite-list.js - 重构后的收藏列表页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    favoriteList: [],
    selectedIds: [],
    isAllSelected: false,
    isEditMode: false // 编辑模式
  },

  onLoad() {
    this.loadFavorites(true)
  },

  onShow() {
    // 页面显示时不自动刷新
  },

  /**
   * 加载收藏列表
   */
  async loadFavorites(reset = false) {
    try {
      await this.loadList(
        (page, pageSize) => this.fetchFavorites(page, pageSize),
        { reset, listKey: 'favoriteList' }
      )
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 获取收藏数据
   */
  async fetchFavorites(page, pageSize) {
    const params = { page, limit: pageSize }
    return await app.api.favorite.getFavoriteList(params)
  },

  /**
   * 加载更多
   */
  async loadMoreData() {
    await this.loadFavorites(false)
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    this.setData({
      selectedIds: [],
      isAllSelected: false,
      isEditMode: false
    })
    await this.loadFavorites(true)
    wx.stopPullDownRefresh()
  },

  /**
   * 全选/取消全选
   */
  onSelectAll(e) {
    const values = e.detail.value
    const isAll = values.includes('all')

    if (isAll) {
      const allIds = this.data.favoriteList.map(item => item.id)
      this.setData({
        selectedIds: allIds,
        isAllSelected: true
      })
    } else {
      this.setData({
        selectedIds: [],
        isAllSelected: false
      })
    }
  },

  /**
   * 选择单个商品
   */
  onSelectItem(e) {
    const { id } = e.currentTarget.dataset
    const values = e.detail.value
    const isSelected = values.includes(id.toString())

    let selectedIds = [...this.data.selectedIds]

    if (isSelected) {
      if (!selectedIds.includes(id)) {
        selectedIds.push(id)
      }
    } else {
      selectedIds = selectedIds.filter(item => item !== id)
    }

    this.setData({
      selectedIds,
      isAllSelected: selectedIds.length === this.data.favoriteList.length
    })
  },

  /**
   * 批量删除
   */
  async batchDelete() {
    if (this.data.selectedIds.length === 0) {
      errorHandler.showToast('请选择要删除的商品')
      return
    }

    const confirmed = await errorHandler.confirm({
      title: '确认删除',
      content: `确定删除${this.data.selectedIds.length}件收藏商品吗?`
    })

    if (!confirmed) return

    try {
      await app.api.favorite.batchDeleteFavorites(this.data.selectedIds)
      errorHandler.showSuccess('删除成功')

      // 刷新列表
      this.setData({
        selectedIds: [],
        isAllSelected: false,
        isEditMode: false
      })
      await this.loadFavorites(true)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 删除单个收藏
   */
  async deleteFavorite(e) {
    const { id } = e.currentTarget.dataset

    const confirmed = await errorHandler.confirm({
      title: '确认删除',
      content: '确定取消收藏吗?'
    })

    if (!confirmed) return

    try {
      await app.api.favorite.deleteFavorite(id)
      errorHandler.showSuccess('删除成功')

      // 从列表中移除
      const list = this.data.favoriteList.filter(item => item.id !== id)
      const selectedIds = this.data.selectedIds.filter(item => item !== id)

      this.setData({
        favoriteList: list,
        selectedIds,
        isAllSelected: selectedIds.length === list.length && list.length > 0
      })
      this.setPageEmpty(list.length === 0)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 加入购物车
   */
  async addToCart(e) {
    const { id } = e.currentTarget.dataset

    try {
      await app.api.cart.addToCart(id, 1)
      errorHandler.showSuccess('已加入购物车')
      app.store.updateCartCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode,
      selectedIds: [],
      isAllSelected: false
    })
  },

  /**
   * 批量加入购物车
   */
  async batchAddToCart() {
    if (this.data.selectedIds.length === 0) {
      errorHandler.showToast('请选择商品')
      return
    }

    try {
      wx.showLoading({ title: '添加中...', mask: true })

      // 获取选中的商品
      const selectedProducts = this.data.favoriteList.filter(item =>
        this.data.selectedIds.includes(item.id)
      )

      // 依次添加到购物车
      for (let i = 0; i < selectedProducts.length; i++) {
        await app.api.cart.addToCart(selectedProducts[i].product.id, 1)
      }

      wx.hideLoading()
      errorHandler.showSuccess(`已添加${selectedProducts.length}件商品`)
      app.store.updateCartCount()

      // 退出编辑模式
      this.setData({
        isEditMode: false,
        selectedIds: [],
        isAllSelected: false
      })
    } catch (error) {
      wx.hideLoading()
      errorHandler.handle(error)
    }
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
   * 去逛逛
   */
  goShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
}))