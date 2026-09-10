// pages/order-list/order-list.js - 重构后的订单列表页面
const createPageMixin = require('../../mixins/page-mixin')
const { ORDER_STATUS, ORDER_STATUS_TEXT } = require('../../constants/index')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
    currentTab: 0,
    orders: [],
    countdownTimers: [] // 倒计时定时器
  },

  onLoad(options) {
    // 从参数设置初始 tab
    if (options.status) {
      const statusMap = {
        '1': 1, // 待付款
        '2': 2, // 待发货
        '3': 3, // 待收货
        '5': 4  // 已完成
      }
      const tabIndex = statusMap[options.status] || 0
      this.setData({ currentTab: tabIndex })
    }

    this.loadOrderList(true)
  },

  onUnload() {
    // 清除所有倒计时定时器
    this.clearAllCountdown()
  },

  /**
   * 切换 Tab
   */
  onTabChange(e) {
    const index = e.currentTarget.dataset.index
    if (index === this.data.currentTab) return

    this.setData({ currentTab: index })
    this.loadOrderList(true)
  },

  /**
   * 加载订单列表
   */
  async loadOrderList(reset = false) {
    const statusMap = [null, ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PENDING_DELIVERY, ORDER_STATUS.PENDING_RECEIVE, ORDER_STATUS.COMPLETED]
    const status = statusMap[this.data.currentTab]

    try {
      const items = await this.loadList(
        (page, pageSize) => this.fetchOrders(status, page, pageSize),
        { reset, listKey: 'orders' }
      )

      // 格式化订单数据
      const orders = this.data.orders.map(order => ({
        ...order,
        status_text: ORDER_STATUS_TEXT[order.status] || '未知',
        status_class: this.getStatusClass(order.status),
        item_count: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        // 确保显示实付金额
        display_amount: order.pay_amount || order.total_amount,
        // 计算倒计时
        countdown: this.calculateCountdown(order)
      }))

      this.setData({ orders })
      
      // 启动倒计时
      this.startCountdown()
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 获取订单数据
   */
  async fetchOrders(status, page, pageSize) {
    const params = { page, limit: pageSize }
    if (status !== null) {
      params.status = status
    }

    return await app.api.order.getOrders(params)
  },

  /**
   * 加载更多
   */
  async loadMoreData() {
    await this.loadOrderList(false)
  },

  /**
   * 获取状态样式类
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
  },

  /**
   * 订单详情
   */
  onOrderTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    })
  },

  /**
   * 取消订单
   */
  async onCancelOrder(e) {
    const { id } = e.currentTarget.dataset

    const confirmed = await errorHandler.confirm({
      content: '确定取消这个订单吗？'
    })

    if (!confirmed) return

    try {
      await app.api.order.cancelOrder(id)
      errorHandler.showSuccess('已取消')
      this.loadOrderList(true)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 去支付
   */
  async onPayOrder(e) {
    const { id } = e.currentTarget.dataset
    
    try {
      await app.api.order.payOrderMock(id)
      errorHandler.showSuccess('支付成功')
      
      // 延迟刷新订单列表
      this.$setTimeout(() => {
        this.loadOrderList(true)
      }, 1500)
    } catch (error) {
      // 错误已由 errorHandler 统一处理
    }
  },

  /**
   * 确认收货
   */
  async onConfirmReceive(e) {
    const { id } = e.currentTarget.dataset

    const confirmed = await errorHandler.confirm({
      content: '确认已收到货物吗？'
    })

    if (!confirmed) return

    try {
      await app.api.order.confirmReceive(id)
      errorHandler.showSuccess('确认成功')
      this.loadOrderList(true)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 删除订单
   */
  async onDeleteOrder(e) {
    const { id } = e.currentTarget.dataset

    const confirmed = await errorHandler.confirm({
      content: '确定删除这个订单吗？'
    })

    if (!confirmed) return

    try {
      await app.api.order.deleteOrder(id)
      errorHandler.showSuccess('删除成功')
      this.loadOrderList(true)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 去评价
   */
  onComment(e) {
    const { id } = e.currentTarget.dataset
    
    wx.navigateTo({
      url: `/pages/order-comment/order-comment?orderId=${id}`
    })
  },

  /**
   * 计算倒计时
   */
  calculateCountdown(order) {
    // 只有待付款订单才显示倒计时
    if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
      return null
    }

    // iOS 兼容：将 "2026-08-27 11:46:40" 转换为 "2026/08/27 11:46:40"
    const dateStr = order.created_at.replace(/-/g, '/')
    const createdAt = new Date(dateStr).getTime()
    const now = Date.now()
    const elapsed = now - createdAt
    const timeout = 15 * 60 * 1000 // 15分钟
    const remaining = timeout - elapsed

    if (remaining <= 0) {
      return '已超时'
    }

    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },

  /**
   * 启动倒计时
   */
  startCountdown() {
    // 清除之前的定时器
    this.clearAllCountdown()

    // 每秒更新一次倒计时
    const timer = setInterval(() => {
      const orders = this.data.orders.map(order => ({
        ...order,
        countdown: this.calculateCountdown(order)
      }))

      this.setData({ orders })

      // 检查是否有订单已超时，需要刷新列表
      const hasExpired = orders.some(order => 
        order.status === ORDER_STATUS.PENDING_PAYMENT && order.countdown === '已超时'
      )

      if (hasExpired) {
        // 3秒后重新加载列表
        setTimeout(() => {
          this.loadOrderList(true)
        }, 3000)
      }
    }, 1000)

    this.data.countdownTimers.push(timer)
  },

  /**
   * 清除所有倒计时定时器
   */
  clearAllCountdown() {
    this.data.countdownTimers.forEach(timer => clearInterval(timer))
    this.data.countdownTimers = []
  }
}))