// pages/search/search.js
const api = require('../../utils/request');

Page({
  data: {
    keyword: '',
    history: [],
    hotKeywords: [],
    suggestions: [], // 搜索联想词
    showSuggestions: false, // 是否显示联想列表
    searching: false,
    searched: false,
    products: [],
    autoFocus: false,
    statusBarHeight: 0,
    navBarHeight: 0,
    sortType: 'default', // 排序类型：default, price_asc, price_desc, sales, rating
    sortOptions: [
      { value: 'default', label: '综合' },
      { value: 'sales', label: '销量' },
      { value: 'price_asc', label: '价格↑' },
      { value: 'price_desc', label: '价格↓' },
      { value: 'rating', label: '好评' }
    ]
  },

  onLoad(options) {
    this.setNavBarInfo();
    this.loadHistory();
    this.loadHotKeywords();
  },

  // 设置导航栏信息（自适应设备）
  setNavBarInfo() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    
    // 状态栏高度
    const statusBarHeight = systemInfo.statusBarHeight;
    
    // 导航栏高度 = 胶囊底部位置 - 状态栏高度 + 胶囊高度 + 额外间距
    const navBarHeight = (menuButton.top - statusBarHeight) + menuButton.height + 10;
    
    this.setData({
      statusBarHeight,
      navBarHeight
    });
  },

  // 加载搜索历史（从后端）
  async loadHistory() {
    try {
      const res = await api.get('/search/history?limit=10');
      const history = res.map(item => item.keyword);
      this.setData({ history });
    } catch (error) {
      console.error('加载搜索历史失败:', error);
      // 降级使用本地存储
      const history = wx.getStorageSync('search_history') || [];
      this.setData({ history });
    }
  },

  // 加载热门搜索词（从后端）
  async loadHotKeywords() {
    try {
      const res = await api.get('/search/hot?limit=10');
      const hotKeywords = res.map(item => item.keyword);
      this.setData({ hotKeywords });
    } catch (error) {
      console.error('加载热门搜索失败:', error);
      // 使用默认热门词
      this.setData({
        hotKeywords: ['坚果', '巧克力', '饼干', '零食大礼包']
      });
    }
  },

  // 保存搜索历史（到后端）
  async saveHistory(keyword) {
    try {
      await api.post('/search/history', { keyword });
      // 重新加载历史列表
      this.loadHistory();
    } catch (error) {
      console.error('保存搜索历史失败:', error);
      // 降级使用本地存储
      let history = this.data.history;
      history = history.filter(item => item !== keyword);
      history.unshift(keyword);
      history = history.slice(0, 10);
      wx.setStorageSync('search_history', history);
      this.setData({ history });
    }
  },

  // 输入关键词
  async onKeywordInput(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });

    // 如果输入为空，隐藏联想
    if (!keyword.trim()) {
      this.setData({ 
        showSuggestions: false,
        suggestions: []
      });
      return;
    }

    // 防抖：延迟请求联想词
    if (this.suggestTimer) {
      clearTimeout(this.suggestTimer);
    }

    this.suggestTimer = setTimeout(async () => {
      try {
        const suggestions = await api.get('/search/suggest', { keyword: keyword.trim(), limit: 8 });
        this.setData({ 
          suggestions,
          showSuggestions: suggestions.length > 0
        });
      } catch (error) {
        console.error('获取搜索联想失败:', error);
        this.setData({ 
          showSuggestions: false,
          suggestions: []
        });
      }
    }, 300);
  },

  // 点击联想词
  onSuggestionTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      keyword,
      showSuggestions: false
    });
    this.onSearch();
  },

  // 清除输入框
  onClearInput() {
    this.setData({
      keyword: '',
      autoFocus: true,
      showSuggestions: false,
      suggestions: []
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
      searched: false,
      showSuggestions: false
    });
    
    // 保存搜索历史
    this.saveHistory(keyword);
    
    try {
      wx.showLoading({ title: '搜索中...' });
      
      const res = await api.get('/products', {
        keyword,
        sort_by: this.data.sortType,
        page: 1,
        limit: 50
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
      this.setData({ searching: false });
    }
  },

  // 切换排序
  onSortChange(e) {
    const sortType = e.currentTarget.dataset.sort;
    if (sortType === this.data.sortType) return;

    this.setData({ sortType });

    // 如果已经搜索过，重新搜索
    if (this.data.searched && this.data.keyword.trim()) {
      this.onSearch();
    }
  },

  // 点击历史或热门
  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({
      keyword,
      showSuggestions: false
    });
    this.onSearch();
  },

  // 删除单条历史记录
  async onDeleteHistory(e) {
    const index = e.currentTarget.dataset.index;
    const keyword = this.data.history[index];
    
    try {
      // 从后端删除
      const historyList = await api.get('/search/history?limit=100');
      const item = historyList.find(h => h.keyword === keyword);
      if (item) {
        await api.delete(`/search/history/${item.id}`);
      }
      
      // 更新界面
      const history = [...this.data.history];
      history.splice(index, 1);
      this.setData({ history });
    } catch (error) {
      console.error('删除搜索历史失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 清空历史
  onClearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.delete('/search/history');
            this.setData({ history: [] });
            wx.showToast({
              title: '已清空',
              icon: 'success'
            });
          } catch (error) {
            console.error('清空搜索历史失败:', error);
            // 降级使用本地清空
            wx.removeStorageSync('search_history');
            this.setData({ history: [] });
          }
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
