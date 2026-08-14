// pages/order-confirm/order-confirm.js
const api = require('../../utils/request');

Page({
  data: {
    selectedAddress: null,
    products: [],
    deliveryType: 1, // 1:快递配送 2:到店自提
    remark: '',
    couponId: null,
    couponDiscount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    totalPrice: 0,
    finalPrice: 0
  },

  onLoad(options) {
    // 从购物车结算
    if (options.cartIds) {
      this.loadFromCart(options.cartIds);
    }
    // 直接购买
    else if (options.productId) {
      this.loadFromProduct(options.productId, options.quantity, options.spec);
    }
    
    this.loadDefaultAddress();
  },

  // 从购物车加载
  async loadFromCart(cartIds) {
    try {
      const res = await api.get('/cart/settle', { ids: cartIds }, false);
      this.setData({
        products: res.items || []
      });
      this.calculatePrice();
    } catch (error) {
      console.error('加载购物车商品失败:', error);
      this.useMockProducts();
    }
  },

  // 从商品直接购买
  async loadFromProduct(productId, quantity, spec) {
    try {
      const res = await api.get(`/products/${productId}`, {}, false);
      const product = res
      
      this.setData({
        products: [{
          product_id: product.id,
          product,
          quantity: parseInt(quantity) || 1,
          spec: spec || ''
        }]
      });
      this.calculatePrice();
    } catch (error) {
      console.error('加载商品失败:', error);
    }
  },

  // 加载默认地址
  async loadDefaultAddress() {
    try {
      const res = await api.get('/addresses/default', {}, false);
      if (res) {
        this.setData({
          selectedAddress: res
        });
      }
    } catch (error) {
      console.error('加载默认地址失败:', error);
    }
  },

  // 选择地址
  onSelectAddress() {
    wx.navigateTo({
      url: '/pages/address-list/address-list?select=1'
    });
  },

  // 配送方式切换
  onDeliveryTypeChange(e) {
    this.setData({
      deliveryType: parseInt(e.detail.value)
    });
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  // 选择优惠券
  onSelectCoupon() {
    wx.navigateTo({
      url: '/pages/coupon-select/coupon-select'
    });
  },

  // 计算价格
  calculatePrice() {
    const products = this.data.products;
    let totalPrice = 0;
    
    products.forEach(item => {
      const price = parseFloat(item.product.price);
      totalPrice += price * item.quantity;
    });
    
    const couponDiscount = this.data.couponDiscount;
    const pointsDiscount = this.data.pointsDiscount;
    const finalPrice = Math.max(0, totalPrice - couponDiscount - pointsDiscount);
    
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      finalPrice: finalPrice.toFixed(2)
    });
  },

  // 提交订单
  async onSubmit() {
    const { selectedAddress, deliveryType, products, remark, couponId, pointsUsed } = this.data;
    
    // 验证地址
    if (deliveryType === 1 && !selectedAddress) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }
    
    try {
      wx.showLoading({ title: '提交中...' });
      
      const orderData = {
        address_id: selectedAddress?.id,
        delivery_type: deliveryType,
        remark,
        coupon_id: couponId,
        points_used: pointsUsed,
        items: products.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          spec: item.spec
        }))
      };
      
      const res = await api.post('/orders', orderData, false);
      
      wx.hideLoading();
      
      wx.showToast({
        title: '订单创建成功',
        icon: 'success'
      });
      
      // 跳转到订单详情或支付页
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order-detail/order-detail?id=${res.order_id}`
        });
      }, 1500);
    } catch (error) {
      console.error('提交订单失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '提交失败',
        icon: 'none'
      });
    }
  },

  // 使用模拟商品
  useMockProducts() {
    const mockProducts = [
      {
        product_id: 1,
        quantity: 2,
        spec: '500g',
        product: {
          id: 1,
          name: '每日坚果混合装',
          cover: 'https://img.yzcdn.cn/vant/apple-1.jpg',
          price: '29.90'
        }
      }
    ];
    
    this.setData({
      products: mockProducts
    });
    this.calculatePrice();
  }
});
