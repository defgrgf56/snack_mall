# TabBar 使用说明

## ✅ 已完成配置

### 1. TabBar结构（4个Tab）
```
┌─────────┬─────────┬─────────┬─────────┐
│  🏠首页  │ 📋分类  │ 🛒购物车 │ 👤我的  │
└─────────┴─────────┴─────────┴─────────┘
```

### 2. 配置文件
- **app.json**: TabBar配置已添加
- **图标文件**: 8个PNG图标已生成（在 `/images/` 目录）

### 3. 图标列表
```
✅ icon-home.png              - 首页默认（灰色 #999999）
✅ icon-home-active.png       - 首页选中（橙色 #FF6B00）
✅ icon-category.png          - 分类默认
✅ icon-category-active.png   - 分类选中
✅ icon-cart.png              - 购物车默认
✅ icon-cart-active.png       - 购物车选中
✅ icon-user.png              - 我的默认
✅ icon-user-active.png       - 我的选中
```

---

## 🎨 配置详情

### app.json TabBar配置
```json
{
  "tabBar": {
    "color": "#999999",              // 未选中文字颜色（灰色）
    "selectedColor": "#FF6B00",      // 选中文字颜色（橙色）
    "backgroundColor": "#ffffff",    // 背景色（白色）
    "borderStyle": "black",          // 边框颜色
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/icon-home.png",
        "selectedIconPath": "images/icon-home-active.png"
      },
      {
        "pagePath": "pages/category/category",
        "text": "分类",
        "iconPath": "images/icon-category.png",
        "selectedIconPath": "images/icon-category-active.png"
      },
      {
        "pagePath": "pages/cart/cart",
        "text": "购物车",
        "iconPath": "images/icon-cart.png",
        "selectedIconPath": "images/icon-cart-active.png"
      },
      {
        "pagePath": "pages/user/user",
        "text": "我的",
        "iconPath": "images/icon-user.png",
        "selectedIconPath": "images/icon-user-active.png"
      }
    ]
  }
}
```

---

## 💡 使用功能

### 1. 页面跳转（在TabBar页面之间跳转）
```javascript
// 使用 wx.switchTab 跳转TabBar页面
wx.switchTab({
  url: '/pages/index/index'  // 跳转到首页
})

wx.switchTab({
  url: '/pages/cart/cart'    // 跳转到购物车
})
```

**注意**: 
- ✅ TabBar页面之间跳转必须使用 `wx.switchTab`
- ❌ 不能使用 `wx.navigateTo` 或 `wx.redirectTo`

### 2. 购物车徽标（显示购物车数量）

#### 方法1: 在app.js中更新（推荐）
```javascript
// app.js 中已有的方法
updateCartCount() {
  const token = this.globalData.token
  if (!token) {
    this.globalData.cartCount = 0
    return
  }

  wx.request({
    url: `${this.globalData.apiBase}/cart/count`,
    header: {
      'Authorization': `Bearer ${token}`
    },
    success: (res) => {
      if (res.data.code === 200) {
        this.globalData.cartCount = res.data.data.count
        // 更新tabBar徽标
        if (this.globalData.cartCount > 0) {
          wx.setTabBarBadge({
            index: 2,  // 购物车Tab索引（从0开始）
            text: String(this.globalData.cartCount)
          })
        } else {
          wx.removeTabBarBadge({
            index: 2
          })
        }
      }
    }
  })
}

// 在需要的地方调用
const app = getApp()
app.updateCartCount()
```

#### 方法2: 在任意页面中直接更新
```javascript
// 添加商品到购物车后
wx.request({
  url: 'http://localhost:3000/api/cart/add',
  method: 'POST',
  data: { product_id: 1, quantity: 1 },
  success: (res) => {
    if (res.data.code === 200) {
      // 更新徽标
      wx.setTabBarBadge({
        index: 2,
        text: String(res.data.data.totalCount)
      })
    }
  }
})

// 移除商品后
wx.removeTabBarBadge({
  index: 2
})
```

### 3. 手动设置徽标（用于测试）
```javascript
// 显示徽标
wx.setTabBarBadge({
  index: 2,      // TabBar索引：0=首页, 1=分类, 2=购物车, 3=我的
  text: '5'      // 显示的文字，必须是字符串
})

// 移除徽标
wx.removeTabBarBadge({
  index: 2
})

// 显示红点（不显示数字）
wx.showTabBarRedDot({
  index: 3       // 在"我的"Tab显示红点
})

// 隐藏红点
wx.hideTabBarRedDot({
  index: 3
})
```

### 4. 动态切换TabBar样式
```javascript
// 修改文字颜色
wx.setTabBarStyle({
  color: '#999999',
  selectedColor: '#FF6B00',
  backgroundColor: '#ffffff',
  borderStyle: 'black'
})

// 修改某个Tab的文字
wx.setTabBarItem({
  index: 2,
  text: '购物车(5)'  // 动态显示数量
})

// 显示TabBar
wx.showTabBar()

// 隐藏TabBar
wx.hideTabBar()
```

---

## 🎯 实际使用场景

