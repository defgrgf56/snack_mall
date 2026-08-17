// pages/category/category.js
const api = require('../../utils/request');

Page({
  data: {
    categories: [],
    currentIndex: 0,
    products: [],
    currentCategoryId: null,
    windowHeight: 0,
    sortType: 'default', // default, sales, price, new
    priceOrder: 'desc', // asc, desc
    loading: false,
    searchBarHeight: 0,
    circleNavHeight: 0,
    filterBarHeight: 0,
    mainContentHeight: 0,
    productsScrollHeight: 0,
    emptyStateHeight: 0
  },

  onLoad(options) {
    this.setWindowHeight();
    this.loadCategories();
    
    // 添加调试日志
    setTimeout(() => {
      console.log('=== 分类页面调试信息 ===');
      console.log('窗口高度:', this.data.windowHeight);
      console.log('商品区高度:', this.data.productsScrollHeight);
      console.log('分类数量:', this.data.categories.length);
      console.log('商品数量:', this.data.products.length);
    }, 1000);
  },

  // 设置窗口高度
  setWindowHeight() {
    const systemInfo = wx.getSystemInfoSync();
    const windowHeight = systemInfo.windowHeight;
    const screenHeight = systemInfo.screenHeight;
    
    // 转换rpx到px: 750rpx = 设备宽度
    const rpxToPx = systemInfo.windowWidth / 750;
    
    // 计算各部分高度（转换rpx为px）
    const searchBarHeight = 70 * rpxToPx;     // 搜索栏 约140rpx
    const circleNavHeight = 160 * rpxToPx;    // 圆形分类 约160rpx  
    const filterBarHeight = 88 * rpxToPx;     // 筛选栏 88rpx
    
    // 主内容区 = 窗口高度 - 搜索栏 - 圆形分类
    const mainContentHeight = windowHeight - searchBarHeight - circleNavHeight;
    
    // 商品滚动区 = 主内容区 - 筛选栏
    const productsScrollHeight = mainContentHeight - filterBarHeight;
    
    this.setData({
      windowHeight: windowHeight,
      searchBarHeight: searchBarHeight,
      circleNavHeight: circleNavHeight,
      filterBarHeight: filterBarHeight,
      mainContentHeight: mainContentHeight,
      productsScrollHeight: productsScrollHeight,
      emptyStateHeight: productsScrollHeight
    });
    
    console.log('=== 高度计算 ===');
    console.log('屏幕高度:', screenHeight);
    console.log('窗口高度:', windowHeight);
    console.log('商品区高度:', productsScrollHeight);
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
    } finally {
      wx.hideLoading();
    }
  },

  // 加载商品列表
  async loadProducts(categoryId) {
    try {
      this.setData({ loading: true });
      wx.showLoading({ title: '加载中...' });
      
      const params = {
        category_id: categoryId,
        status: 1,
        page: 1,
        limit: 20
      };

      // 根据排序类型添加参数
      switch (this.data.sortType) {
        case 'sales':
          params.order_by = 'sales';
          params.order = 'desc';
          break;
        case 'price':
          params.order_by = 'price';
          params.order = this.data.priceOrder;
          break;
        case 'new':
          params.order_by = 'created_at';
          params.order = 'desc';
          break;
      }
      
      const res = await api.get('/products', params, false);
      
      // 处理商品数据，添加榜单信息
      const products = (res.items || []).map((item, index) => {
        if (index < 3 && this.data.sortType === 'sales') {
          item.rank = index + 1;
          item.rank_text = `${['热销', '畅销', '爆款'][index]}榜第${index + 1}名`;
        }
        return item;
      });

      this.setData({
        products: products,
        loading: false
      });
    } catch (error) {
      console.error('加载商品失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
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
      currentCategoryId: categoryId,
      sortType: 'default',
      priceOrder: 'desc'
    });
    
    this.loadProducts(categoryId);
  },

  // 排序切换
  onSortChange(e) {
    const type = e.currentTarget.dataset.type;
    let priceOrder = this.data.priceOrder;

    // 如果点击价格排序，切换升降序
    if (type === 'price') {
      if (this.data.sortType === 'price') {
        priceOrder = priceOrder === 'asc' ? 'desc' : 'asc';
      } else {
        priceOrder = 'desc';
      }
    }

    this.setData({
      sortType: type,
      priceOrder: priceOrder
    });

    this.loadProducts(this.data.currentCategoryId);
  },

  // 搜索
  onSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
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

      // 更新购物车数量
      const app = getApp();
      app.updateCartCount();
    } catch (error) {
      console.error('加入购物车失败:', error);
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      });
    }
  },

  onShow() {
    // 页面显示时刷新购物车数量
    
    // 设置TabBar选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  }
});
