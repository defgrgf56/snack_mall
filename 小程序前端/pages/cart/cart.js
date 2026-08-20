// pages/cart/cart.js
const { api } = require('../../config/api.js')
const { updateCartItemQuantity, deleteCartItem, calculateTotal } = require('../../utils/cart.js')
const { requireLogin } = require('../../utils/auth.js')
const { formatPrice } = require('../../utils/format.js')

Page({
  data: {
    cartItems: [],
    allSelected: false,
    selectedCount: 0,
    totalPrice: '0.00',
    loading: true
  },

  onLoad() {
  },

  onShow() {
    this.loadCartData()
    
    // 设置TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  /**
   * 加载购物车数据
   */
  async loadCartData() {
    const app = getApp()
    
    // 检查登录状态
    if (!app.globalData.token) {
      this.setData({ 
        loading: false,
        cartItems: [] 
      })
      return
    }
    
    this.setData({ loading: true })
    
    try {
      const res = await api.getCart()
      
      if (res.code === 200) {
        // 添加选中状态
        const items = (res.data || []).map(item => ({
          ...item,
          selected: true  // 默认全选
        }))
        
        this.setData({
          cartItems: items,
          allSelected: items.length > 0
        })
        
        this.calculateTotal()
      }
    } catch (error) {
      console.error('加载购物车失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 选择商品
   */
  onSelectItem(e) {
    const { id } = e.currentTarget.dataset
    const items = this.data.cartItems.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected }
      }
      return item
    })
    
    // 检查是否全选
    const allSelected = items.length > 0 && items.every(item => item.selected)
    
    this.setData({
      cartItems: items,
      allSelected
    })
    
    this.calculateTotal()
  },

  /**
   * 全选/取消全选
   */
  onSelectAll() {
    const allSelected = !this.data.allSelected
    const items = this.data.cartItems.map(item => ({
      ...item,
      selected: allSelected
    }))
    
    this.setData({
      cartItems: items,
      allSelected
    })
    
    this.calculateTotal()
  },

  /**
   * 减少数量
   */
  async onDecreaseQuantity(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.cartItems.find(i => i.id === id)
    
    if (item.quantity <= 1) {
      return
    }
    
    const success = await updateCartItemQuantity(id, item.quantity - 1)
    
    if (success) {
      const items = this.data.cartItems.map(i => {
        if (i.id === id) {
          return { ...i, quantity: i.quantity - 1 }
        }
        return i
      })
      
      this.setData({ cartItems: items })
      this.calculateTotal()
      
      // 更新购物车角标
      const app = getApp()
      app.updateCartCount()
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
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    }
    
    const success = await updateCartItemQuantity(id, item.quantity + 1)
    
    if (success) {
      const items = this.data.cartItems.map(i => {
        if (i.id === id) {
          return { ...i, quantity: i.quantity + 1 }
        }
        return i
      })
      
      this.setData({ cartItems: items })
      this.calculateTotal()
      
      // 更新购物车角标
      const app = getApp()
      app.updateCartCount()
    }
  },

  /**
   * 删除商品
   */
  async onDeleteItem(e) {
    const { id } = e.currentTarget.dataset
    
    const success = await deleteCartItem(id)
    
    if (success) {
      const items = this.data.cartItems.filter(item => item.id !== id)
      
      this.setData({ cartItems: items })
      this.calculateTotal()
      
      // 更新购物车徽标 - 等待更新完成
      const app = getApp()
      await app.updateCartCount()
      
      // 如果购物车为空，显示提示
      if (items.length === 0) {
        wx.showToast({
          title: '购物车已清空',
          icon: 'none'
        })
      }
    }
  },

  /**
   * 计算总价
   */
  calculateTotal() {
    const selectedItems = this.data.cartItems.filter(item => item.selected)
    const selectedIds = selectedItems.map(item => item.id)
    
    const result = calculateTotal(this.data.cartItems, selectedIds)
    
    this.setData({
      selectedCount: result.count,
      totalPrice: result.total
    })
  },

  /**
   * 去结算
   */
  onCheckout() {
    if (this.data.selectedCount === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }
    
    const selectedItems = this.data.cartItems
      .filter(item => item.selected)
      .map(item => item.id)
    
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?cartIds=${selectedItems.join(',')}`
    })
  },

  /**
   * 去逛逛
   */
  onGoShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
