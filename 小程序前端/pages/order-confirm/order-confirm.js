// pages/order-confirm/order-confirm.js - 重构后的订单确认页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    selectedAddress: null,
    products: [],
    deliveryType: 1, // 1:快递配送 2:到店自提
    remark: '',
    couponId: null,
    couponDiscount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    totalPrice: 0,
    finalPrice: 0,
    cartIds: null // 购物车ID，用于提交后清空
  },

  onLoad(options) {
    // 从购物车结算
    if (options.cartIds) {
      this.setData({ cartIds: options.cartIds })
      this.loadFromCart(options.cartIds)
    }
    // 直接购买
    else if (options.productId) {
      this.loadFromProduct(options.productId, options.quantity, options.spec)
    }

    this.loadDefaultAddress()
  },

  /**
   * 从购物车加载商品
   */
  async loadFromCart(cartIds) {
    try {
      const result = await this.loadData(
        () => app.api.cart.settle(cartIds),
        { showLoading: true }
      )

      const items = result.items || []
      this.setData({ products: items })
      this.calculatePrice()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 从商品直接购买
   */
  async loadFromProduct(productId, quantity, spec) {
    try {
      const product = await this.loadData(
        () => app.api.product.getProductDetail(productId),
        { showLoading: true }
      )

      const productData = [{
        product_id: product.id,
        product,
        quantity: parseInt(quantity) || 1,
        spec: spec || ''
      }]

      this.setData({ products: productData })
      this.calculatePrice()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 加载默认地址
   */
  async loadDefaultAddress() {
    try {
      const address = await app.api.address.getDefaultAddress()
      if (address) {
        this.setData({ selectedAddress: address })
      }
    } catch (error) {
      // 静默失败，没有默认地址很正常
    }
  },

  /**
   * 选择地址
   */
  onSelectAddress() {
    const currentId = this.data.selectedAddress?.id
    wx.navigateTo({
      url: `/pages/address-list/address-list?select=1${currentId ? `&currentId=${currentId}` : ''}`
    })
  },

  /**
   * 地址选中回调（从地址列表页返回）
   */
  async onAddressSelected(addressId) {
    try {
      const address = await app.api.address.getAddressDetail(addressId)
      this.setData({ selectedAddress: address })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 配送方式切换
   */
  onDeliveryTypeChange(e) {
    this.setData({
      deliveryType: parseInt(e.detail.value)
    })
    this.calculatePrice()
  },

  /**
   * 备注输入
   */
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  /**
   * 选择优惠券
   */
  onSelectCoupon() {
    const { totalPrice, couponId } = this.data
    wx.navigateTo({
      url: `/pages/coupon-select/coupon-select?orderAmount=${totalPrice}${couponId ? `&currentCouponId=${couponId}` : ''}`
    })
  },

  /**
   * 计算价格
   */
  calculatePrice() {
    const products = this.data.products
    let totalPrice = 0

    products.forEach(item => {
      const price = parseFloat(item.product.price) || 0
      const quantity = parseInt(item.quantity) || 0
      totalPrice += price * quantity
    })

    const couponDiscount = parseFloat(this.data.couponDiscount) || 0
    const pointsDiscount = parseFloat(this.data.pointsDiscount) || 0
    const finalPrice = Math.max(0, totalPrice - couponDiscount - pointsDiscount)

    this.setData({
      totalPrice: totalPrice.toFixed(2),
      finalPrice: finalPrice.toFixed(2)
    })
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { selectedAddress, deliveryType } = this.data

    // 快递配送必须选择地址
    if (deliveryType === 1 && !selectedAddress) {
      throw new Error('请选择收货地址')
    }

    return true
  },

  /**
   * 提交订单
   */
  async onSubmit() {
    try {
      // 验证表单
      this.validateForm()

      const { selectedAddress, deliveryType, products, remark, couponId, pointsUsed, cartIds } = this.data

      const orderData = {
        address_id: selectedAddress?.id,
        delivery_type: deliveryType,
        remark,
        coupon_id: couponId,
        points_used: pointsUsed,
        items: products.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          spec: item.spec
        }))
      }

      // 如果从购物车结算，传递cart_ids用于清空购物车
      if (cartIds) {
        orderData.cart_ids = cartIds.split(',').map(id => parseInt(id))
      }

      const result = await app.api.order.createOrder(orderData)

      errorHandler.showSuccess('订单创建成功')

      // 跳转到订单列表的待付款tab
      this.$setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order-list/order-list?status=1`
        })
      }, 1500)
    } catch (error) {
      errorHandler.handle(error)
    }
  }
}))