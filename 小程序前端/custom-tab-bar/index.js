// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#FF6B00",
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
        iconText: "🛒"
      },
      {
        pagePath: "/pages/user/user",
        text: "我的",
        iconText: "👤"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
    }
  }
})
