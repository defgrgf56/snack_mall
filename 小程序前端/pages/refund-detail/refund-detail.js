// pages/refund-detail/refund-detail.js
const { request } = require('../../utils/request');

Page({
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
    const { id } = options;
    if (!id) {
      wx.showToast({
        title: '退款ID不能为空',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({ refundId: id });
    this.loadRefundDetail();
  },

  onShow() {
    // 刷新数据
    if (this.data.refundId) {
      this.loadRefundDetail();
    }
  },

  /**
   * 加载退款详情
   */
  async loadRefundDetail() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await request({
        url: `/refunds/${this.data.refundId}`,
        method: 'GET'
      });

      if (res.code === 200) {
        this.setData({
          refund: res.data
        });
      } else {
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载退款详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 预览图片
   */
  previewImage(e) {
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      urls: this.data.refund.refund_images,
      current: url
    });
  },

  /**
   * 取消退款
   */
  async cancelRefund() {
    const confirmRes = await new Promise((resolve) => {
      wx.showModal({
        title: '确认取消',
        content: '确定要取消退款申请吗？',
        success: (res) => resolve(res.confirm)
      });
    });

    if (!confirmRes) {
      return;
    }

    try {
      wx.showLoading({ title: '处理中...' });
      
      const res = await request({
        url: `/refunds/${this.data.refundId}/cancel`,
        method: 'PUT'
      });

      if (res.code === 200) {
        wx.showToast({
          title: '已取消',
          icon: 'success'
        });
        
        // 刷新数据
        setTimeout(() => {
          this.loadRefundDetail();
        }, 1500);
      } else {
        wx.showToast({
          title: res.message || '取消失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('取消退款失败:', error);
      wx.showToast({
        title: '取消失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 联系客服
   */
  contactService() {
    wx.showToast({
      title: '客服功能开发中',
      icon: 'none'
    });
  }
});
