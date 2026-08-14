# 零食小程序商城 - 前端

## 📱 项目介绍

基于原生微信小程序开发的零食商城前端项目。

## 🎯 功能模块

### 已实现页面
- [x] 首页（轮播图、分类、优惠券、热门商品、新品）
- [x] 分类页（左右分栏、商品列表）
- [x] 购物车（商品管理、数量调整、结算）
- [x] 个人中心（用户信息、订单入口、功能菜单）
- [x] 商品详情（轮播图、规格选择、加购/购买）
- [ ] 订单确认
- [ ] 订单列表
- [ ] 订单详情
- [ ] 地址管理
- [ ] 优惠券列表
- [ ] 积分中心
- [ ] 搜索页

## 📁 项目结构

```
小程序前端/
├── pages/                  # 页面目录
│   ├── index/             # 首页
│   ├── category/          # 分类页
│   ├── cart/              # 购物车
│   ├── user/              # 个人中心
│   ├── product-detail/    # 商品详情
│   ├── order-confirm/     # 订单确认
│   ├── order-list/        # 订单列表
│   ├── order-detail/      # 订单详情
│   ├── address-list/      # 地址列表
│   ├── address-edit/      # 地址编辑
│   ├── coupon-list/       # 优惠券列表
│   ├── points/            # 积分中心
│   └── search/            # 搜索页
├── components/            # 组件目录
│   ├── product-card/      # 商品卡片
│   ├── address-card/      # 地址卡片
│   └── order-card/        # 订单卡片
├── utils/                 # 工具函数
│   ├── request.js        # 网络请求封装
│   └── util.js           # 通用工具函数
├── images/                # 图片资源
│   ├── tabbar/           # 底部导航图标
│   └── icon/             # 通用图标
├── app.js                 # 小程序入口文件
├── app.json               # 全局配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
└── sitemap.json          # 搜索配置
```

## 🚀 开发指南

### 1. 环境准备

- 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册微信小程序账号
- 获取 AppID

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择本项目目录
4. 填入 AppID（或使用测试号）

### 3. 配置后端地址

编辑 `app.js` 文件，修改 API 地址：

```javascript
globalData: {
  apiBase: 'https://your-api-domain.com/api'
}
```

### 4. 开始开发

- 点击"编译"按钮即可在开发者工具中预览
- 真机调试：点击"真机调试"
- 上传代码：点击"上传"提交审核

## 📝 开发规范

### 命名规范

- **页面/组件文件夹**：kebab-case（如：`product-detail`）
- **JS 变量/函数**：camelCase（如：`getUserInfo`）
- **常量**：UPPER_SNAKE_CASE（如：`API_BASE_URL`）

### 代码规范

```javascript
// 页面结构
Page({
  data: {
    // 数据
  },
  
  onLoad(options) {
    // 页面加载
  },
  
  // 自定义方法
  customMethod() {
    // 实现
  }
})
```

### 样式规范

- 使用 `rpx` 单位（响应式像素）
- 避免使用内联样式
- 组件样式加 `.wxss` 文件

## 🔌 API 接口

所有接口调用使用封装的 `request.js`：

```javascript
const api = require('../../utils/request.js')

// GET 请求
api.get('/products', { page: 1 }, false)

// POST 请求
api.post('/orders', { product_id: 1 }, true)

// 需要登录的接口，第三个参数传 true
```

## 🎨 主题色

- 主色：`#FF6B00`（橙色）
- 成功：`#52C41A`（绿色）
- 警告：`#FAAD14`（黄色）
- 错误：`#FF4D4F`（红色）
- 文本：`#333`（深灰）
- 次要文本：`#666`（中灰）
- 辅助文本：`#999`（浅灰）

## 📱 页面截图

[待添加实际截图]

## 🎨 图标资源说明

当前项目中引用了图标文件，但实际文件暂未添加（不影响功能测试）。

### 获取图标

1. 访问 [iconfont.cn](https://www.iconfont.cn) 下载所需图标
2. 查看 `images/README.md` 了解详细的图标清单和规格要求
3. 将图标按目录结构放入 `images/` 文件夹

**开发建议**：先完成功能开发和测试，图标可以后续统一处理。

## 🐛 常见问题

### 1. 图标显示错误

- 正常现象，图标文件暂未添加
- 不影响功能测试
- 可参考 `images/README.md` 添加图标

### 2. 无法调用接口

- 检查 `app.js` 中的 `apiBase` 配置
- 确保后端服务已启动
- 检查小程序合法域名配置

### 2. 无法调用接口

- 确保图片路径正确
- 检查图片域名是否在合法域名列表
- 本地图片放在 `images` 目录

### 3. 图片不显示

- 检查是否已授权
- 确保后端登录接口正常
- 查看微信开发者工具控制台错误信息

## 📦 发布流程

### 1. 提交审核前检查

- [ ] 测试所有功能
- [ ] 检查页面跳转
- [ ] 确认支付功能正常
- [ ] 优化图片大小
- [ ] 代码压缩

### 2. 上传代码

1. 点击"上传"按钮
2. 填写版本号和备注
3. 在微信公众平台提交审核

### 3. 发布上线

- 审核通过后点击"发布"
- 用户端自动更新

## 🔗 相关链接

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信支付文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)
- [小程序API文档](https://developers.weixin.qq.com/miniprogram/dev/api/)

## 📄 License

MIT

## 👥 贡献者

- 开发者：[您的名字]
- 设计师：[设计师名字]

---

**最后更新**：2026-08-12


### 4. 无法获取用户信息

- 检查是否已授权
- 确保后端登录接口正常
- 查看微信开发者工具控制台错误信息


---

## 📱 TabBar导航

### 已完成配置 ✅
零食商城底部TabBar导航已配置完成！

**配置**: 4个Tab（首页、分类、购物车、我的）  
**配色**: 橙色 #FF6B00（选中）/ 灰色 #999999（默认）  
**图标**: 8个PNG文件（81x81px）

### 快速开始
1. **测试**: 参考 [TABBAR_TEST.md](./TABBAR_TEST.md)
2. **使用**: 参考 [TabBar使用说明.md](./TabBar使用说明.md)
3. **设计**: 参考 [TabBar设计方案.md](./TabBar设计方案.md)

### 核心功能
```javascript
// Tab切换
wx.switchTab({ url: '/pages/index/index' })

// 更新购物车徽标
const app = getApp()
app.updateCartCount()

// 设置徽标
wx.setTabBarBadge({ index: 2, text: '5' })
```

**详细文档**: [README_TABBAR.md](./README_TABBAR.md)

**配置时间**: 2026年8月13日