### 场景1: 商品详情页添加购物车
```javascript
// pages/product-detail/product-detail.js
const app = getApp()

Page({
  // 添加到购物车
  addToCart() {
    wx.request({
      url: `${app.globalData.apiBase}/cart/add`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      data: {
        product_id: this.data.product.id,
        quantity: this.data.quantity
      },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: '已加入购物车',
            icon: 'success'
          })
          // 更新购物车徽标
          app.updateCartCount()
        }
      }
    })
  }
})
```

### 场景2: 购物车页面删除商品
```javascript
// pages/cart/cart.js
const app = getApp()

Page({
  // 删除购物车商品
  deleteItem(id) {
    wx.request({
      url: `${app.globalData.apiBase}/cart/remove/${id}`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: (res) => {
        if (res.data.code === 200) {
          // 重新加载购物车
          this.loadCartItems()
          // 更新徽标
          app.updateCartCount()
        }
      }
    })
  }
})
```

### 场景3: 订单确认页提交订单
```javascript
// pages/order-confirm/order-confirm.js
const app = getApp()

Page({
  // 提交订单
  submitOrder() {
    wx.request({
      url: `${app.globalData.apiBase}/orders/create`,
      method: 'POST',
      data: { /* 订单数据 */ },
      success: (res) => {
        if (res.data.code === 200) {
          wx.showToast({
            title: '订单提交成功',
            icon: 'success'
          })
          // 清空购物车徽标
          app.globalData.cartCount = 0
          wx.removeTabBarBadge({ index: 2 })
          
          // 跳转到订单详情
          wx.redirectTo({
            url: `/pages/order-detail/order-detail?id=${res.data.data.id}`
          })
        }
      }
    })
  }
})
```

### 场景4: 用户登录后更新
```javascript
// pages/user/user.js
const app = getApp()

Page({
  onShow() {
    // 每次显示页面时检查登录状态
    if (app.globalData.token) {
      this.setData({ isLogin: true })
      // 更新购物车数量
      app.updateCartCount()
    } else {
      this.setData({ isLogin: false })
      // 清除徽标
      wx.removeTabBarBadge({ index: 2 })
    }
  }
})
```

---

## 📝 注意事项

### ⚠️ TabBar限制
1. **页面跳转**:
   - TabBar页面之间只能用 `wx.switchTab`
   - 非TabBar页面跳转到TabBar页面也用 `wx.switchTab`
   - TabBar页面不能传递参数

2. **页面数量**:
   - 最少2个，最多5个Tab
   - 当前配置：4个Tab

3. **图标要求**:
   - 必须是本地图片（不支持网络图片）
   - 格式：PNG（推荐带透明背景）
   - 尺寸：81x81px（普通屏）或 162x162px（高清屏）
   - 大小：建议每个图标小于40KB

4. **徽标**:
   - 最多显示3个字符（超过显示"..."）
   - 红点和数字徽标只能显示一种

### ✅ 最佳实践

1. **统一管理购物车更新**:
   - 在 `app.js` 中定义 `updateCartCount()` 方法
   - 所有修改购物车的地方都调用这个方法

2. **徽标更新时机**:
   - 添加商品到购物车后
   - 删除购物车商品后
   - 修改商品数量后
   - 提交订单后
   - 登录/退出登录后
   - 购物车页面onShow时

3. **错误处理**:
   ```javascript
   updateCartCount() {
     // 未登录时不显示徽标
     if (!this.globalData.token) {
       wx.removeTabBarBadge({ index: 2 })
       return
     }
     
     // 请求失败时也移除徽标
     wx.request({
       // ...
       fail: () => {
         wx.removeTabBarBadge({ index: 2 })
       }
     })
   }
   ```

---

## 🔧 调试技巧

### 1. 查看当前TabBar配置
在任意页面的 `onLoad` 中打印：
```javascript
onLoad() {
  console.log('TabBar配置:', this.getTabBar())
}
```

### 2. 测试徽标
在调试器Console中执行：
```javascript
// 显示徽标
wx.setTabBarBadge({ index: 2, text: '99+' })

// 移除徽标
wx.removeTabBarBadge({ index: 2 })

// 显示红点
wx.showTabBarRedDot({ index: 3 })
```

### 3. 查看购物车数量
```javascript
const app = getApp()
console.log('购物车数量:', app.globalData.cartCount)
```

---

## 📚 相关文档

- [微信小程序TabBar官方文档](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#tabBar)
- [TabBar API文档](https://developers.weixin.qq.com/miniprogram/dev/api/ui/tab-bar/wx.setTabBarBadge.html)
- [页面路由文档](https://developers.weixin.qq.com/miniprogram/dev/api/route/wx.switchTab.html)

---

## ✅ 完成状态

- [x] TabBar配置已添加到 app.json
- [x] 8个图标文件已生成（81x81px PNG）
- [x] 购物车徽标更新逻辑已实现
- [x] 4个Tab页面已存在且可正常访问
- [x] 配色符合项目主题（橙色 #FF6B00）

---

**创建日期**: 2026年8月13日  
**适用项目**: 零食小程序商城  
**版本**: v1.0
