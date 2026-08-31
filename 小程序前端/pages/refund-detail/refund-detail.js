// pages/refund-detail/refund-detail.js - 重构后的退款详情页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    refundId: null,
    refund: {},
    statusIcons: {
      0: '⏳',
      1: '✓',
      2: '✕',
      3: '💰',
      4: '✓',
      5: '✕'
    },
    statusDescs: {
      0: '您的退款申请已提交，请等待客服审核',
      1: '审核已通过，退款处理中',
      2: '很抱歉，您的退款申请未通过审核',
      3: '退款正在处理中，请耐心等待',
      4: '退款已成功，预计1-3个工作日到账',
      5: '退款申请已取消'
    },
    statusTexts: {
      0: '待审核',
      1: '审核通过',
      2: '审核拒绝',
      3: '退款中',
      4: '退款成功',
      5: '已取消'
    }
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      errorHandler.handle(new Error('退款ID不能为空'))
      this.$setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({ refundId: id })
    this.loadRefundDetail()
  },

  onShow() {
    // 刷新数据
    if (this.data.refundId) {
      this.loadRefundDetail()
    }
  },

  /**
   * 加载退款详情
   */
  async loadRefundDetail() {
    try {
      const refund = await this.loadData(
        () => app.api.refund.getRefundDetail(this.data.refundId),
        { showLoading: true }
      )
      this.setData({ refund })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      urls: this.data.refund.refund_images || [],
      current: url
    })
  },

  /**
   * 取消退款
   */
  async cancelRefund() {
    const confirmed = await errorHandler.confirm({
      title: '确认取消',
      content: '确定要取消退款申请吗？'
    })

    if (!confirmed) return

    try {
      await app.api.refund.cancelRefund(this.data.refundId)
      errorHandler.showSuccess('已取消')

      this.$setTimeout(() => {
        this.loadRefundDetail()
      }, 1500)
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 联系客服
   */
  contactService() {
    errorHandler.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567',
      showCancel: false
    })
  }
}))