// pages/order-list/order-list.js
const api = require('../../utils/request');

Page({
  data: {
    tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
    currentTab: 0,
    orders: [],
    page: 1,
    hasMore: true,
    windowHeight: 0
  },

  onLoad(options) {
    this.setWindowHeight();
    if (options.status) {
      const statusMap = {
        '1': 1, // 待付款
        '2': 2, // 待发货
        '3': 3, // 待收货
        '5': 4  // 待评价
      };
      const tabIndex = statusMap[options.status] || 0;
      this.setData({
        currentTab: tabIndex
      });
    }
    this.loadOrders();
  },

  // 设置窗口高度
  setWindowHeight() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      windowHeight: systemInfo.windowHeight - 44 // 减去Tab栏高度
    });
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 切换Tab
  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.currentTab) return;
    
    this.setData({
      currentTab: index,
      page: 1,
      hasMore: true,
      orders: []
    });
    this.loadOrders();
  },

  // 加载订单列表
  async loadOrders() {
    if (!this.data.hasMore) return;
    
    try {
      wx.showLoading({ title: '加载中...' });
      
      const statusMap = [null, 1, 2, 3, 4]; // 全部、待付款、待发货、待收货、已完成
      const status = statusMap[this.data.currentTab];
      
      console.log('=== 加载订单列表 ===');
      console.log('当前Tab:', this.data.currentTab);
      console.log('状态筛选:', status);
      console.log('页码:', this.data.page);
      console.log('Token存在:', !!wx.getStorageSync('token'));
      
      const res = await api.get('/orders', {
        status,
        page: this.data.page,
        limit: 10
      }, false);
      
      console.log('API响应:', res);
      console.log('订单数量:', res.items ? res.items.length : 0);
      
      const orders = (res.items || []).map(order => {
        return {
          ...order,
          status_text: this.getStatusText(order.status),
          status_class: this.getStatusClass(order.status),
          item_count: order.items.reduce((sum, item) => sum + item.quantity, 0)
        };
      });
      
      this.setData({
        orders: this.data.page === 1 ? orders : [...this.data.orders, ...orders],
        hasMore: orders.length >= 10
      });
      
      console.log('最终显示订单数:', this.data.orders.length);
      
      // 如果没有订单,显示提示
      if (this.data.orders.length === 0) {
        console.log('当前筛选条件下没有订单');
      }
    } catch (error) {
      console.error('加载订单失败:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMsg = '加载失败';
      if (error.code === 'NOT_LOGGED_IN') {
        errorMsg = '请先登录';
      } else if (error.code === 'UNAUTHORIZED') {
        errorMsg = '登录已失效,请重新登录';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMsg = '网络错误,请检查网络连接';
      } else if (error.code === 'REQUEST_FAILED') {
        errorMsg = '请求失败: ' + (error.message || '后端服务未启动?');
      } else {
        errorMsg = error.message || '未知错误';
      }
      
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 3000
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 加载更多
  onLoadMore() {
    if (!this.data.hasMore) return;
    
    this.setData({
      page: this.data.page + 1
    });
    this.loadOrders();
  },

  // 订单详情
  onOrderTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${id}`
    });
  },

  // 取消订单
  onCancelOrder(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put(`/orders/${id}/cancel`, {}, false);
            wx.showToast({
              title: '已取消',
              icon: 'success'
            });
            this.loadOrders();
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
  onPayOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
    });
  },

  // 确认收货
  onConfirmReceive(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确认已收到货物吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.put(`/orders/${id}/receive`, {}, false);
            wx.showToast({
              title: '确认成功',
              icon: 'success'
            });
            this.loadOrders();
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
  onComment(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '评价功能开发中',
      icon: 'none'
    });
  },

  // 删除订单
  onDeleteOrder(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定删除这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.del(`/orders/${id}`, {}, false);
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            this.loadOrders();
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
  }
});
