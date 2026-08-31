// pages/refund-list/refund-list.js - 重构后的退款列表页面
const createPageMixin = require('../../mixins/page-mixin')

const app = getApp()

Page(createPageMixin({
  data: {
    tabs: [
      { label: '全部', value: '' },
      { label: '待审核', value: '0' },
      { label: '退款中', value: '3' },
      { label: '已完成', value: '4' },
      { label: '已拒绝', value: '2' }
    ],
    currentTab: '',
    refundList: []
  },

  onLoad(options) {
    // 可以通过参数指定默认tab
    if (options.status) {
      this.setData({ currentTab: options.status })
    }
    this.loadRefundList(true)
  },

  onShow() {
    // 页面显示时不自动刷新，避免重复加载
  },

  /**
   * 切换标签
   */
  switchTab(e) {
    const { tab } = e.currentTarget.dataset
    if (tab === this.data.currentTab) return

    this.setData({ currentTab: tab })
    this.loadRefundList(true)
  },

  /**
   * 加载退款列表
   */
  async loadRefundList(reset = false) {
    try {
      const items = await this.loadList(
        (page, pageSize) => this.fetchRefundList(page, pageSize),
        { reset, listKey: 'refundList' }
      )
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 获取退款数据
   */
  async fetchRefundList(page, pageSize) {
    const params = { page, limit: pageSize }

    // 添加状态筛选
    if (this.data.currentTab !== '') {
      params.status = this.data.currentTab
    }

    return await app.api.refund.getRefundList(params)
  },

  /**
   * 加载更多
   */
  async loadMoreData() {
    await this.loadRefundList(false)
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadRefundList(true)
    wx.stopPullDownRefresh()
  },

  /**
   * 跳转详情页
   */
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/refund-detail/refund-detail?id=${id}`
    })
  }
}))