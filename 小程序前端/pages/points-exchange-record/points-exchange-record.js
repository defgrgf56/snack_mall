// pages/points-exchange-record/points-exchange-record.js
const api = require('../../utils/request');

Page({
  data: {
    records: [],
    page: 1,
    limit: 10,
    hasMore: true,
    loading: false,
    statusMap: {
      0: { text: '待发货', color: '#FF6B00' },
      1: { text: '已发货', color: '#1989fa' },
      2: { text: '已完成', color: '#07c160' },
      3: { text: '已取消', color: '#999' }
    }
  },

  onLoad() {
    this.loadRecords();
  },

  // 加载兑换记录
  async loadRecords(refresh = false) {
    if (this.data.loading) return;

    try {
      this.setData({ loading: true });

      const page = refresh ? 1 : this.data.page;
      const res = await api.get('/points-exchange/records', {
        page,
        limit: this.data.limit
      }, false);

      const records = res.records || [];
      const hasMore = records.length >= this.data.limit;

      this.setData({
        records: refresh ? records : [...this.data.records, ...records],
        page: refresh ? 2 : this.data.page + 1,
        hasMore,
        loading: false
      });
    } catch (error) {
      console.error('加载兑换记录失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecords(true);
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadRecords();
    }
  },

  // 查看记录详情
  onRecordTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '兑换详情',
      content: `兑换记录ID: ${id}\n\n详情页面待开发`,
      showCancel: false
    });
  }
});
