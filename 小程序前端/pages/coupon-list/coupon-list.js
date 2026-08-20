// pages/coupon-list/coupon-list.js
Page({
  data: {
    activeTab: 0, // 0:未使用 1:已使用 2:已过期
    tabs: ['未使用', '已使用', '已过期'],
    coupons: [],
    loading: true,
    isEmpty: false
  },

  onLoad(options) {
    // 从参数获取初始tab
    if (options.tab !== undefined) {
      this.setData({ activeTab: parseInt(options.tab) })
    }
    this.loadCoupons()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadCoupons()
  },

  onPullDownRefresh() {
    this.loadCoupons().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 切换Tab
   */
  switchTab(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeTab: index })
    this.loadCoupons()
  },

  /**
   * 加载优惠券列表
   */
  async loadCoupons() {
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

    this.setData({ loading: true })

    return new Promise((resolve) => {
      wx.request({
        url: `${app.globalData.apiBase}/coupons/my`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${app.globalData.token}`
        },
        data: {
          status: this.data.activeTab
        },
        success: (res) => {
          console.log('我的优惠券响应:', res)
          
          if (res.data && res.data.code === 200) {
            const coupons = res.data.data || []
            this.setData({
              coupons,
              isEmpty: coupons.length === 0,
              loading: false
            })
          } else {
            this.setData({
              coupons: [],
              isEmpty: true,
              loading: false
            })
          }
          resolve()
        },
        fail: (error) => {
          console.error('加载优惠券失败:', error)
          this.setData({
            coupons: [],
            isEmpty: true,
            loading: false
          })
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
          resolve()
        }
      })
    })
  },

  /**
   * 使用优惠券（跳转到商品列表）
   */
  useCoupon(e) {
    const { id } = e.currentTarget.dataset
    wx.switchTab({
      url: '/pages/category/category'
    })
  },

  /**
   * 去领券（跳转到首页）
   */
  goGetCoupons() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 格式化优惠券类型
   */
  formatCouponType(type) {
    const typeMap = {
      'general': '通用券',
      'category': '分类券',
      'product': '商品券',
      'newbie': '新人券'
    }
    return typeMap[type] || '优惠券'
  },

  /**
   * 格式化折扣值
   */
  formatDiscount(coupon) {
    if (!coupon) return ''
    
    if (coupon.discount_type === 'amount') {
      return `¥${coupon.discount_value}`
    } else if (coupon.discount_type === 'percent') {
      return `${coupon.discount_value}折`
    }
    return ''
  },

  /**
   * 格式化使用条件
   */
  formatCondition(coupon) {
    if (!coupon) return ''
    
    if (coupon.min_amount > 0) {
      return `满${coupon.min_amount}元可用`
    }
    return '无门槛'
  }
})
