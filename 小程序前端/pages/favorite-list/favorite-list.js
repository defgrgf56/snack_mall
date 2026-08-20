// pages/favorite-list/favorite-list.js
const { request } = require('../../utils/request');
const { addToCart } = require('../../utils/cart');

Page({
  data: {
    favoriteList: [],
    selectedIds: [],
    isAllSelected: false,
    isEditMode: false, // 编辑模式
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadFavorites();
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
   * 刷新列表
   */
  async refreshList() {
    this.setData({
      favoriteList: [],
      selectedIds: [],
      isAllSelected: false,
      isEditMode: false,
      page: 1,
      hasMore: true
    });
    await this.loadFavorites();
  },

  /**
   * 加载更多
   */
  async loadMore() {
    this.setData({
      page: this.data.page + 1
    });
    await this.loadFavorites();
  },

  /**
   * 加载收藏列表
   */
  async loadFavorites() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { request } = require('../../utils/request');
      const res = await request('/favorites', 'GET', {
        page: this.data.page,
        pageSize: this.data.pageSize
      }, true);

      const newList = this.data.page === 1 
        ? res.list 
        : [...this.data.favoriteList, ...res.list];

      this.setData({
        favoriteList: newList,
        hasMore: res.pagination.page < res.pagination.totalPages
      });
    } catch (error) {
      console.error('加载收藏列表失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 全选/取消全选
   */
  onSelectAll(e) {
    const values = e.detail.value;
    const isAll = values.includes('all');

    if (isAll) {
      // 全选
      const allIds = this.data.favoriteList.map(item => item.id);
      this.setData({
        selectedIds: allIds,
        isAllSelected: true
      });
    } else {
      // 取消全选
      this.setData({
        selectedIds: [],
        isAllSelected: false
      });
    }
  },

  /**
   * 选择单个商品
   */
  onSelectItem(e) {
    const { id } = e.currentTarget.dataset;
    const values = e.detail.value;
    const isSelected = values.includes(id.toString());

    let selectedIds = [...this.data.selectedIds];
    
    if (isSelected) {
      // 添加选中
      if (!selectedIds.includes(id)) {
        selectedIds.push(id);
      }
    } else {
      // 取消选中
      selectedIds = selectedIds.filter(item => item !== id);
    }

    this.setData({
      selectedIds,
      isAllSelected: selectedIds.length === this.data.favoriteList.length
    });
  },

  /**
   * 批量删除
   */
  async batchDelete() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none'
      });
      return;
    }

    const confirmRes = await new Promise((resolve) => {
      wx.showModal({
        title: '确认删除',
        content: `确定删除${this.data.selectedIds.length}件收藏商品吗?`,
        success: (res) => resolve(res.confirm)
      });
    });

    if (!confirmRes) return;

    try {
      const { request } = require('../../utils/request');
      await request('/favorites/batch-delete', 'POST', {
        ids: this.data.selectedIds
      }, true);

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });

      // 刷新列表
      this.refreshList();
    } catch (error) {
      console.error('批量删除失败:', error);
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      });
    }
  },

  /**
   * 删除单个收藏
   */
  async deleteFavorite(e) {
    const { id } = e.currentTarget.dataset;

    const confirmRes = await new Promise((resolve) => {
      wx.showModal({
        title: '确认删除',
        content: '确定取消收藏吗?',
        success: (res) => resolve(res.confirm)
      });
    });

    if (!confirmRes) return;

    try {
      const { request } = require('../../utils/request');
      await request(`/favorites/${id}`, 'DELETE', {}, true);

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });

      // 从列表中移除
      const list = this.data.favoriteList.filter(item => item.id !== id);
      const selectedIds = this.data.selectedIds.filter(item => item !== id);
      
      this.setData({
        favoriteList: list,
        selectedIds,
        isAllSelected: selectedIds.length === list.length && list.length > 0
      });
    } catch (error) {
      console.error('删除收藏失败:', error);
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      });
    }
  },

  /**
   * 加入购物车
   */
  async addToCart(e) {
    const { id } = e.currentTarget.dataset;
    await addToCart(id, 1);
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode,
      selectedIds: [],
      isAllSelected: false
    });
  },

  /**
   * 批量加入购物车
   */
  async batchAddToCart() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '添加中...' });

    try {
      // 获取选中的商品
      const selectedProducts = this.data.favoriteList.filter(item => 
        this.data.selectedIds.includes(item.id)
      );

      // 依次添加到购物车
      for (let i = 0; i < selectedProducts.length; i++) {
        await addToCart(selectedProducts[i].product.id, 1);
      }

      wx.hideLoading();
      wx.showToast({
        title: `已添加${selectedProducts.length}件商品`,
        icon: 'success'
      });

      // 退出编辑模式
      this.setData({
        isEditMode: false,
        selectedIds: [],
        isAllSelected: false
      });
    } catch (error) {
      wx.hideLoading();
      console.error('批量加入购物车失败:', error);
    }
  },

  /**
   * 跳转商品详情
   */
  goProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  /**
   * 去逛逛
   */
  goShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
