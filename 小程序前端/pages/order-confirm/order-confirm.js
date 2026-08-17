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
      console.log('=== 开始加载购物车商品 ===');
      console.log('cartIds:', cartIds);
      
      const res = await api.get('/cart/settle', { ids: cartIds }, false);
      console.log('结算接口返回:', res);
      
      const items = res.items || [];
      console.log('商品列表:', items);
      
      this.setData({
        products: items
      });
      
      console.log('设置后的products:', this.data.products);
      this.calculatePrice();
    } catch (error) {
      console.error('加载购物车商品失败:', error);
      wx.showToast({
        title: '加载商品失败',
        icon: 'none'
      });
    }
  },

  // 从商品直接购买
  async loadFromProduct(productId, quantity, spec) {
    try {
      console.log('=== 开始加载商品 ===');
      console.log('productId:', productId);
      console.log('quantity:', quantity);
      console.log('spec:', spec);
      
      const res = await api.get(`/products/${productId}`, {}, false);
      const product = res;
      
      console.log('商品信息:', product);
      
      const productData = [{
        product_id: product.id,
        product,
        quantity: parseInt(quantity) || 1,
        spec: spec || ''
      }];
      
      console.log('商品数据:', productData);
      
      this.setData({
        products: productData
      });
      
      console.log('设置后的products:', this.data.products);
      this.calculatePrice();
    } catch (error) {
      console.error('加载商品失败:', error);
      wx.showToast({
        title: '加载商品失败',
        icon: 'none'
      });
    }
  },

  // 加载默认地址
  async loadDefaultAddress() {
    try {
      const res = await api.get('/addresses/default', {}, false);
      console.log('=== 默认地址数据 ===', res);
      if (res) {
        this.setData({
          selectedAddress: res
        });
        console.log('selectedAddress:', this.data.selectedAddress);
      } else {
        console.log('没有默认地址');
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
      const price = parseFloat(item.product.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      totalPrice += price * quantity;
    });
    
    const couponDiscount = parseFloat(this.data.couponDiscount) || 0;
    const pointsDiscount = parseFloat(this.data.pointsDiscount) || 0;
    const finalPrice = Math.max(0, totalPrice - couponDiscount - pointsDiscount);
    
    console.log('=== 价格计算 ===');
    console.log('商品列表:', products);
    console.log('商品总价:', totalPrice);
    console.log('优惠券折扣:', couponDiscount);
    console.log('积分折扣:', pointsDiscount);
    console.log('最终价格:', finalPrice);
    
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
  }
});
