// pages/refund-apply/refund-apply.js
const app = getApp();
const { request } = require('../../utils/request');

Page({
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
    const { orderId } = options;
    if (!orderId) {
      wx.showToast({
        title: '订单ID不能为空',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({ orderId });
    this.loadOrderDetail();
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await request({
        url: `/orders/${this.data.orderId}`,
        method: 'GET'
      });

      if (res.code === 200) {
        this.setData({
          order: res.data
        });
      } else {
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载订单详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 选择退款类型
   */
  selectType(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({
      refundType: parseInt(type)
    });
  },

  /**
   * 选择退款原因
   */
  onReasonChange(e) {
    this.setData({
      reasonIndex: parseInt(e.detail.value)
    });
  },

  /**
   * 输入退款说明
   */
  onDescInput(e) {
    this.setData({
      refundDesc: e.detail.value
    });
  },

  /**
   * 选择图片
   */
  chooseImage() {
    const that = this;
    wx.chooseImage({
      count: 3 - this.data.refundImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        that.uploadImages(tempFilePaths);
      }
    });
  },

  /**
   * 上传图片
   */
  async uploadImages(filePaths) {
    wx.showLoading({ title: '上传中...' });
    
    const uploadedImages = [];
    
    for (let i = 0; i < filePaths.length; i++) {
      try {
        const token = wx.getStorageSync('token');
        const uploadTask = wx.uploadFile({
          url: `${app.globalData.apiBase}/upload`,
          filePath: filePaths[i],
          name: 'file',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              uploadedImages.push(data.data.url);
            }
          }
        });

        await new Promise((resolve, reject) => {
          uploadTask.onProgressUpdate((res) => {
            wx.showLoading({ 
              title: `上传中 ${res.progress}%`,
              mask: true
            });
          });
          uploadTask.onHeadersReceived((res) => {
            resolve();
          });
        });
      } catch (error) {
        console.error('上传图片失败:', error);
      }
    }
    
    wx.hideLoading();
    
    if (uploadedImages.length > 0) {
      this.setData({
        refundImages: [...this.data.refundImages, ...uploadedImages]
      });
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
    }
  },

  /**
   * 删除图片
   */
  deleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = this.data.refundImages;
    images.splice(index, 1);
    this.setData({
      refundImages: images
    });
  },

  /**
   * 提交退款申请
   */
  async submitRefund() {
    // 验证表单
    if (this.data.reasonIndex < 0) {
      wx.showToast({
        title: '请选择退款原因',
        icon: 'none'
      });
      return;
    }

    // 二次确认
    const confirmRes = await new Promise((resolve) => {
      wx.showModal({
        title: '确认提交',
        content: '提交后请等待客服审核，审核通过后将原路退回',
        success: (res) => resolve(res.confirm)
      });
    });

    if (!confirmRes) {
      return;
    }

    this.setData({ submitting: true });

    try {
      const res = await request({
        url: '/refunds',
        method: 'POST',
        data: {
          order_id: this.data.orderId,
          refund_type: this.data.refundType,
          refund_reason: this.data.reasonList[this.data.reasonIndex],
          refund_desc: this.data.refundDesc,
          refund_images: this.data.refundImages.length > 0 ? this.data.refundImages : null
        }
      });

      if (res.code === 200) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          // 跳转到退款详情页
          wx.redirectTo({
            url: `/pages/refund-detail/refund-detail?id=${res.data.id}`
          });
        }, 1500);
      } else {
        wx.showToast({
          title: res.message || '提交失败',
          icon: 'none'
        });
        this.setData({ submitting: false });
      }
    } catch (error) {
      console.error('提交退款失败:', error);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
      this.setData({ submitting: false });
    }
  }
});
