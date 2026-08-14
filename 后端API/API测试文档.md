# 零食商城后端API测试文档

## 🔗 基础信息
- **服务地址**: http://localhost:3000
- **API前缀**: /api
- **认证方式**: Bearer Token (JWT)

## 📝 API接口列表

### 1. 认证模块 (/api/auth)

#### 1.1 微信小程序登录
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "code": "微信登录凭证code"
}

Response:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "nickname": "用户名",
      "avatar": "头像URL",
      "phone": "138****8888",
      "level": 1,
      "points": 0
    }
  }
}
```

#### 1.2 更新用户资料
```
POST /api/auth/update-profile
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "nickname": "新昵称",
  "avatar": "新头像URL",
  "gender": 1
}

Response:
{
  "code": 200,
  "message": "更新成功",
  "data": { ... }
}
```

---

### 2. 用户模块 (/api/user)

#### 2.1 获取用户信息
```
GET /api/user/info
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "nickname": "用户名",
    "avatar": "头像URL",
    "phone": "138****8888",
    "gender": 1,
    "level": 1,
    "points": 1280,
    "coupon_count": 5
  }
}
```

#### 2.2 更新用户信息
```
PUT /api/user/info
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "nickname": "新昵称",
  "avatar": "新头像",
  "gender": 1,
  "phone": "13800138000"
}
```

---

### 3. 购物车模块 (/api/cart)

#### 3.1 获取购物车列表
```
GET /api/cart
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "product_id": 1,
      "quantity": 2,
      "spec": "500g",
      "product": {
        "id": 1,
        "name": "每日坚果混合装",
        "cover": "商品图片URL",
        "price": "29.90",
        "stock": 100,
        "status": 1
      }
    }
  ]
}
```

#### 3.2 添加到购物车
```
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "product_id": 1,
  "quantity": 1,
  "spec": "500g"
}

Response:
{
  "code": 200,
  "message": "已加入购物车",
  "data": { ... }
}
```

#### 3.3 更新购物车数量
```
PUT /api/cart/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "quantity": 3
}
```

#### 3.4 删除购物车项
```
DELETE /api/cart/:id
Authorization: Bearer {token}
```

#### 3.5 批量删除购物车
```
POST /api/cart/batch-delete
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "ids": [1, 2, 3]
}
```

#### 3.6 获取购物车数量
```
GET /api/cart/count
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": { "count": 5 }
}
```

#### 3.7 结算购物车（获取结算信息）
```
GET /api/cart/settle?ids=1,2,3
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ ... ]
  }
}
```

---

### 4. 地址模块 (/api/addresses)

#### 4.1 获取地址列表
```
GET /api/addresses
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "consignee": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园科技大厦A座1001",
      "is_default": 1
    }
  ]
}
```

#### 4.2 获取默认地址
```
GET /api/addresses/default
Authorization: Bearer {token}
```

#### 4.3 获取地址详情
```
GET /api/addresses/:id
Authorization: Bearer {token}
```

#### 4.4 创建地址
```
POST /api/addresses
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "consignee": "张三",
  "phone": "13800138000",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "detail": "科技园科技大厦A座1001",
  "is_default": 1
}
```

#### 4.5 更新地址
```
PUT /api/addresses/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "consignee": "李四",
  "phone": "13900139000",
  ...
}
```

#### 4.6 删除地址
```
DELETE /api/addresses/:id
Authorization: Bearer {token}
```

#### 4.7 设置默认地址
```
PUT /api/addresses/:id/default
Authorization: Bearer {token}
```

---

### 5. 订单模块 (/api/orders)

#### 5.1 创建订单
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "address_id": 1,
  "delivery_type": 1,
  "remark": "尽快发货",
  "coupon_id": null,
  "points_used": 0,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "spec": "500g"
    }
  ],
  "cart_ids": [1, 2]  // 可选，从购物车结算时传递
}

Response:
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "order_id": 1,
    "order_no": "SN1723512345678"
  }
}
```

#### 5.2 获取订单列表
```
GET /api/orders?status=1&page=1&limit=10
Authorization: Bearer {token}

Query Parameters:
- status: 订单状态 (1=待付款, 2=待发货, 3=待收货, 4=已完成, 5=已取消, 6=已退款)
- page: 页码
- limit: 每页数量

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ ... ],
    "total": 20,
    "page": 1,
    "limit": 10
  }
}
```

#### 5.3 获取订单详情
```
GET /api/orders/:id
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "order_no": "SN1723512345678",
    "status": 1,
    "total_amount": "59.80",
    "address": {
      "consignee": "张三",
      "phone": "13800138000",
      ...
    },
    "items": [ ... ]
  }
}
```

#### 5.4 取消订单
```
PUT /api/orders/:id/cancel
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "订单已取消",
  "data": null
}
```

#### 5.5 确认收货
```
PUT /api/orders/:id/receive
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "确认收货成功",
  "data": null
}
```

#### 5.6 删除订单
```
DELETE /api/orders/:id
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

#### 5.7 获取订单统计
```
GET /api/orders/stats
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "pending": 2,       // 待付款
    "paid": 1,          // 待发货
    "shipped": 3,       // 待收货
    "uncommented": 5    // 待评价
  }
}
```

---

### 6. 商品模块 (/api/products)

#### 6.1 获取商品列表
```
GET /api/products?category_id=1&keyword=坚果&page=1&limit=10
```

#### 6.2 获取商品详情
```
GET /api/products/:id
```

---

### 7. 分类模块 (/api/categories)

#### 7.1 获取分类列表
```
GET /api/categories
```

---

### 8. 轮播图模块 (/api/banners)

#### 8.1 获取轮播图列表
```
GET /api/banners
```

---

## 🔐 认证说明

大部分接口需要在 Header 中携带 JWT Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

获取 Token 的方式：
1. 调用 `/api/auth/login` 接口登录
2. 从返回结果中获取 `token` 字段
3. 后续请求在 Header 中携带该 Token

---

## ⚠️ 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或Token失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 🧪 测试建议

1. **使用 Postman 或 Apifox 测试**
   - 导入API接口
   - 配置环境变量 `baseURL = http://localhost:3000/api`
   - 配置全局 Header `Authorization`

2. **测试流程**
   ```
   登录 → 获取Token → 浏览商品 → 加入购物车 → 创建地址 → 创建订单 → 订单操作
   ```

3. **数据库已有测试数据**
   - 6个商品分类
   - 8个商品
   - 3个轮播图
   - 3个优惠券

---

## 📌 注意事项

1. **微信登录**：需要配置真实的 `WX_APPID` 和 `WX_SECRET`，否则登录会失败
2. **数据库**：确保 MySQL 服务运行，数据库 `snack_mall` 存在且有数据
3. **端口**：默认端口 3000，如被占用可修改 `.env` 中的 `PORT`
4. **跨域**：已配置 CORS，前端可直接调用

---

## 📅 更新日志

**2026-08-13**
- ✅ 实现微信登录认证
- ✅ 实现JWT Token验证中间件
- ✅ 完善购物车CRUD功能
- ✅ 完善订单创建和状态流转
- ✅ 实现地址管理CRUD
- ✅ 实现用户信息获取和更新
- ✅ 添加库存检查和扣减逻辑
- ✅ 添加订单取消和确认收货功能
