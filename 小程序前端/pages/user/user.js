// pages/user/user.js - 重构后的用户中心页面
const createPageMixin = require('../../mixins/page-mixin')
const { ORDER_STATUS } = require('../../constants/index')
const errorHandler = require('../../utils/error-handler')
const { IS_DEV } = require('../../config/env')

const app = getApp()

Page(createPageMixin({
  data: {
    userInfo: null,
    orderStats: {
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0
    },
    unreadCount: 0,
    safeAreaBottom: 0,
    tabBarHeight: 80
  },

  onLoad() {
    this.setSafeArea()
  },

  onShow() {
    this.loadUserData()

    // 设置 TabBar 选中状态和购物车数量
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ 
        selected: 3,
        cartCount: app.store.getState('cartCount') || 0
      })
    }
  },

  /**
   * 设置安全区域
   */
  setSafeArea() {
    const systemInfo = app.store.getState('systemInfo')
    const safeAreaBottom = systemInfo.safeArea
      ? systemInfo.screenHeight - systemInfo.safeArea.bottom
      : 0

    this.setData({
      safeAreaBottom,
      tabBarHeight: 80
    })
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    if (!app.store.isLoggedIn()) {
      this.setData({
        userInfo: null,
        orderStats: { pending: 0, paid: 0, shipped: 0, completed: 0 }
      })
      return
    }

    try {
      // 并行加载用户信息和订单统计
      const [userInfo, orderStats] = await Promise.all([
        app.api.user.getUserInfo(),
        app.api.user.getOrderStats()
      ])

      this.setData({
        userInfo,
        orderStats: orderStats || { pending: 0, paid: 0, shipped: 0, completed: 0 }
      })

      // 加载未读消息数量
      this.loadUnreadCount()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 加载未读消息数量
   */
  async loadUnreadCount() {
    try {
      // TODO: 调用未读消息接口
      // const result = await app.api.xxx.getUnreadCount()
      // this.setData({ unreadCount: result.count })
    } catch (error) {
      // 静默失败
    }
  },

  /**
   * 登录
   */
  async onLogin() {
    try {
      let userInfo

      if (IS_DEV) {
        // 开发环境使用快速登录
        const result = await app.devLogin()
        userInfo = result
      } else {
        // 生产环境使用微信登录
        userInfo = await app.login()
      }

      // 刷新页面数据
      this.loadUserData()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 退出登录
   */
  async onLogout() {
    const confirmed = await errorHandler.confirm({
      content: '确定要退出登录吗？'
    })

    if (!confirmed) return

    app.logout()

    // 清空页面数据
    this.setData({
      userInfo: null,
      orderStats: { pending: 0, paid: 0, shipped: 0, completed: 0 }
    })

    errorHandler.showSuccess('已退出登录')
  },

  /**
   * 查看订单列表
   */
  onViewOrders(e) {
    if (!this.checkLogin()) return

    const { status } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/order-list/order-list?status=${status}`
    })
  },

  /**
   * 查看全部订单
   */
  onViewAllOrders() {
    if (!this.checkLogin()) return

    wx.navigateTo({
      url: '/pages/order-list/order-list'
    })
  },

  /**
   * 页面导航
   */
  onNavigate(e) {
    const { url, requireLogin } = e.currentTarget.dataset

    // 某些页面不需要登录
    if (requireLogin !== false && !this.checkLogin()) {
      return
    }

    wx.navigateTo({ url })
  },

  /**
   * 检查登录状态
   */
  checkLogin() {
    if (!app.store.isLoggedIn()) {
      this.onLogin()
      return false
    }
    return true
  },

  /**
   * 联系客服
   */
  onContact() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
}))