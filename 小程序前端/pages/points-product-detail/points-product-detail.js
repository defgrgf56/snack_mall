// pages/points-product-detail/points-product-detail.js
const api = require('../../utils/request');

Page({
  data: {
    productId: null,
    product: null,
    userPoints: 0,
    quantity: 1,
    canExchange: false,
    remainingLimit: 0 // 剩余可兑换数量
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ productId: options.id });
      this.loadProductDetail();
      this.loadUserPoints();
      this.checkExchangeLimit();
    }
  },

  // 加载商品详情
  async loadProductDetail() {
    try {
      wx.showLoading({ title: '加载中...' });
      const res = await api.get(`/points-exchange/products/${this.data.productId}`, {}, false);
      
      this.setData({
        product: res
      });
      
      this.checkCanExchange();
      wx.hideLoading();
    } catch (error) {
      console.error('加载商品详情失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载用户积分
  async loadUserPoints() {
    try {
      const res = await api.get('/points/balance', {}, false);
      this.setData({
        userPoints: res.points || 0
      });
      this.checkCanExchange();
    } catch (error) {
      console.error('加载用户积分失败:', error);
    }
  },

  // 检查兑换限制
  async checkExchangeLimit() {
    try {
      const res = await api.get('/points-exchange/check-limit', {
        product_id: this.data.productId
      }, false);
      
      this.setData({
        remainingLimit: res.remaining
      });
      this.checkCanExchange();
    } catch (error) {
      console.error('检查兑换限制失败:', error);
    }
  },

  // 检查是否可以兑换
  checkCanExchange() {
    const { product, userPoints, quantity, remainingLimit } = this.data;
    if (!product) return;

    const totalPoints = product.points * quantity;
    const hasEnoughPoints = userPoints >= totalPoints;
    const hasStock = product.stock >= quantity;
    const withinLimit = product.limit_per_person === 0 || remainingLimit >= quantity;

    this.setData({
      canExchange: hasEnoughPoints && hasStock && withinLimit
    });
  },

  // 数量减少
  onQuantityMinus() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
      this.checkCanExchange();
    }
  },

  // 数量增加
  onQuantityPlus() {
    const { product, quantity, remainingLimit } = this.data;
    
    // 检查库存
    if (quantity >= product.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }

    // 检查限购
    if (product.limit_per_person > 0 && quantity >= remainingLimit) {
      wx.showToast({
        title: `最多还能兑换${remainingLimit}件`,
        icon: 'none'
      });
      return;
    }

    this.setData({
      quantity: quantity + 1
    });
    this.checkCanExchange();
  },

  // 兑换商品
  async onExchange() {
    const { product, quantity, canExchange } = this.data;

    if (!canExchange) {
      wx.showToast({
        title: '无法兑换',
        icon: 'none'
      });
      return;
    }

    // 确认弹窗
    wx.showModal({
      title: '确认兑换',
      content: `确定使用 ${product.points * quantity} 积分兑换 ${quantity} 件商品吗？`,
      success: async (res) => {
        if (res.confirm) {
          await this.doExchange();
        }
      }
    });
  },

  // 执行兑换
  async doExchange() {
    try {
      wx.showLoading({ title: '兑换中...' });

      await api.post('/points-exchange/exchange', {
        product_id: this.data.productId,
        quantity: this.data.quantity
      }, false);

      wx.hideLoading();

      wx.showModal({
        title: '兑换成功',
        content: '商品将在3-5个工作日内发货',
        showCancel: false,
        success: () => {
          // 返回上一页或跳转到兑换记录
          wx.navigateBack();
        }
      });
    } catch (error) {
      console.error('兑换失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '兑换失败',
        icon: 'none'
      });
    }
  },

  // 查看兑换记录
  onRecordTap() {
    wx.navigateTo({
      url: '/pages/points-exchange-record/points-exchange-record'
    });
  },

  // 预览图片
  onImageTap() {
    if (this.data.product && this.data.product.image) {
      wx.previewImage({
        urls: [this.data.product.image],
        current: this.data.product.image
      });
    }
  }
});
