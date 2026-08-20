// pages/points-mall/points-mall.js
const api = require('../../utils/request');

Page({
  data: {
    userPoints: 0, // 用户当前积分
    products: [], // 积分商品列表
    page: 1,
    limit: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadUserPoints();
    this.loadProducts();
  },

  onShow() {
    // 每次显示页面时刷新用户积分
    this.loadUserPoints();
  },

  // 加载用户积分
  async loadUserPoints() {
    try {
      const res = await api.get('/points/balance', {}, false);
      this.setData({
        userPoints: res.points || 0
      });
    } catch (error) {
      console.error('加载用户积分失败:', error);
    }
  },

  // 加载积分商品列表
  async loadProducts(refresh = false) {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const page = refresh ? 1 : this.data.page;
      const res = await api.get('/points-exchange/products', {
        page,
        limit: this.data.limit,
        status: 1 // 只显示上架的商品
      }, false);
      
      const products = res.products || [];
      const hasMore = products.length >= this.data.limit;
      
      this.setData({
        products: refresh ? products : [...this.data.products, ...products],
        page: refresh ? 2 : this.data.page + 1,
        hasMore,
        loading: false
      });
    } catch (error) {
      console.error('加载积分商品失败:', error);
      this.setData({ loading: false });
      
      if (this.data.products.length === 0) {
        // 首次加载失败，提供重试选项
        wx.showModal({
          title: '加载失败',
          content: '无法获取积分商品，请检查网络后重试',
          showCancel: true,
          confirmText: '重试',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              this.loadProducts(true);
            }
          }
        });
      } else {
        // 加载更多失败
        wx.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserPoints();
    this.loadProducts(true);
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts();
    }
  },

  // 查看商品详情
  onProductTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/points-product-detail/points-product-detail?id=${id}`
    });
  },

  // 查看兑换记录
  onRecordTap() {
    wx.navigateTo({
      url: '/pages/points-exchange-record/points-exchange-record'
    });
  },

  // 跳转到积分明细
  onPointsDetailTap() {
    wx.navigateTo({
      url: '/pages/points/points'
    });
  }
});
