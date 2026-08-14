# 零食小程序商城 - 后端API

## 📦 项目介绍

基于 Node.js + Express + MySQL + Sequelize 开发的零食商城后端API服务。

## 🎯 技术栈

- **Node.js** 18+
- **Express** 4.x - Web框架
- **MySQL** 8.0+ - 数据库
- **Sequelize** 6.x - ORM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Winston** - 日志管理
- **Multer** - 文件上传

## 📁 项目结构

```
后端API/
├── src/
│   ├── app.js                 # 应用入口
│   ├── config/                # 配置文件
│   │   └── database.js       # 数据库配置
│   ├── models/                # 数据模型
│   │   ├── index.js          # 模型入口
│   │   ├── User.js           # 用户模型
│   │   ├── Product.js        # 商品模型
│   │   ├── Order.js          # 订单模型
│   │   └── ...               # 其他模型
│   ├── controllers/           # 控制器
│   │   ├── ProductController.js
│   │   ├── OrderController.js
│   │   └── ...
│   ├── routes/                # 路由
│   │   ├── index.js          # 路由入口
│   │   ├── product.js        # 商品路由
│   │   └── ...
│   ├── middleware/            # 中间件
│   │   ├── auth.js           # 认证中间件
│   │   └── errorHandler.js   # 错误处理
│   ├── utils/                 # 工具函数
│   │   ├── jwt.js            # JWT工具
│   │   ├── logger.js         # 日志工具
│   │   └── response.js       # 响应工具
│   ├── services/              # 业务逻辑层
│   │   ├── WechatService.js  # 微信服务
│   │   └── PaymentService.js # 支付服务
│   └── scripts/               # 脚本
│       ├── init-db.js        # 初始化数据库
│       └── seed.js           # 填充测试数据
├── uploads/                   # 上传文件目录
├── logs/                      # 日志目录
├── .env.example               # 环境变量示例
├── .gitignore
├── package.json
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=snack_mall
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your-secret-key

# 微信小程序配置
WX_APPID=your-wechat-appid
WX_SECRET=your-wechat-secret
```

### 3. 初始化数据库

```bash
# 方式1：使用提供的SQL文件
mysql -u root -p < ../../database.sql

# 方式2：使用Node脚本（如果编写了初始化脚本）
npm run init-db
```

### 4. 启动服务

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

服务将运行在 `http://localhost:3000`

## 📝 API文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **请求头**: `Authorization: Bearer <token>`

### 响应格式

**成功响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据
  }
}
```

**错误响应：**
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

**分页响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 10,
      "totalPages": 10
    }
  }
}
```

### 主要API端点

#### 认证相关 `/api/auth`
- `POST /login` - 微信登录
- `POST /refresh` - 刷新Token
- `GET /profile` - 获取用户信息

#### 商品相关 `/api/products`
- `GET /` - 获取商品列表
- `GET /:id` - 获取商品详情
- `POST /` - 创建商品（管理员）
- `PUT /:id` - 更新商品（管理员）
- `DELETE /:id` - 删除商品（管理员）

#### 购物车 `/api/cart`
- `GET /` - 获取购物车
- `POST /add` - 添加商品
- `PUT /:id` - 更新数量
- `DELETE /:id` - 删除商品
- `DELETE /clear` - 清空购物车

#### 订单 `/api/orders`
- `GET /` - 获取订单列表
- `GET /:id` - 获取订单详情
- `POST /` - 创建订单
- `POST /:id/pay` - 支付订单
- `POST /:id/cancel` - 取消订单
- `POST /:id/confirm` - 确认收货

#### 地址 `/api/addresses`
- `GET /` - 获取地址列表
- `GET /:id` - 获取地址详情
- `POST /` - 创建地址
- `PUT /:id` - 更新地址
- `DELETE /:id` - 删除地址

#### 优惠券 `/api/coupons`
- `GET /available` - 获取可领取优惠券
- `GET /my` - 我的优惠券
- `POST /receive` - 领取优惠券

详细API文档请查看 `API接口文档.md`

## 🔧 开发指南

### 创建新的API端点

1. **创建模型** (如果需要新表)

```javascript
// src/models/YourModel.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const YourModel = sequelize.define('YourModel', {
    // 定义字段
  }, {
    tableName: 'your_table',
    comment: '表注释'
  })
  
  return YourModel
}
```

2. **创建控制器**

```javascript
// src/controllers/YourController.js
const Response = require('../utils/response')

class YourController {
  async list(req, res) {
    // 实现逻辑
    return Response.success(res, data)
  }
}

module.exports = new YourController()
```

3. **创建路由**

```javascript
// src/routes/your.js
const express = require('express')
const router = express.Router()
const YourController = require('../controllers/YourController')
const { authenticate } = require('../middleware/auth')

router.get('/', authenticate, YourController.list)

module.exports = router
```

4. **注册路由**

在 `src/routes/index.js` 中注册：

```javascript
const yourRoutes = require('./your')
router.use('/your', yourRoutes)
```

### 数据库迁移

使用 Sequelize 同步模型（开发环境）：

```javascript
// 在 app.js 中
await sequelize.sync({ alter: true })
```

生产环境建议使用数据库迁移工具。

## 🧪 测试

### 使用 Postman 测试

1. 导入API集合
2. 配置环境变量
3. 测试各个端点

### 使用 curl 测试

```bash
# 获取商品列表
curl http://localhost:3000/api/products

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"wx_code"}'

# 带认证的请求
curl http://localhost:3000/api/user/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 日志管理

日志文件位于 `logs/` 目录：

- `combined.log` - 所有日志
- `error.log` - 错误日志

查看实时日志：

```bash
# 所有日志
tail -f logs/combined.log

# 错误日志
tail -f logs/error.log
```

## 🔒 安全建议

1. **生产环境必须修改 JWT_SECRET**
2. **使用强密码保护数据库**
3. **启用 HTTPS**
4. **定期更新依赖包**
5. **限制API请求频率**
6. **验证所有输入数据**
7. **敏感数据加密存储**

## 🚀 部署

### 方式一：传统部署

1. 服务器环境准备
```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MySQL
sudo apt-get install mysql-server

# 安装 PM2
npm install -g pm2
```

2. 部署应用
```bash
# 克隆代码
git clone <your-repo>
cd 后端API

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
vim .env

# 初始化数据库
mysql -u root -p < ../database.sql

# 启动服务
pm2 start src/app.js --name snack-api

# 设置开机自启
pm2 startup
pm2 save
```

### 方式二：Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建镜像
docker build -t snack-api .

# 运行容器
docker run -d -p 3000:3000 --name snack-api snack-api
```

### 方式三：Serverless部署（腾讯云CloudBase）

适合初期低成本部署，按量付费。

## 🐛 常见问题

### 1. 数据库连接失败
- 检查数据库服务是否启动
- 检查 `.env` 中的数据库配置
- 检查防火墙设置

### 2. JWT验证失败
- 检查token是否过期
- 检查JWT_SECRET配置
- 检查请求头格式

### 3. 文件上传失败
- 检查 `uploads` 目录权限
- 检查文件大小限制
- 检查磁盘空间

## 📚 相关文档

- [Express文档](https://expressjs.com/)
- [Sequelize文档](https://sequelize.org/)
- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)
- [微信支付文档](https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml)

## 📄 License

MIT

---

**开发者**: 您的名字  
**最后更新**: 2026-08-12
