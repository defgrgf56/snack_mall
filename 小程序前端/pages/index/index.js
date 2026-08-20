// pages/index/index.js
const { api } = require('../../config/api.js')
const { addToCart } = require('../../utils/cart.js')

Page({
  data: {
    banners: [],
    categories: [],
    hotProducts: [],
    newProducts: [],
    coupons: [],           // 优惠券列表
    seckills: [],          // 秒杀列表
    activities: [],        // 活动列表
    seckillCountdown: 0,   // 秒杀倒计时（秒）
    seckillHours: '00',    // 秒杀小时
    seckillMinutes: '00',  // 秒杀分钟
    seckillSeconds: '00',  // 秒杀秒数
    countdownTimer: null,  // 倒计时定时器
    loading: true,
    navBarHeight: 0,  // 导航栏高度
    menuTop: 0,       // 胶囊按钮上边距
    menuHeight: 0,    // 胶囊按钮高度
    menuLeft: 0,      // 胶囊按钮左边距
    logoRight: 0      // 右侧Logo的right值
  },

  onLoad() {
    this.setNavBarInfo()
    this.loadData()
  },

  onUnload() {
    // 页面卸载时清除倒计时定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
  },

  /**
   * 设置导航栏信息
   */
  setNavBarInfo() {
    // 获取胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    
    // 计算导航栏高度：胶囊按钮下边距 + 胶囊按钮上边距
    const navBarHeight = menuButtonInfo.bottom + menuButtonInfo.top - systemInfo.statusBarHeight
    
    // 计算右侧Logo的right值：屏幕宽度 - 胶囊左边距 + 留出20rpx间距
    // 需要将rpx转为px: rpx / 750 * windowWidth
    const logoRight = systemInfo.windowWidth - menuButtonInfo.left + (20 / 750 * systemInfo.windowWidth)
    
    console.log('微信胶囊位置信息:', menuButtonInfo)
    console.log('系统信息:', systemInfo)
    console.log('计算的logoRight:', logoRight)
    
    this.setData({
      navBarHeight: navBarHeight,
      menuTop: menuButtonInfo.top,
      menuHeight: menuButtonInfo.height,
      menuLeft: menuButtonInfo.left,
      logoRight: logoRight
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
        this.loadNewProducts(),
        this.loadCoupons(),
        this.loadSeckills(),
        this.loadActivities()
      ])

      // 提取成功的结果
      const banners = results[0].status === 'fulfilled' ? results[0].value : []
      const categories = results[1].status === 'fulfilled' ? results[1].value : []
      const hotProducts = results[2].status === 'fulfilled' ? results[2].value : []
      const newProducts = results[3].status === 'fulfilled' ? results[3].value : []
      const coupons = results[4].status === 'fulfilled' ? results[4].value : []
      const seckills = results[5].status === 'fulfilled' ? results[5].value : []
      const activities = results[6].status === 'fulfilled' ? results[6].value : []

      console.log('轮播图数量:', banners.length)
      console.log('分类数量:', categories.length)
      console.log('热门商品数量:', hotProducts.length)
      console.log('新品数量:', newProducts.length)
      console.log('优惠券数量:', coupons.length)
      console.log('秒杀数量:', seckills.length)
      console.log('活动数量:', activities.length)

      this.setData({
        banners,
        categories: categories.slice(0, 8), // 只显示前8个分类
        hotProducts,
        newProducts,
        coupons: coupons.slice(0, 5), // 只显示前5个优惠券
        seckills: seckills.slice(0, 10), // 只显示前10个秒杀商品
        activities: activities.slice(0, 4), // 只显示前4个活动
        loading: false
      })

      // 启动秒杀倒计时
      if (seckills.length > 0) {
        this.startSeckillCountdown()
      }
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
   * 加载优惠券
   */
  async loadCoupons() {
    try {
      const res = await api.getCoupons()
      return res.data || []
    } catch (error) {
      console.log('加载优惠券失败', error)
      return []
    }
  },

  /**
   * 加载秒杀活动
   */
  loadSeckills() {
    return new Promise((resolve) => {
      wx.request({
        url: `${getApp().globalData.apiBase}/seckills`,
        method: 'GET',
        data: {
          status: 1, // 进行中
          pageSize: 10
        },
        success: (res) => {
          console.log('秒杀API响应:', res)
          if (res.data && res.data.code === 200) {
            resolve(res.data.data.list || [])
          } else {
            resolve([])
          }
        },
        fail: (error) => {
          console.error('加载秒杀活动失败', error)
          resolve([])
        }
      })
    })
  },

  /**
   * 加载活动专区
   */
  loadActivities() {
    return new Promise((resolve) => {
      wx.request({
        url: `${getApp().globalData.apiBase}/activities`,
        method: 'GET',
        data: {
          status: 1, // 进行中
          pageSize: 6
        },
        success: (res) => {
          console.log('活动API响应:', res)
          if (res.data && res.data.code === 200) {
            resolve(res.data.data.list || [])
          } else {
            resolve([])
          }
        },
        fail: (error) => {
          console.error('加载活动专区失败', error)
          resolve([])
        }
      })
    })
  },

  /**
   * 启动秒杀倒计时
   */
  startSeckillCountdown() {
    // 清除旧的定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }

    // 获取第一个秒杀的剩余时间
    const seckills = this.data.seckills
    if (seckills.length === 0) return

    let countdown = seckills[0].remaining_time || 0

    // 更新倒计时显示
    const updateCountdown = () => {
      if (countdown <= 0) {
        clearInterval(this.data.countdownTimer)
        // 重新加载秒杀数据
        this.loadSeckills().then(data => {
          this.setData({ seckills: data.slice(0, 10) })
          if (data.length > 0) {
            this.startSeckillCountdown()
          }
        })
        return
      }

      const hours = Math.floor(countdown / 3600)
      const minutes = Math.floor((countdown % 3600) / 60)
      const seconds = countdown % 60

      this.setData({
        seckillCountdown: countdown,
        seckillHours: hours.toString().padStart(2, '0'),
        seckillMinutes: minutes.toString().padStart(2, '0'),
        seckillSeconds: seconds.toString().padStart(2, '0')
      })

      countdown--
    }

    // 立即执行一次
    updateCountdown()

    // 每秒更新一次
    const timer = setInterval(updateCountdown, 1000)
    this.setData({ countdownTimer: timer })
  },

  /**
   * 领取优惠券
   */
  receiveCoupon(e) {
    const { id } = e.currentTarget.dataset
    const app = getApp()

    // 检查登录状态
    if (!app.globalData.token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      // 跳转到登录页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/user/user' })
      }, 1500)
      return
    }

    wx.showLoading({ title: '领取中...' })

    wx.request({
      url: `${app.globalData.apiBase}/coupons/receive`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      data: { coupon_id: id },
      success: (res) => {
        wx.hideLoading()
        console.log('领取优惠券响应:', res)
        
        if (res.data && res.data.code === 200) {
          wx.showToast({
            title: '领取成功',
            icon: 'success'
          })
          // 重新加载优惠券列表
          this.loadCoupons().then(coupons => {
            this.setData({ coupons: coupons.slice(0, 5) })
          })
        } else {
          wx.showToast({
            title: res.data?.message || '领取失败',
            icon: 'none'
          })
        }
      },
      fail: (error) => {
        wx.hideLoading()
        console.error('领取优惠券失败:', error)
        wx.showToast({
          title: '领取失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 跳转到我的优惠券
   */
  goMyCoupons() {
    const app = getApp()
    if (!app.globalData.token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/user/user' })
      }, 1500)
      return
    }

    wx.navigateTo({
      url: '/pages/coupon-list/coupon-list'
    })
  },

  /**
   * 跳转到秒杀列表（暂未实现）
   */
  goSeckillList() {
    wx.showToast({
      title: '秒杀列表页开发中',
      icon: 'none'
    })
  },

  /**
   * 跳转到活动详情
   */
  goActivityDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.showToast({
      title: '活动详情页开发中',
      icon: 'none'
    })
    // 后续实现：
    // wx.navigateTo({
    //   url: `/pages/activity-detail/activity-detail?id=${id}`
    // })
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
    
    // catchtap 会自动阻止冒泡，不需要手动调用 stopPropagation
    
    const success = await addToCart(id, 1)
    if (success) {
      // 刷新购物车数量
      const app = getApp()
      app.updateCartCount()
    }
  }
})
