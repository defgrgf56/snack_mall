// pages/category/category.js
const api = require('../../utils/request');

Page({
  data: {
    categories: [],
    currentIndex: 0,
    products: [],
    currentCategoryId: null
  },

  onLoad(options) {
    this.loadCategories();
  },

  // 加载分类列表
  async loadCategories() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await api.get('/categories', {}, false)

      if (res && res.length > 0) {
        this.setData({
          categories: res,
          currentCategoryId: res[0].id
        })

        this.loadProducts(res[0].id)
      }
    } catch (error) {
      console.error('加载分类失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      
      // 使用模拟数据
      this.useMockData();
    } finally {
      wx.hideLoading();
    }
  },

  // 加载商品列表
  async loadProducts(categoryId) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await api.get('/products', {
        category_id: categoryId,
        status: 1,
        page: 1,
        limit: 20
      }, false); // 不需要登录
      
      this.setData({
        products: res.items || []
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      
      // 使用模拟数据
      this.useMockProducts();
    } finally {
      wx.hideLoading();
    }
  },

  // 切换分类
  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index;
    const categoryId = this.data.categories[index].id;
    
    this.setData({
      currentIndex: index,
      currentCategoryId: categoryId
    });
    
    this.loadProducts(categoryId);
  },

  // 商品点击
  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  // 加入购物车
  async onAddToCart(e) {
    const id = e.currentTarget.dataset.id;
    
    try {
      await api.post('/cart/add', {
        product_id: id,
        quantity: 1
      });
      
      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
    } catch (error) {
      console.error('加入购物车失败:', error);
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      });
    }
  },

  // 使用模拟分类数据
  useMockData() {
    const mockCategories = [
      { id: 1, name: '坚果炒货', sort: 1 },
      { id: 2, name: '糖果巧克力', sort: 2 },
      { id: 3, name: '饼干糕点', sort: 3 },
      { id: 4, name: '肉干肉脯', sort: 4 },
      { id: 5, name: '果干蜜饯', sort: 5 },
      { id: 6, name: '休闲零食', sort: 6 }
    ];
    
    this.setData({
      categories: mockCategories,
      currentCategoryId: mockCategories[0].id
    });
    
    this.useMockProducts();
  },

  // 使用模拟商品数据
  useMockProducts() {
    const mockProducts = [
      {
        id: 1,
        name: '每日坚果混合装',
        image: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        price: '29.90',
        stock: 100
      },
      {
        id: 2,
        name: '夏威夷果',
        image: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        price: '39.90',
        stock: 50
      },
      {
        id: 3,
        name: '碧根果',
        image: 'https://img.yzcdn.cn/vant/apple-3.jpg',
        price: '35.90',
        stock: 80
      },
      {
        id: 4,
        name: '开心果',
        image: 'https://img.yzcdn.cn/vant/apple-4.jpg',
        price: '45.90',
        stock: 60
      }
    ];
    
    this.setData({
      products: mockProducts
    });
  },

  onShow() {
    // 页面显示时刷新购物车数量
  }
});
