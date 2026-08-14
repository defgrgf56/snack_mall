// pages/order-detail/order-detail.js
const api = require('../../utils/request');

Page({
  data: {
    orderId: null,
    order: null
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      });
      this.loadOrderDetail(options.id);
    }
  },

  onPullDownRefresh() {
    this.loadOrderDetail(this.data.orderId).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载订单详情
  async loadOrderDetail(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await api.get(`/orders/${id}`, {}, false);
      const order = res
      
      // 处理订单状态
      order.status_text = this.getStatusText(order.status);
      order.status_class = this.getStatusClass(order.status);
      order.item_count = order.items.reduce((sum, item) => sum + item.quantity, 0);
      
      this.setData({
        order
      });
    } catch (error) {
      console.error('加载订单详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      // 使用模拟数据
      this.useMockData();
    } finally {
      wx.hideLoading();
    }
  },

  // 复制订单号
  onCopyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.order_no,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  },

  // 联系客服
  onContact() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：400-123-4567',
      showCancel: false
    });
  },

  // 取消订单
  onCancelOrder() {
    wx.showModal({
      title: '提示',
      content: '确定取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put(`/orders/${this.data.orderId}/cancel`, {}, false);
            wx.showToast({
              title: '已取消',
              icon: 'success'
            });
            this.loadOrderDetail(this.data.orderId);
          } catch (error) {
            wx.showToast({
              title: '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 去支付
  onPayOrder() {
    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
    });
  },

  // 查看物流
  onViewLogistics() {
    wx.showToast({
      title: '物流功能开发中',
      icon: 'none'
    });
  },

  // 确认收货
  onConfirmReceive() {
    wx.showModal({
      title: '提示',
      content: '确认已收到货物吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put(`/orders/${this.data.orderId}/receive`, {}, false);
            wx.showToast({
              title: '确认成功',
              icon: 'success'
            });
            this.loadOrderDetail(this.data.orderId);
          } catch (error) {
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 去评价
  onComment() {
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    });
  },

  // 删除订单
  onDeleteOrder() {
    wx.showModal({
      title: '提示',
      content: '确定删除这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.del(`/orders/${this.data.orderId}`, {}, false);
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      1: '待付款',
      2: '待发货',
      3: '待收货',
      4: '已完成',
      5: '已取消',
      6: '已退款'
    };
    return statusMap[status] || '未知';
  },

  // 获取状态样式
  getStatusClass(status) {
    const classMap = {
      1: 'pending',
      2: 'paid',
      3: 'shipped',
      4: 'completed',
      5: 'cancelled',
      6: 'refunded'
    };
    return classMap[status] || '';
  },

  // 使用模拟数据
  useMockData() {
    const mockOrder = {
      id: 1,
      order_no: '202608120001',
      status: 1,
      status_text: '待付款',
      status_class: 'pending',
      total_amount: '59.80',
      delivery_type: 1,
      created_at: '2026-08-12 16:30:00',
      item_count: 2,
      address: {
        consignee: '张三',
        phone: '138****8888',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园科技大厦A座1001'
      },
      items: [
        {
          id: 1,
          product: {
            id: 1,
            name: '每日坚果混合装',
            cover: 'https://img.yzcdn.cn/vant/apple-1.jpg'
          },
          price: '29.90',
          quantity: 2,
          spec: '500g'
        }
      ],
      product_amount: '59.80',
      delivery_fee: '0.00',
      coupon_discount: '0.00'
    };
    
    this.setData({
      order: mockOrder
    });
  }
});
