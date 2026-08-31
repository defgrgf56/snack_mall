// pages/refund-apply/refund-apply.js - 重构后的退款申请页面
const createPageMixin = require('../../mixins/page-mixin')
const errorHandler = require('../../utils/error-handler')

const app = getApp()

Page(createPageMixin({
  data: {
    orderId: null,
    order: null,
    refundType: 1, // 1-仅退款 2-退货退款
    reasonList: [
      '不想要了',
      '商品质量问题',
      '商品描述不符',
      '商品破损/缺件',
      '发错货',
      '物流太慢',
      '其他原因'
    ],
    reasonIndex: -1,
    refundDesc: '',
    refundImages: [],
    submitting: false
  },

  onLoad(options) {
    const { orderId } = options
    if (!orderId) {
      errorHandler.handle(new Error('订单ID不能为空'))
      this.$setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    this.setData({ orderId })
    this.loadOrderDetail()
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail() {
    try {
      const order = await this.loadData(
        () => app.api.order.getOrderDetail(this.data.orderId),
        { showLoading: true }
      )
      this.setData({ order })
    } catch (error) {
      // 错误已统一处理
    }
  },

  /**
   * 选择退款类型
   */
  selectType(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      refundType: parseInt(type)
    })
  },

  /**
   * 选择退款原因
   */
  onReasonChange(e) {
    this.setData({
      reasonIndex: parseInt(e.detail.value)
    })
  },

  /**
   * 输入退款说明
   */
  onDescInput(e) {
    this.setData({
      refundDesc: e.detail.value
    })
  },

  /**
   * 选择图片
   */
  chooseImage() {
    wx.chooseImage({
      count: 3 - this.data.refundImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImages(res.tempFilePaths)
      }
    })
  },

  /**
   * 上传图片
   */
  async uploadImages(filePaths) {
    try {
      wx.showLoading({ title: '上传中...', mask: true })

      const uploadedImages = []
      
      for (let i = 0; i < filePaths.length; i++) {
        try {
          // TODO: 实现图片上传 API
          // const result = await app.api.upload.uploadImage(filePaths[i])
          // uploadedImages.push(result.url)
          
          // 暂时使用本地路径模拟
          uploadedImages.push(filePaths[i])
        } catch (error) {
          errorHandler.handle(error)
        }
      }

      wx.hideLoading()

      if (uploadedImages.length > 0) {
        this.setData({
          refundImages: [...this.data.refundImages, ...uploadedImages]
        })
        errorHandler.showSuccess('上传成功')
      }
    } catch (error) {
      wx.hideLoading()
      errorHandler.handle(error)
    }
  },

  /**
   * 删除图片
   */
  deleteImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.refundImages]
    images.splice(index, 1)
    this.setData({ refundImages: images })
  },

  /**
   * 表单验证
   */
  validateForm() {
    if (this.data.reasonIndex < 0) {
      throw new Error('请选择退款原因')
    }
    return true
  },

  /**
   * 提交退款申请
   */
  async submitRefund() {
    if (this.data.submitting) return

    try {
      // 验证表单
      this.validateForm()

      // 二次确认
      const confirmed = await errorHandler.confirm({
        title: '确认提交',
        content: '提交后请等待客服审核，审核通过后将原路退回'
      })

      if (!confirmed) return

      this.setData({ submitting: true })

      const refundData = {
        order_id: this.data.orderId,
        refund_type: this.data.refundType,
        refund_reason: this.data.reasonList[this.data.reasonIndex],
        refund_desc: this.data.refundDesc,
        refund_images: this.data.refundImages.length > 0 ? this.data.refundImages : null
      }

      // TODO: 创建退款 API
      // const result = await app.api.refund.createRefund(refundData)
      
      // 暂时模拟成功
      errorHandler.showSuccess('提交成功')
      
      this.$setTimeout(() => {
        // 跳转到退款详情页
        // wx.redirectTo({
        //   url: `/pages/refund-detail/refund-detail?id=${result.id}`
        // })
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      errorHandler.handle(error)
      this.setData({ submitting: false })
    }
  }
}))