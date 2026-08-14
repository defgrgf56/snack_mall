// pages/order-list/order-list.js
const api = require('../../utils/request');

Page({
  data: {
    tabs: ['全部', '待付款', '待发货', '待收货', '已完成'],
    currentTab: 0,
    orders: [],
    page: 1,
    hasMore: true
  },

  onLoad(options) {
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
      
      const res = await api.get('/orders', {
        status,
        page: this.data.page,
        limit: 10
      }, false);
      
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
    } catch (error) {
      console.error('加载订单失败:', error);
      // 使用模拟数据
      if (this.data.page === 1) {
        this.useMockData();
      }
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
  },

  // 使用模拟数据
  useMockData() {
    const mockOrders = [
      {
        id: 1,
        order_no: '202608120001',
        status: 1,
        status_text: '待付款',
        status_class: 'pending',
        total_amount: '59.80',
        created_at: '2026-08-12 16:30:00',
        item_count: 2,
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
        ]
      }
    ];
    
    this.setData({
      orders: mockOrders
    });
  }
});
