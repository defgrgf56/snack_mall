// pages/refund-list/refund-list.js
const { request } = require('../../utils/request');

Page({
  data: {
    tabs: [
      { label: '全部', value: '' },
      { label: '待审核', value: '0' },
      { label: '退款中', value: '3' },
      { label: '已完成', value: '4' },
      { label: '已拒绝', value: '2' }
    ],
    currentTab: '',
    refundList: [],
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true
  },

  onLoad(options) {
    // 可以通过参数指定默认tab
    if (options.status) {
      this.setData({
        currentTab: options.status
      });
    }
    this.loadRefundList();
  },

  onShow() {
    // 刷新列表
    this.refreshList();
  },

  onPullDownRefresh() {
    this.refreshList().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadMore();
    }
  },

  /**
   * 切换标签
   */
  switchTab(e) {
    const { tab } = e.currentTarget.dataset;
    if (tab === this.data.currentTab) return;

    this.setData({
      currentTab: tab,
      refundList: [],
      page: 1,
      hasMore: true
    });
    this.loadRefundList();
  },

  /**
   * 刷新列表
   */
  async refreshList() {
    this.setData({
      refundList: [],
      page: 1,
      hasMore: true
    });
    await this.loadRefundList();
  },

  /**
   * 加载更多
   */
  async loadMore() {
    this.setData({
      page: this.data.page + 1
    });
    await this.loadRefundList();
  },

  /**
   * 加载退款列表
   */
  async loadRefundList() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      };

      // 添加状态筛选
      if (this.data.currentTab !== '') {
        params.status = this.data.currentTab;
      }

      const res = await request({
        url: '/refunds',
        method: 'GET',
        data: params
      });

      if (res.code === 200) {
        const newList = this.data.page === 1 
          ? res.data.list 
          : [...this.data.refundList, ...res.data.list];

        this.setData({
          refundList: newList,
          hasMore: res.data.pagination.page < res.data.pagination.totalPages
        });
      } else {
        wx.showToast({
          title: res.message || '加载失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载退款列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 跳转详情页
   */
  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/refund-detail/refund-detail?id=${id}`
    });
  }
});
