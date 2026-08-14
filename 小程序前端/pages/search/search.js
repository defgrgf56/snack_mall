// pages/search/search.js
const api = require('../../utils/request');

Page({
  data: {
    keyword: '',
    history: [],
    hotKeywords: ['坚果', '巧克力', '饼干', '零食大礼包'],
    searching: false,
    searched: false,
    products: []
  },

  onLoad(options) {
    this.loadHistory();
  },

  // 加载搜索历史
  loadHistory() {
    const history = wx.getStorageSync('search_history') || [];
    this.setData({ history });
  },

  // 保存搜索历史
  saveHistory(keyword) {
    let history = this.data.history;
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到最前面
    history.unshift(keyword);
    
    // 只保留最近10条
    history = history.slice(0, 10);
    
    wx.setStorageSync('search_history', history);
    this.setData({ history });
  },

  // 输入关键词
  onKeywordInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 搜索
  async onSearch() {
    const keyword = this.data.keyword.trim();
    
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      searching: true,
      searched: false
    });
    
    // 保存搜索历史
    this.saveHistory(keyword);
    
    try {
      wx.showLoading({ title: '搜索中...' });
      
      const res = await api.get('/products', {
        keyword,
        page: 1,
        limit: 20
      }, false);
      
      this.setData({
        products: res.items || [],
        searched: true
      });
    } catch (error) {
      console.error('搜索失败:', error);
      this.setData({
        products: [],
        searched: true
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 点击历史或热门
  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      keyword
    });
    this.onSearch();
  },

  // 清空历史
  onClearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('search_history');
          this.setData({
            history: []
          });
        }
      }
    });
  },

  // 取消搜索
  onCancel() {
    wx.navigateBack();
  },

  // 商品详情
  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  }
});
