// pages/order-detail/order-detail.js - 重构后的订单详情页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')
const { ORDER_STATUS } = require('../../constants/index')

const app = getApp()

Page(createPageMixin({
  data: {
    orderId: null,
    order: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id })
      this.loadOrderDetail(options.id)
    }
  },

  onShow() {
    // 每次显示时刷新订单详情
    if (this.data.orderId) {
      this.loadOrderDetail(this.data.orderId)
    }
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail(id) {
    try {
      const order = await this.loadData(
        () => app.api.order.getOrderDetail(id),
        { showLoading: true }
      )

      // 处理订单数据
      order.status_text = this.getStatusText(order.status)
      order.status_class = this.getStatusClass(order.status)
      order.item_count = order.items.reduce((sum, item) => sum + item.quantity, 0)

      // 字段映射：后端 -> 前端
      order.product_amount = order.total_amount
      order.delivery_fee = order.freight_amount || 0
      order.coupon_discount = order.discount_amount || 0
      order.total_amount = order.pay_amount

      this.setData({ order })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 复制订单号
   */
  onCopyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.order_no,
      success: () => {
        errorHandler.showSuccess('已复制')
      }
    })
  },

  /**
   * 联系客服
   */
  onContact() {
    errorHandler.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567',
      showCancel: false
    })
  },

  /**
   * 取消订单
   */
  async onCancelOrder() {
    const confirmed = await errorHandler.confirm({
      content: '确定取消这个订单吗？'
    })

    if (!confirmed) return

    try {
      await app.api.order.cancelOrder(this.data.orderId)
      errorHandler.showSuccess('已取消')
      this.loadOrderDetail(this.data.orderId)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 去支付
   */
  async onPayOrder() {
    try {
      await app.api.order.payOrderMock(this.data.orderId)
      errorHandler.showSuccess('支付成功')
      
      // 延迟刷新订单详情，让用户看到成功提示
      this.$setTimeout(() => {
        this.loadOrderDetail(this.data.orderId)
      }, 1500)
    } catch (error) {
      // 错误已由 errorHandler 统一处理
    }
  },

  /**
   * 查看物流
   */
  onViewLogistics() {
    // TODO: 接入物流查询
    errorHandler.showToast('物流功能开发中')
  },

  /**
   * 申请退款
   */
  onApplyRefund() {
    wx.navigateTo({
      url: `/pages/refund-apply/refund-apply?orderId=${this.data.orderId}`
    })
  },

  /**
   * 确认收货
   */
  async onConfirmReceive() {
    const confirmed = await errorHandler.confirm({
      content: '确认已收到货物吗？'
    })

    if (!confirmed) return

    try {
      await app.api.order.confirmReceive(this.data.orderId)
      errorHandler.showSuccess('确认成功')
      this.loadOrderDetail(this.data.orderId)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 去评价
   */
  onComment() {
    const order = this.data.order

    // 检查是否有未评价的商品
    const unReviewedItems = order.items.filter(item => !item.is_reviewed)

    if (unReviewedItems.length === 0) {
      errorHandler.showToast('所有商品已评价')
      return
    }

    // 只有一个未评价商品，直接跳转
    if (unReviewedItems.length === 1) {
      wx.navigateTo({
        url: `/pages/review-submit/review-submit?orderItemId=${unReviewedItems[0].id}`
      })
      return
    }

    // 多个未评价商品，显示选择列表
    const itemNames = unReviewedItems.map(item => item.product_name || item.product.name)

    wx.showActionSheet({
      itemList: itemNames,
      success: (res) => {
        const selectedItem = unReviewedItems[res.tapIndex]
        wx.navigateTo({
          url: `/pages/review-submit/review-submit?orderItemId=${selectedItem.id}`
        })
      }
    })
  },

  /**
   * 查看评价
   */
  onViewReviews() {
    const order = this.data.order

    // 只有一个商品，直接跳转
    if (order.items.length === 1) {
      wx.navigateTo({
        url: `/pages/review-list/review-list?productId=${order.items[0].product_id}`
      })
      return
    }

    // 多个商品，显示选择列表
    const itemNames = order.items.map(item => item.product_name || item.product.name)

    wx.showActionSheet({
      itemList: itemNames,
      success: (res) => {
        const selectedItem = order.items[res.tapIndex]
        wx.navigateTo({
          url: `/pages/review-list/review-list?productId=${selectedItem.product_id}`
        })
      }
    })
  },

  /**
   * 删除订单
   */
  async onDeleteOrder() {
    const confirmed = await errorHandler.confirm({
      content: '确定删除这个订单吗？'
    })

    if (!confirmed) return

    try {
      await app.api.order.deleteOrder(this.data.orderId)
      errorHandler.showSuccess('删除成功')

      this.$setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const statusMap = {
      [ORDER_STATUS.PENDING_PAYMENT]: '待付款',
      [ORDER_STATUS.PENDING_DELIVERY]: '待发货',
      [ORDER_STATUS.PENDING_RECEIVE]: '待收货',
      [ORDER_STATUS.COMPLETED]: '已完成',
      [ORDER_STATUS.CANCELLED]: '已取消',
      [ORDER_STATUS.REFUNDED]: '已退款'
    }
    return statusMap[status] || '未知'
  },

  /**
   * 获取状态样式类名
   */
  getStatusClass(status) {
    const classMap = {
      [ORDER_STATUS.PENDING_PAYMENT]: 'pending',
      [ORDER_STATUS.PENDING_DELIVERY]: 'paid',
      [ORDER_STATUS.PENDING_RECEIVE]: 'shipped',
      [ORDER_STATUS.COMPLETED]: 'completed',
      [ORDER_STATUS.CANCELLED]: 'cancelled',
      [ORDER_STATUS.REFUNDED]: 'refunded'
    }
    return classMap[status] || ''
  }
}))