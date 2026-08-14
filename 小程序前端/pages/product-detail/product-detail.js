// pages/product-detail/product-detail.js
const api = require('../../utils/request');

Page({
  data: {
    productId: null,
    product: {},
    coupons: [],
    specList: ['500g', '1000g', '2000g'],
    selectedSpec: '500g',
    buyQuantity: 1,
    cartCount: 0,
    showSpecPopup: false,
    actionType: '' // 'cart' 或 'buy'
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        productId: options.id
      });
      this.loadProductDetail(options.id);
      this.loadCartCount();
    }
  },

  // 加载商品详情
  async loadProductDetail(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      
      const res = await api.get(`/products/${id}`, {}, false); // 不需要登录
      
      // 处理商品图片
      const product = res
      if (product.images && typeof product.images === 'string') {
        product.images = product.images.split(',');
      } else if (!product.images) {
        product.images = [product.cover]; // 使用 cover 字段
      }
      
      // 处理详情图片
      if (product.detail_images && typeof product.detail_images === 'string') {
        product.detail_images = product.detail_images.split(',');
      }
      
      this.setData({
        product
      });
      
      // 加载可用优惠券
      this.loadCoupons();
    } catch (error) {
      console.error('加载商品详情失败:', error);
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

  // 加载优惠券
  async loadCoupons() {
    try {
      const res = await api.get('/coupons/available', {
        product_id: this.data.productId
      });
      
      this.setData({
        coupons: res || []
      });
    } catch (error) {
      console.error('加载优惠券失败:', error);
    }
  },

  // 加载购物车数量
  async loadCartCount() {
    try {
      const res = await api.get('/cart/count', {}, false); // 不需要登录
      this.setData({
        cartCount: res.count || 0
      });
    } catch (error) {
      console.error('加载购物车数量失败:', error);
    }
  },

  // 显示规格弹窗
  onShowSpecPopup() {
    this.setData({
      showSpecPopup: true
    });
  },

  // 隐藏规格弹窗
  onHideSpecPopup() {
    this.setData({
      showSpecPopup: false
    });
  },

  // 阻止冒泡
  onStopPropagation() {},

  // 选择规格
  onSelectSpec(e) {
    const spec = e.currentTarget.dataset.spec;
    this.setData({
      selectedSpec: spec
    });
  },

  // 减少数量
  onDecreaseQuantity() {
    if (this.data.buyQuantity > 1) {
      this.setData({
        buyQuantity: this.data.buyQuantity - 1
      });
    }
  },

  // 增加数量
  onIncreaseQuantity() {
    if (this.data.buyQuantity < this.data.product.stock) {
      this.setData({
        buyQuantity: this.data.buyQuantity + 1
      });
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
    }
  },

  // 确认规格
  onConfirmSpec() {
    this.setData({
      showSpecPopup: false
    });
    
    if (this.data.actionType === 'cart') {
      this.addToCart();
    } else if (this.data.actionType === 'buy') {
      this.buyNow();
    }
  },

  // 加入购物车
  onAddToCart() {
    this.setData({
      actionType: 'cart',
      showSpecPopup: true
    });
  },

  // 添加到购物车
  async addToCart() {
    try {
      await api.post('/cart/add', {
        product_id: this.data.productId,
        quantity: this.data.buyQuantity,
        spec: this.data.selectedSpec
      });
      
      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
      
      // 更新购物车数量
      this.loadCartCount();
      
      // 重置数量
      this.setData({
        buyQuantity: 1
      });
    } catch (error) {
      console.error('加入购物车失败:', error);
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      });
    }
  },

  // 立即购买
  onBuyNow() {
    this.setData({
      actionType: 'buy',
      showSpecPopup: true
    });
  },

  // 立即购买
  async buyNow() {
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?productId=${this.data.productId}&quantity=${this.data.buyQuantity}&spec=${this.data.selectedSpec}`
    });
  },

  // 回到首页
  onGoHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 去购物车
  onGoCart() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.product.name,
      path: `/pages/product-detail/product-detail?id=${this.data.productId}`,
      imageUrl: this.data.product.image
    };
  },

  // 使用模拟数据
  useMockData() {
    const mockProduct = {
      id: 1,
      name: '每日坚果混合装',
      description: '精选优质坚果，营养美味',
      price: '29.90',
      original_price: '39.90',
      image: 'https://img.yzcdn.cn/vant/apple-1.jpg',
      images: [
        'https://img.yzcdn.cn/vant/apple-1.jpg',
        'https://img.yzcdn.cn/vant/apple-2.jpg',
        'https://img.yzcdn.cn/vant/apple-3.jpg'
      ],
      stock: 100,
      sales: 1234,
      brand: '三只松鼠',
      origin: '中国',
      shelf_life: '180天',
      detail_images: [
        'https://img.yzcdn.cn/vant/apple-1.jpg',
        'https://img.yzcdn.cn/vant/apple-2.jpg'
      ]
    };
    
    const mockCoupons = [
      {
        id: 1,
        min_amount: '50',
        discount_amount: '5'
      },
      {
        id: 2,
        min_amount: '100',
        discount_amount: '15'
      }
    ];
    
    this.setData({
      product: mockProduct,
      coupons: mockCoupons
    });
  }
});
