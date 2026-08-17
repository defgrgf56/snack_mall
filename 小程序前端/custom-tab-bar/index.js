// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#FF6B00",
    cartCount: 0, // 购物车数量
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconText: "🏠"
      },
      {
        pagePath: "/pages/category/category",
        text: "分类",
        iconText: "📋"
      },
      {
        pagePath: "/pages/cart/cart",
        text: "购物车",
        iconText: "🛒",
        showBadge: true // 标记需要显示徽章
      },
      {
        pagePath: "/pages/user/user",
        text: "我的",
        iconText: "👤"
      }
    ]
  },

  lifetimes: {
    attached() {
      // 组件加载时获取购物车数量
      this.updateCartCount();
    }
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
    },

    // 更新购物车数量
    updateCartCount() {
      const app = getApp();
      if (app.globalData) {
        this.setData({
          cartCount: app.globalData.cartCount || 0
        });
      }
    }
  }
})
