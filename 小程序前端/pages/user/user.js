// pages/user/user.js
const { api } = require('../../config/api.js')
const { quickLogin, logout } = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    orderStats: {
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0
    },
    unreadCount: 0, // 未读消息数量
    safeAreaBottom: 0,
    tabBarHeight: 50
  },

  onLoad() {
    this.setSafeArea();
  },

  /**
   * 设置安全区域
   */
  setSafeArea() {
    const systemInfo = wx.getSystemInfoSync();
    const safeAreaBottom = systemInfo.safeArea ? 
      systemInfo.screenHeight - systemInfo.safeArea.bottom : 0;
    
    this.setData({
      safeAreaBottom: safeAreaBottom,
      tabBarHeight: 80 // TabBar高度约80px（增加到80）
    });
  },

  onShow() {
    this.loadUserData()
    
    // 更新购物车数量
    const app = getApp()
    if (app.updateCartCount) {
      app.updateCartCount()
    }
    
    // 设置TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  /**
   * 加载用户数据
   */
  async loadUserData() {
    const app = getApp()
    
    if (!app.globalData.token) {
      this.setData({
        userInfo: null
      })
      return
    }
    
    try {
      // 加载用户信息
      const userRes = await api.getUserInfo()
      const statsRes = await api.getOrderStats()

      this.setData({
        userInfo: userRes.data,
        orderStats: statsRes.data || {
          pending: 0,
          paid: 0,
          shipped: 0,
          completed: 0
        }
      })
      
      // 加载未读消息数量
      this.loadUnreadCount()
    } catch (error) {
      console.error('加载用户数据失败:', error)
    }
  },

  /**
   * 加载未读消息数量
   */
  async loadUnreadCount() {
    try {
      const { request } = require('../../utils/request')
      const res = await request({
        url: '/notifications/unread-count',
        method: 'GET'
      })
      
      if (res.code === 200) {
        this.setData({
          unreadCount: res.data.count
        })
      }
    } catch (error) {
      console.error('加载未读消息数量失败:', error)
    }
  },

  /**
   * 登录 - 自动根据环境选择登录方式
   */
  async onLogin() {
    try {
      // 获取运行环境
      const accountInfo = wx.getAccountInfoSync()
      const envVersion = accountInfo.miniProgram.envVersion
      
      // develop: 开发版, trial: 体验版, release: 正式版
      const isDev = envVersion === 'develop'
      
      let userInfo
      if (isDev) {
        // 开发环境使用快速登录
        console.log('使用开发登录')
        userInfo = await quickLogin()
      } else {
        // 生产环境使用微信登录
        console.log('使用微信登录')
        const { wxLogin } = require('../../utils/auth.js')
        userInfo = await wxLogin()
      }
      
      // 刷新页面数据
      this.loadUserData()
    } catch (error) {
      console.error('登录失败:', error)
    }
  },

  /**
   * 退出登录
   */
  onLogout() {
    logout()
    
    // 清空页面数据
    this.setData({
      userInfo: null,
      orderStats: {
        pending: 0,
        paid: 0,
        shipped: 0,
        completed: 0
      }
    })
  },

  /**
   * 查看订单列表
   */
  onViewOrders(e) {
    const { status } = e.currentTarget.dataset
    
    if (!this.data.userInfo) {
      this.onLogin()
      return
    }
    
    wx.navigateTo({
      url: `/pages/order-list/order-list?status=${status}`
    })
  },

  /**
   * 查看全部订单
   */
  onViewAllOrders() {
    if (!this.data.userInfo) {
      this.onLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/order-list/order-list'
    })
  },

  /**
   * 页面导航
   */
  onNavigate(e) {
    const { url } = e.currentTarget.dataset
    
    if (!this.data.userInfo && url !== '/pages/test-api/test-api') {
      this.onLogin()
      return
    }
    
    wx.navigateTo({
      url
    })
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
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadUserData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
