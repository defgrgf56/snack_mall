# 🍿 零食小程序商城

一个功能完整的微信小程序商城，包含前端小程序、后端API和完整文档。

## 📱 项目预览

- **小程序AppID**: `wxdca249674206beb2`
- **项目类型**: 微信小程序商城
- **技术栈**: 微信小程序 + Node.js + Express + MySQL + Sequelize

## ✨ 功能特性

### 用户端功能
- ✅ 用户登录（微信授权）
- ✅ 商品浏览（轮播图、分类、热门、新品）
- ✅ 商品搜索
- ✅ 商品详情
- ✅ 购物车管理
- ✅ 订单管理
- ✅ 收货地址管理
- ✅ 优惠券系统
- ✅ 个人中心

### 系统功能
- ✅ JWT身份认证
- ✅ TabBar底部导航
- ✅ 购物车徽标提示
- ✅ 开发/生产模式自动切换
- ✅ 完整的API接口
- ✅ 数据库设计和初始化

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- 微信开发者工具

### 1. 克隆项目

```bash
git clone https://github.com/defgrgf56/snack_mall.git
cd snack_mall
```

### 2. 配置后端

```bash
# 进入后端目录
cd 后端API

# 安装依赖
npm install

# 配置环境变量
copy .env.example .env
notepad .env
```

**必须修改以下配置**:
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=snack_mall
DB_USER=root
DB_PASSWORD=你的数据库密码

# 微信小程序配置
WX_APPID=wxdca249674206beb2
WX_SECRET=你的AppSecret

# JWT配置
JWT_SECRET=随机32位字符串
```

**生成JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**初始化数据库**:
```bash
npm run init-db
npm run seed
```

**启动后端**:
```bash
npm run dev
```

### 3. 配置前端

1. **打开微信开发者工具**

2. **导入项目**
   - 选择"小程序前端"文件夹
   - AppID: `wxdca249674206beb2`

3. **配置开发者工具**
   ```
   详情 → 本地设置:
   ✅ 不校验合法域名
   ✅ 启用调试
   ```

4. **编译运行**

### 4. 测试登录

1. 点击底部"我的"Tab
2. 点击"立即登录"
3. 授权获取用户信息
4. 登录成功 ✅

## 📚 文档导航

### 快速入门
- **[快速启动指南.md](./快速启动指南.md)** - 1分钟快速启动
- **[完成配置三步走.md](./完成配置三步走.md)** - AppSecret配置

### 功能文档
- **[登录功能配置指南.md](./登录功能配置指南.md)** - 登录功能详细配置
- **[登录功能实现方案.md](./小程序前端/登录功能实现方案.md)** - 技术实现方案
- **[TabBar使用说明.md](./小程序前端/TabBar使用说明.md)** - TabBar导航说明
- **[API接口文档.md](./API接口文档.md)** - 完整接口文档

### 问题排查
- **[开发环境登录说明.md](./开发环境登录说明.md)** - 开发模式说明
- **[游客模式登录修复完成.md](./游客模式登录修复完成.md)** - 常见问题修复

## 🏗️ 项目结构

```
snack_mall/
├── 后端API/                      # 后端服务
│   ├── src/
│   │   ├── app.js                # 应用入口
│   │   ├── config/               # 配置文件
│   │   ├── models/               # 数据模型
│   │   ├── routes/               # 路由
│   │   ├── middleware/           # 中间件
│   │   └── scripts/              # 初始化脚本
│   ├── .env.example              # 环境变量模板
│   └── package.json
│
├── 小程序前端/                    # 小程序前端
│   ├── pages/                    # 页面
│   │   ├── index/                # 首页
│   │   ├── category/             # 分类
│   │   ├── cart/                 # 购物车
│   │   ├── user/                 # 我的
│   │   ├── product-detail/       # 商品详情
│   │   ├── search/               # 搜索
│   │   ├── order-*/              # 订单相关
│   │   └── address-*/            # 地址相关
│   ├── utils/                    # 工具函数
│   ├── images/                   # 图片资源
│   ├── app.js                    # 应用入口
│   ├── app.json                  # 应用配置
│   └── project.config.json       # 项目配置
│
├── 后台管理系统架构.md             # 管理后台设计
├── API接口文档.md                 # 接口文档
├── 数据库设计文档.md               # 数据库设计
├── .gitignore                    # Git忽略文件
└── README.md                     # 项目说明
```

## 🎨 页面展示

### 前端页面（11个）

1. **首页** - 轮播图、分类、优惠券、热门商品、新品推荐
2. **分类页** - 商品分类浏览
3. **购物车** - 购物车管理、结算
4. **我的** - 个人中心、订单管理
5. **商品详情** - 商品信息、规格选择、加入购物车
6. **搜索页** - 商品搜索
7. **订单确认** - 订单信息确认、提交
8. **订单列表** - 订单查看、状态管理
9. **订单详情** - 订单详细信息
10. **地址列表** - 收货地址管理
11. **地址编辑** - 添加/编辑收货地址

## 🔧 核心技术

### 前端技术
- 微信小程序原生开发
- Promise/async-await
- 模块化开发
- 组件化设计

### 后端技术
- Node.js + Express
- Sequelize ORM
- MySQL数据库
- JWT身份认证
- RESTful API

### 开发工具
- 微信开发者工具
- VS Code
- Git

## 📊 数据库设计

### 核心表
- `users` - 用户表
- `products` - 商品表
- `categories` - 分类表
- `orders` - 订单表
- `order_items` - 订单商品表
- `addresses` - 收货地址表
- `coupons` - 优惠券表
- `banners` - 轮播图表
- `cart_items` - 购物车表

详见: [数据库设计文档.md](./数据库设计文档.md)

## 🔐 登录功能

### 开发模式（无AppID/游客模式）
- ✅ 自动使用测试账号
- ✅ 无需微信授权
- ✅ 快速开发测试

### 生产模式（有AppID）
- ✅ 微信授权登录
- ✅ 获取真实用户信息
- ✅ JWT token认证

**详细说明**: [登录功能配置指南.md](./登录功能配置指南.md)

## 🎯 API接口

### 认证相关
- `POST /api/auth/login` - 微信登录
- `POST /api/auth/update-profile` - 更新用户资料

### 用户相关
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/phone` - 更新手机号

