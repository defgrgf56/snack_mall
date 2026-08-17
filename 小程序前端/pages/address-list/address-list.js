// pages/address-list/address-list.js
const api = require('../../utils/request');

Page({
  data: {
    addresses: [],
    selectMode: false, // 是否为选择地址模式
    selectedId: null,
    windowHeight: 0
  },

  onLoad(options) {
    this.setWindowHeight();
    // 如果传入了 select 参数，表示选择地址模式
    if (options.select) {
      this.setData({
        selectMode: true
      });
    }
    this.loadAddresses();
  },

  // 设置窗口高度
  setWindowHeight() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      windowHeight: systemInfo.windowHeight - 50 // 减去底部按钮高度
    });
  },

  onShow() {
    this.loadAddresses();
  },

  onPullDownRefresh() {
    this.loadAddresses().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载地址列表
  async loadAddresses() {
    try {
      const res = await api.get('/addresses', {}, false);
      console.log('=== 地址列表原始数据 ===', res);
      
      // 处理地址数据，确保字段正确
      const addresses = (res || []).map(item => ({
        ...item,
        detail: item.detail || item.address || '',
        consignee: item.consignee || item.name || '收货人',
        phone: item.phone || item.mobile || ''
      }));
      
      console.log('=== 处理后的地址数据 ===', addresses);
      
      this.setData({
        addresses: addresses
      });
    } catch (error) {
      console.error('加载地址失败:', error);
      this.setData({
        addresses: []
      });
    }
  },

  // 选择地址
  onSelectAddress(e) {
    if (!this.data.selectMode) return;
    
    const id = e.currentTarget.dataset.id;
    const address = this.data.addresses.find(item => item.id === id);
    
    // 返回上一页并传递选中的地址
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedAddress: address
      });
    }
    wx.navigateBack();
  },

  // 设为默认
  async onSetDefault(e) {
    const id = e.currentTarget.dataset.id;
    
    try {
      await api.put(`/addresses/${id}/default`, {}, false);
      
      wx.showToast({
        title: '已设为默认',
        icon: 'success'
      });
      
      this.loadAddresses();
    } catch (error) {
      console.error('设置默认地址失败:', error);
      wx.showToast({
        title: '设置失败',
        icon: 'none'
      });
    }
  },

  // 编辑地址
  onEditAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${id}`
    });
  },

  // 删除地址
  onDeleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定删除这个地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.del(`/addresses/${id}`, {}, false);
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            this.loadAddresses();
          } catch (error) {
            console.error('删除地址失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 添加地址
  onAddAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    });
  }
});
