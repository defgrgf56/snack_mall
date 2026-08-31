// pages/cart/cart.js - 重构后的购物车页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    cartItems: [],
    allSelected: false,
    selectedCount: 0,
    totalPrice: '0.00'
  },

  onShow() {
    this.loadCartData()
    
    // 设置 TabBar 选中状态和购物车数量
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ 
        selected: 2,
        cartCount: app.store.getState('cartCount') || 0
      })
    }
  },

  /**
   * 加载购物车数据
   */
  async loadCartData() {
    // 检查登录
    if (!app.store.isLoggedIn()) {
      this.setData({ cartItems: [] })
      this.setPageEmpty(true)
      app.store.setCartCount(0) // 未登录时清零角标
      return
    }

    try {
      const items = await this.loadData(
        () => app.api.cart.getCart(),
        { showLoading: false }
      )

      // 使用后端返回的选中状态，不再强制全选
      const cartItems = items.map(item => ({
        ...item,
        selected: item.selected === 1 // 将数据库的1/0转换为true/false
      }))

      // 根据实际选中状态判断是否全选
      const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected)

      this.setData({
        cartItems,
        allSelected
      })

      this.calculateTotal()
      
      // 更新购物车角标数量
      app.store.updateCartCount()
    } catch (error) {
      this.setData({ cartItems: [] })
      app.store.setCartCount(0) // 加载失败时清零角标
    }
  },

  /**
   * 选择商品
   */
  async onSelectItem(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.cartItems.find(i => i.id === id)
    const newSelected = !item.selected

    try {
      // 先更新后端状态
      await app.api.cart.updateCartSelected(id, newSelected ? 1 : 0)

      // 更新成功后再更新前端状态
      const cartItems = this.data.cartItems.map(item => {
        if (item.id === id) {
          return { ...item, selected: newSelected }
        }
        return item
      })

      const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected)

      this.setData({ cartItems, allSelected })
      this.calculateTotal()
      
      // 更新购物车角标（只统计选中商品）
      app.store.updateCartCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 全选/取消全选
   */
  async onSelectAll() {
    const allSelected = !this.data.allSelected
    const cartIds = this.data.cartItems.map(item => item.id)

    try {
      // 批量更新后端状态
      await app.api.cart.batchUpdateCartSelected(cartIds, allSelected ? 1 : 0)

      // 更新成功后再更新前端状态
      const cartItems = this.data.cartItems.map(item => ({
        ...item,
        selected: allSelected
      }))

      this.setData({ cartItems, allSelected })
      this.calculateTotal()
      
      // 更新购物车角标（只统计选中商品）
      app.store.updateCartCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 减少数量
   */
  async onDecreaseQuantity(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.cartItems.find(i => i.id === id)

    if (item.quantity <= 1) return

    try {
      await app.api.cart.updateCartItem(id, item.quantity - 1)
      
      const cartItems = this.data.cartItems.map(i => {
        if (i.id === id) {
          return { ...i, quantity: i.quantity - 1 }
        }
        return i
      })

      this.setData({ cartItems })
      this.calculateTotal()
      app.store.updateCartCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 增加数量
   */
  async onIncreaseQuantity(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.cartItems.find(i => i.id === id)

    // 检查库存
    if (item.quantity >= item.product.stock) {
      errorHandler.handle(new Error('库存不足'))
      return
    }

    try {
      await app.api.cart.updateCartItem(id, item.quantity + 1)
      
      const cartItems = this.data.cartItems.map(i => {
        if (i.id === id) {
          return { ...i, quantity: i.quantity + 1 }
        }
        return i
      })

      this.setData({ cartItems })
      this.calculateTotal()
      app.store.updateCartCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 删除商品
   */
  async onDeleteItem(e) {
    const { id } = e.currentTarget.dataset

    const confirmed = await errorHandler.confirm({
      content: '确定要删除这个商品吗？'
    })

    if (!confirmed) return

    try {
      await app.api.cart.deleteCartItem(id)
      
      const cartItems = this.data.cartItems.filter(item => item.id !== id)
      
      this.setData({ cartItems })
      this.calculateTotal()
      
      if (cartItems.length === 0) {
        this.setPageEmpty(true)
      }

      errorHandler.showSuccess('删除成功')
      app.store.updateCartCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 计算总价
   */
  calculateTotal() {
    const selectedItems = this.data.cartItems.filter(item => item.selected)
    
    let totalPrice = 0
    let selectedCount = 0

    selectedItems.forEach(item => {
      // 优先使用活动价格，没有活动价格则使用商品原价
      const price = item.actual_price || item.product.price
      totalPrice += parseFloat(price) * item.quantity
      selectedCount += item.quantity
    })

    this.setData({
      selectedCount,
      totalPrice: totalPrice.toFixed(2)
    })
  },

  /**
   * 去结算
   */
  onCheckout() {
    if (this.data.selectedCount === 0) {
      errorHandler.handle(new Error('请选择商品'))
      return
    }

    const selectedIds = this.data.cartItems
      .filter(item => item.selected)
      .map(item => item.id)

    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?cartIds=${selectedIds.join(',')}`
    })
  },

  /**
   * 去逛逛
   */
  onGoShopping() {
    wx.switchTab({ url: '/pages/index/index' })
  }
}))