### 商品相关
- `GET /api/products` - 商品列表
- `GET /api/products/:id` - 商品详情
- `GET /api/categories` - 分类列表
- `GET /api/banners` - 轮播图

### 购物车相关
- `GET /api/cart` - 购物车列表
- `POST /api/cart` - 添加到购物车
- `PUT /api/cart/:id` - 更新购物车
- `DELETE /api/cart/:id` - 删除购物车

### 订单相关
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 订单列表
- `GET /api/orders/:id` - 订单详情
- `GET /api/orders/stats` - 订单统计

**完整文档**: [API接口文档.md](./API接口文档.md)

## ⚙️ 配置说明

### 环境变量

后端 `.env` 文件配置:

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=snack_mall
DB_USER=root
DB_PASSWORD=your_password

# 微信小程序配置
WX_APPID=wxdca249674206beb2
WX_SECRET=your_app_secret

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 检查配置

```bash
cd 后端API
npm run check-env
```

## 🧪 测试

### 后端测试

```bash
# 测试数据库连接
cd 后端API
npm run init-db

# 测试API接口
curl http://localhost:3000/api/products
```

### 前端测试

在微信开发者工具Console:

```javascript
// 测试登录
const app = getApp()
app.login()

// 测试获取商品
wx.request({
  url: 'http://localhost:3000/api/products',
  success: (res) => console.log(res.data)
})
```

## 🐛 常见问题

### 1. 数据库连接失败

**解决方案**:
- 检查MySQL服务是否启动
- 检查.env中数据库配置
- 确认数据库已创建

### 2. 登录失败（getUserProfile错误）

**解决方案**:
- 开发模式会自动使用测试账号
- 生产模式需要配置AppSecret
- 参考: [开发环境登录说明.md](./开发环境登录说明.md)

### 3. 商品数据不显示

**解决方案**:
- 检查后端是否启动
- 运行 `npm run seed` 初始化测试数据
- 查看Console错误信息

## 📝 开发建议

1. **开发阶段**: 使用开发模式，无需配置AppSecret
2. **测试阶段**: 配置真实AppID和AppSecret
3. **上线前**: 
   - 配置HTTPS域名
   - 配置服务器域名白名单
   - 完整功能测试
   - 性能优化

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- **GitHub仓库**: https://github.com/defgrgf56/snack_mall.git
- **微信公众平台**: https://mp.weixin.qq.com/
- **微信小程序文档**: https://developers.weixin.qq.com/miniprogram/dev/framework/

## 📧 联系方式

如有问题，请通过以下方式联系:

- 提交Issue: https://github.com/defgrgf56/snack_mall/issues
- 项目讨论: GitHub Discussions

## ✅ 项目状态

- [x] 数据库设计
- [x] 后端API开发
- [x] 前端页面开发
- [x] 登录功能
- [x] TabBar导航
- [x] 购物车功能
- [x] 订单功能
- [x] 地址管理
- [x] 完整文档
- [ ] 支付功能（待开发）
- [ ] 后台管理系统（待开发）

## 🎉 更新日志

### v1.0.0 (2026-08-14)

**功能特性**:
- ✅ 完整的11个小程序页面
- ✅ 40+个后端API接口
- ✅ 微信登录（支持开发/生产模式）
- ✅ TabBar底部导航（4个Tab）
- ✅ 购物车徽标提示
- ✅ 完整的项目文档

**技术亮点**:
- ✅ 智能环境检测（开发/生产模式自动切换）
- ✅ JWT身份认证
- ✅ Sequelize ORM
- ✅ RESTful API设计

**文档完善**:
- ✅ 20000+字完整文档
- ✅ 快速启动指南
- ✅ 详细配置说明
- ✅ 常见问题解答

---

**开发时间**: 2026年8月12日 - 2026年8月14日  
**项目类型**: 微信小程序商城  
**AppID**: wxdca249674206beb2  
**状态**: ✅ 开发完成，可用于学习和二次开发
