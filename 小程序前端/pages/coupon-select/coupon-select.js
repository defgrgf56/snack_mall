// pages/coupon-select/coupon-select.js
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    orderAmount: 0, // 订单金额
    selectedCouponId: null,
    selectedDiscount: 0,
    availableCoupons: [],
    unavailableCoupons: []
  },

  onLoad(options) {
    const orderAmount = parseFloat(options.orderAmount) || 0
    const currentCouponId = options.currentCouponId ? parseInt(options.currentCouponId) : null
    
    this.setData({ 
      orderAmount,
      selectedCouponId: currentCouponId
    })
    
    this.loadCoupons()
  },

  /**
   * 加载优惠券列表
   */
  async loadCoupons() {
    try {
      this.setPageLoading(true)
      
      const coupons = await app.api.coupon.getMyCoupons({ status: 0 })
      
      // 分类：可用和不可用
      const available = []
      const unavailable = []
      const now = new Date()
      
      coupons.forEach(item => {
        const coupon = item.coupon
        if (!coupon) return
        
        // 检查是否过期
        if (new Date(item.expire_time) < now) {
          unavailable.push({
            ...item,
            reason: '已过期',
            display_amount: this.getDisplayAmount(coupon)
          })
          return
        }
        
        // 检查订单金额是否满足
        if (this.data.orderAmount < coupon.min_amount) {
          unavailable.push({
            ...item,
            reason: `订单需满${coupon.min_amount}元`,
            display_amount: this.getDisplayAmount(coupon)
          })
          return
        }
        
        // 计算优惠金额
        let discountAmount = 0
        if (coupon.discount_type === 1) {
          // 固定金额
          discountAmount = parseFloat(coupon.discount_value)
        } else if (coupon.discount_type === 2) {
          // 折扣
          const discountRate = parseFloat(coupon.discount_value) / 10
          discountAmount = this.data.orderAmount * (1 - discountRate)
        }
        
        available.push({
          ...item,
          discount_amount: discountAmount.toFixed(2)
        })
      })
      
      // 按优惠金额倒序排列
      available.sort((a, b) => parseFloat(b.discount_amount) - parseFloat(a.discount_amount))
      
      this.setData({
        availableCoupons: available,
        unavailableCoupons: unavailable
      })
    } catch (error) {
      errorHandler.handle(error)
    } finally {
      this.setPageLoading(false)
    }
  },

  /**
   * 获取优惠券显示金额
   */
  getDisplayAmount(coupon) {
    if (coupon.discount_type === 1) {
      // 固定金额：直接显示
      return parseFloat(coupon.discount_value).toFixed(2)
    } else if (coupon.discount_type === 2) {
      // 折扣：显示折扣率
      return `${coupon.discount_value}折`
    }
    return '0'
  },

  /**
   * 选择优惠券
   */
  onSelectCoupon(e) {
    const { id, discount } = e.currentTarget.dataset
    this.setData({
      selectedCouponId: id,
      selectedDiscount: parseFloat(discount)
    })
  },

  /**
   * 不使用优惠券
   */
  onCancel() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    
    if (prevPage) {
      prevPage.setData({
        couponId: null,
        couponDiscount: 0
      })
      prevPage.calculatePrice()
    }
    
    wx.navigateBack()
  },

  /**
   * 确认选择
   */
  onConfirm() {
    if (!this.data.selectedCouponId) {
      errorHandler.showToast('请选择优惠券')
      return
    }
    
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    
    if (prevPage) {
      prevPage.setData({
        couponId: this.data.selectedCouponId,
        couponDiscount: this.data.selectedDiscount
      })
      prevPage.calculatePrice()
    }
    
    wx.navigateBack()
  }
}))