# TabBar 图标说明

## 📁 所需图标文件

### TabBar图标（8个PNG文件）

#### 1. 首页图标
- `icon-home.png` - 首页默认状态（灰色）
- `icon-home-active.png` - 首页选中状态（橙色 #FF6B00）

#### 2. 分类图标
- `icon-category.png` - 分类默认状态（灰色）
- `icon-category-active.png` - 分类选中状态（橙色 #FF6B00）

#### 3. 购物车图标
- `icon-cart.png` - 购物车默认状态（灰色）
- `icon-cart-active.png` - 购物车选中状态（橙色 #FF6B00）

#### 4. 我的图标
- `icon-user.png` - 我的默认状态（灰色）
- `icon-user-active.png` - 我的选中状态（橙色 #FF6B00）

---

## 🎨 设计规范

### 尺寸要求
- **推荐尺寸**: 81x81px（用于普通屏幕）
- **高清尺寸**: 162x162px（用于高清屏幕，推荐）
- **格式**: PNG格式，支持透明背景
- **文件大小**: 建议每个图标文件小于40KB

### 颜色规范
- **默认状态**: #999999（浅灰色）或 #666666（深灰色）
- **选中状态**: #FF6B00（橙色，项目主色）
- **背景**: 透明背景

### 设计风格
- **风格**: 线性图标（简洁、现代）
- **线条粗细**: 2-3px
- **统一性**: 所有图标风格保持一致
- **识别度**: 图标清晰易识别

---

## 🖼️ 图标设计建议

### 1. 首页图标 (icon-home)
```
建议样式: 房子/主页图标
参考: 🏠
- 简单的房子轮廓
- 包含门和屋顶
```

### 2. 分类图标 (icon-category)
```
建议样式: 九宫格/列表图标
参考: 📋
- 3x3的小方格
- 或三条横线（列表）
```

### 3. 购物车图标 (icon-cart)
```
建议样式: 购物车图标
参考: 🛒
- 经典购物车造型
- 带轮子
```

### 4. 我的图标 (icon-user)
```
建议样式: 用户头像图标
参考: 👤
- 圆形头部+肩膀轮廓
- 简单人形剪影
```

---

## 🛠️ 制作方法

### 方法1: 在线图标库（推荐）
1. **iconfont** (https://www.iconfont.cn/)
   - 搜索关键词：首页、分类、购物车、用户
   - 下载PNG格式
   - 调整颜色为 #999999 和 #FF6B00

2. **IconPark** (https://iconpark.oceanengine.com/)
   - 字节跳动出品
   - 支持自定义颜色和尺寸

3. **Feather Icons** (https://feathericons.com/)
   - 简洁风格
   - 开源免费

### 方法2: 设计工具制作
1. **Figma** / **Sketch**
   - 创建 81x81px 画板
   - 绘制图标（线条粗细2-3px）
   - 导出PNG格式（@1x 和 @2x）

2. **Adobe Illustrator**
   - 矢量绘制
   - 导出PNG格式

### 方法3: AI生成
使用AI工具生成简洁的线性图标，然后调整颜色

---

## 📦 其他页面图标

除了TabBar图标，项目中还需要以下图标：

### 页面装饰图标
- `icon-search.png` - 搜索图标（首页搜索框）
- `icon-arrow-right.png` - 右箭头（列表项）
- `empty.png` - 空状态图（暂无数据）

### 分类图标（可选）
如果需要为每个商品分类添加图标：
- `category-snacks.png` - 休闲零食
- `category-drinks.png` - 饮料
- `category-nuts.png` - 坚果炒货
- 等等...

---

## 🎯 快速部署

如果您需要快速测试，可以：

1. **临时方案**: 使用纯色方块代替图标
   ```javascript
   // 在页面中使用纯色背景暂时显示
   ```

2. **使用emoji**: 微信小程序支持emoji作为临时图标
   - 但不推荐用于正式版本

3. **在线图标转换**: 
   - 访问 iconfont.cn
   - 下载所需图标
   - 使用在线工具调整颜色

---

## ✅ 文件清单

确保以下文件存在于 `/images/` 目录：

```
小程序前端/images/
├── icon-home.png              ✅ 首页-默认
├── icon-home-active.png       ✅ 首页-选中
├── icon-category.png          ✅ 分类-默认
├── icon-category-active.png   ✅ 分类-选中
├── icon-cart.png              ✅ 购物车-默认
├── icon-cart-active.png       ✅ 购物车-选中
├── icon-user.png              ✅ 我的-默认
├── icon-user-active.png       ✅ 我的-选中
├── icon-search.png            ⚠️  搜索图标
├── icon-arrow-right.png       ⚠️  箭头图标
└── empty.png                  ⚠️  空状态图
```

---

## 🔗 参考资源

- [微信小程序TabBar文档](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#tabBar)
- [iconfont图标库](https://www.iconfont.cn/)
- [IconPark图标库](https://iconpark.oceanengine.com/)
- [Feather Icons](https://feathericons.com/)

---

**创建日期**: 2026年8月13日  
**适用项目**: 零食小程序商城
