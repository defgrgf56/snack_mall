// pages/cart/cart.js
const api = require('../../utils/request');

Page({
  data: {
    cartItems: [],
    allSelected: false,
    selectedCount: 0,
    totalPrice: '0.00'
  },

  onLoad(options) {
    this.loadCartData();
  },

  onShow() {
    this.loadCartData();
  },

  // 加载购物车数据
  async loadCartData() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await api.get('/cart', {}, false); // 暂时不需要登录
      
      const items = (res || []).map(item => ({
        ...item,
        selected: false
      }));
      
      this.setData({
        cartItems: items
      });
      
      this.calculateTotal();
    } catch (error) {
      console.error('加载购物车失败:', error);
      
      // 使用模拟数据
      this.useMockData();
    } finally {
      wx.hideLoading();
    }
  },

  // 选择商品
  onSelectItem(e) {
    const id = e.currentTarget.dataset.id;
    const items = this.data.cartItems.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });
    
    this.setData({
      cartItems: items
    });
    
    this.calculateTotal();
  },

  // 全选/取消全选
  onSelectAll() {
    const allSelected = !this.data.allSelected;
    const items = this.data.cartItems.map(item => ({
      ...item,
      selected: allSelected
    }));
    
    this.setData({
      cartItems: items,
      allSelected
    });
    
    this.calculateTotal();
  },

  // 减少数量
  async onDecreaseQuantity(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cartItems.find(i => i.id === id);
    
    if (item.quantity <= 1) {
      return;
    }
    
    try {
      await api.put(`/cart/${id}`, {
        quantity: item.quantity - 1
      });
      
      const items = this.data.cartItems.map(i => {
        if (i.id === id) {
          return { ...i, quantity: i.quantity - 1 };
        }
        return i;
      });
      
      this.setData({
        cartItems: items
      });
      
      this.calculateTotal();
    } catch (error) {
      console.error('更新数量失败:', error);
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  // 增加数量
  async onIncreaseQuantity(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.cartItems.find(i => i.id === id);
    
    try {
      await api.put(`/cart/${id}`, {
        quantity: item.quantity + 1
      });
      
      const items = this.data.cartItems.map(i => {
        if (i.id === id) {
          return { ...i, quantity: i.quantity + 1 };
        }
        return i;
      });
      
      this.setData({
        cartItems: items
      });
      
      this.calculateTotal();
    } catch (error) {
      console.error('更新数量失败:', error);
      wx.showToast({
        title: error.message || '更新失败',
        icon: 'none'
      });
    }
  },

  // 删除商品
  onDeleteItem(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这个商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.delete(`/cart/${id}`);
            
            const items = this.data.cartItems.filter(item => item.id !== id);
            
            this.setData({
              cartItems: items
            });
            
            this.calculateTotal();
            
            wx.showToast({
              title: '已删除',
              icon: 'success'
            });
          } catch (error) {
            console.error('删除失败:', error);
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 计算总价
  calculateTotal() {
    const selectedItems = this.data.cartItems.filter(item => item.selected);
    const total = selectedItems.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);
    
    const allSelected = this.data.cartItems.length > 0 && 
                       selectedItems.length === this.data.cartItems.length;
    
    this.setData({
      selectedCount: selectedItems.length,
      totalPrice: total.toFixed(2),
      allSelected
    });
  },

  // 去结算
  onCheckout() {
    if (this.data.selectedCount === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }
    
    const selectedItems = this.data.cartItems
      .filter(item => item.selected)
      .map(item => item.id);
    
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?cartIds=${selectedItems.join(',')}`
    });
  },

  // 去逛逛
  onGoShopping() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 使用模拟数据
  useMockData() {
    const mockData = [
      {
        id: 1,
        product_id: 1,
        quantity: 2,
        selected: false,
        product: {
          id: 1,
          name: '每日坚果混合装',
          image: 'https://img.yzcdn.cn/vant/apple-1.jpg',
          price: '29.90',
          spec: '500g/袋'
        }
      },
      {
        id: 2,
        product_id: 2,
        quantity: 1,
        selected: false,
        product: {
          id: 2,
          name: '夏威夷果',
          image: 'https://img.yzcdn.cn/vant/apple-2.jpg',
          price: '39.90',
          spec: '250g/袋'
        }
      }
    ];
    
    this.setData({
      cartItems: mockData
    });
    
    this.calculateTotal();
  }
});
