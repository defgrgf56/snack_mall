# 零食小程序商城 - API接口文档

## 📋 文档说明

### 基础信息

- **Base URL**: `https://your-domain.com/api`
- **版本**: v1.0
- **更新时间**: 2026-08-12

### 认证方式

使用 JWT Token 认证，需要在请求头中添加：

```
Authorization: Bearer <token>
```

### 统一响应格式

#### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据
  }
}
```

#### 失败响应

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

#### 分页响应

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

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 1. 认证模块

### 1.1 微信小程序登录

**接口**: `POST /auth/login`

**说明**: 使用微信code换取token

**请求参数**:

```json
{
  "code": "wx_login_code"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录凭证 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "openid": "oxxxxxx",
      "nickname": "张三",
      "avatar": "https://xxx.com/avatar.png",
      "phone": "13800138000",
      "level": 1,
      "points": 100,
      "balance": "0.00"
    }
  }
}
```

---

### 1.2 获取用户信息

**接口**: `GET /user/info`

**说明**: 获取当前登录用户信息

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "nickname": "张三",
    "avatar": "https://xxx.com/avatar.png",
    "phone": "13800138000",
    "level": 1,
    "points": 100,
    "balance": "0.00"
  }
}
```

---

### 1.3 更新用户信息

**接口**: `PUT /user/info`

**说明**: 更新用户信息

**请求头**: 需要认证

**请求参数**:

```json
{
  "nickname": "李四",
  "avatar": "https://xxx.com/new-avatar.png",
  "phone": "13900139000"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

## 2. 商品模块

### 2.1 获取商品列表

**接口**: `GET /products`

**说明**: 获取商品列表（支持分页、筛选、搜索）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| category_id | number | 否 | 分类ID |
| is_hot | number | 否 | 是否热门（0/1） |
| is_new | number | 否 | 是否新品（0/1） |
| is_recommend | number | 否 | 是否推荐（0/1） |
| keyword | string | 否 | 搜索关键词 |
| status | number | 否 | 状态（0:下架 1:上架），默认1 |

**请求示例**:

```
GET /products?page=1&pageSize=10&category_id=1&is_hot=1
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "category_id": 1,
        "name": "薯片（原味）",
        "subtitle": "香脆可口",
        "cover": "https://xxx.com/product1.jpg",
        "price": "12.80",
        "original_price": "15.00",
        "stock": 100,
        "sales": 520,
        "is_hot": 1,
        "is_new": 0,
        "category": {
          "id": 1,
          "name": "膨化食品"
        },
        "images": [
          {
            "id": 1,
            "url": "https://xxx.com/detail1.jpg"
          }
        ]
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 10,
      "totalPages": 10
    }
  }
}
```

---

### 2.2 获取商品详情

**接口**: `GET /products/:id`

**说明**: 获取商品详情

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 商品ID |

**请求示例**:

```
GET /products/1
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "category_id": 1,
    "name": "薯片（原味）",
    "subtitle": "香脆可口",
    "cover": "https://xxx.com/product1.jpg",
    "description": "精选优质土豆，香脆可口...",
    "price": "12.80",
    "original_price": "15.00",
    "stock": 100,
    "sales": 520,
    "unit": "袋",
    "weight": "100",
    "tags": "[\"热销\",\"推荐\"]",
    "is_hot": 1,
    "is_new": 0,
    "category": {
      "id": 1,
      "name": "膨化食品"
    },
    "images": [
      {
        "id": 1,
        "url": "https://xxx.com/detail1.jpg"
      },
      {
        "id": 2,
        "url": "https://xxx.com/detail2.jpg"
      }
    ]
  }
}
```

---

## 3. 分类模块

### 3.1 获取分类列表

**接口**: `GET /categories`

**说明**: 获取商品分类列表

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "膨化食品",
      "icon": "https://xxx.com/icon1.png",
      "sort": 6,
      "status": 1
    },
    {
      "id": 2,
      "name": "糖果巧克力",
      "icon": "https://xxx.com/icon2.png",
      "sort": 5,
      "status": 1
    }
  ]
}
```

---

## 4. 购物车模块

### 4.1 获取购物车列表

**接口**: `GET /cart`

**说明**: 获取当前用户的购物车

**请求头**: 需要认证

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "product_id": 1,
      "quantity": 2,
      "selected": 1,
      "product": {
        "id": 1,
        "name": "薯片（原味）",
        "cover": "https://xxx.com/product1.jpg",
        "price": "12.80",
        "stock": 100,
        "status": 1
      }
    }
  ]
}
```

---

### 4.2 添加到购物车

**接口**: `POST /cart/add`

**说明**: 添加商品到购物车

**请求头**: 需要认证

**请求参数**:

```json
{
  "product_id": 1,
  "quantity": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_id | number | 是 | 商品ID |
| quantity | number | 是 | 数量 |

**响应示例**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": null
}
```

---

### 4.3 更新购物车商品数量

**接口**: `PUT /cart/:id`

**说明**: 更新购物车中商品的数量

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 购物车项ID |

**请求参数**:

```json
{
  "quantity": 3
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 4.4 删除购物车商品

**接口**: `DELETE /cart/:id`

**说明**: 删除购物车中的商品

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 购物车项ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 4.5 清空购物车

**接口**: `DELETE /cart/clear`

**说明**: 清空当前用户的购物车

**请求头**: 需要认证

**响应示例**:

```json
{
  "code": 200,
  "message": "清空成功",
  "data": null
}
```

---

### 4.6 获取购物车数量

**接口**: `GET /cart/count`

**说明**: 获取购物车商品数量

**请求头**: 需要认证

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 5
  }
}
```

---

## 5. 订单模块

### 5.1 创建订单

**接口**: `POST /orders`

**说明**: 创建订单

**请求头**: 需要认证

**请求参数**:

```json
{
  "product_items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "address_id": 1,
  "delivery_type": 1,
  "coupon_id": null,
  "points_used": 0,
  "remark": "尽快发货"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_items | array | 是 | 商品列表 |
| address_id | number | 是 | 收货地址ID |
| delivery_type | number | 是 | 配送方式（1:快递 2:自提） |
| coupon_id | number | 否 | 优惠券ID |
| points_used | number | 否 | 使用积分 |
| remark | string | 否 | 备注 |

**响应示例**:

```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "order_id": 1,
    "order_no": "202608120001",
    "pay_amount": "25.60"
  }
}
```

---

### 5.2 获取订单列表

**接口**: `GET /orders`

**说明**: 获取用户订单列表

**请求头**: 需要认证

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| status | number | 否 | 订单状态（0:待支付 1:待发货 2:待收货 3:已完成 4:已取消） |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "order_no": "202608120001",
        "total_amount": "25.60",
        "freight_amount": "0.00",
        "discount_amount": "0.00",
        "pay_amount": "25.60",
        "status": 0,
        "created_at": "2026-08-12 14:30:00",
        "items": [
          {
            "id": 1,
            "product_name": "薯片（原味）",
            "product_cover": "https://xxx.com/product1.jpg",
            "price": "12.80",
            "quantity": 2,
            "total_amount": "25.60"
          }
        ]
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
}
```

---

### 5.3 获取订单详情

**接口**: `GET /orders/:id`

**说明**: 获取订单详情

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 订单ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "order_no": "202608120001",
    "user_id": 1,
    "total_amount": "25.60",
    "freight_amount": "0.00",
    "discount_amount": "0.00",
    "pay_amount": "25.60",
    "pay_method": null,
    "pay_time": null,
    "delivery_type": 1,
    "consignee": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "address": "科技园",
    "status": 0,
    "remark": "尽快发货",
    "ship_time": null,
    "ship_no": null,
    "ship_company": null,
    "created_at": "2026-08-12 14:30:00",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "薯片（原味）",
        "product_cover": "https://xxx.com/product1.jpg",
        "price": "12.80",
        "quantity": 2,
        "total_amount": "25.60"
      }
    ]
  }
}
```

---

### 5.4 支付订单

**接口**: `POST /orders/:id/pay`

**说明**: 发起订单支付

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 订单ID |

**请求参数**:

```json
{
  "pay_method": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pay_method | number | 是 | 支付方式（1:微信支付 2:余额支付） |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "payment": {
      "timeStamp": "1692007200",
      "nonceStr": "abc123",
      "package": "prepay_id=wx12345",
      "signType": "RSA",
      "paySign": "signature"
    }
  }
}
```

---

### 5.5 取消订单

**接口**: `POST /orders/:id/cancel`

**说明**: 取消订单

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 订单ID |

**请求参数**:

```json
{
  "cancel_reason": "不想要了"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "取消成功",
  "data": null
}
```

---

### 5.6 确认收货

**接口**: `POST /orders/:id/confirm`

**说明**: 确认收货

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 订单ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "确认收货成功",
  "data": null
}
```

---

## 6. 收货地址模块

### 6.1 获取地址列表

**接口**: `GET /addresses`

**说明**: 获取用户收货地址列表

**请求头**: 需要认证

**响应示例**:

```json
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
      "address": "科技园",
      "is_default": 1
    }
  ]
}
```

---

### 6.2 获取地址详情

**接口**: `GET /addresses/:id`

**说明**: 获取地址详情

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 地址ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "consignee": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "address": "科技园",
    "is_default": 1
  }
}
```

---

### 6.3 创建地址

**接口**: `POST /addresses`

**说明**: 创建收货地址

**请求头**: 需要认证

**请求参数**:

```json
{
  "consignee": "张三",
  "phone": "13800138000",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "address": "科技园",
  "is_default": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| consignee | string | 是 | 收货人 |
| phone | string | 是 | 手机号 |
| province | string | 是 | 省份 |
| city | string | 是 | 城市 |
| district | string | 是 | 区县 |
| address | string | 是 | 详细地址 |
| is_default | number | 否 | 是否默认（0/1） |

**响应示例**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1
  }
}
```

---

### 6.4 更新地址

**接口**: `PUT /addresses/:id`

**说明**: 更新收货地址

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 地址ID |

**请求参数**: 同创建地址

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

### 6.5 删除地址

**接口**: `DELETE /addresses/:id`

**说明**: 删除收货地址

**请求头**: 需要认证

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 地址ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## 7. 优惠券模块

### 7.1 获取可领取优惠券

**接口**: `GET /coupons/available`

**说明**: 获取可领取的优惠券列表

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "满100减10",
      "type": 1,
      "discount_type": 1,
      "discount_value": "10.00",
      "min_amount": "100.00",
      "total_count": 1000,
      "receive_count": 500,
      "per_limit": 1,
      "start_time": "2026-08-01 00:00:00",
      "end_time": "2026-08-31 23:59:59",
      "status": 1
    }
  ]
}
```

---

### 7.2 领取优惠券

**接口**: `POST /coupons/receive`

**说明**: 领取优惠券

**请求头**: 需要认证

**请求参数**:

```json
{
  "coupon_id": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "领取成功",
  "data": null
}
```

---

### 7.3 我的优惠券

**接口**: `GET /coupons/my`

**说明**: 获取我的优惠券列表

**请求头**: 需要认证

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | number | 否 | 状态（0:未使用 1:已使用 2:已过期） |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "coupon_id": 1,
      "status": 0,
      "receive_time": "2026-08-12 14:00:00",
      "expire_time": "2026-08-31 23:59:59",
      "coupon": {
        "id": 1,
        "name": "满100减10",
        "discount_value": "10.00",
        "min_amount": "100.00"
      }
    }
  ]
}
```

---

## 8. 积分模块

### 8.1 积分记录

**接口**: `GET /points/logs`

**说明**: 获取积分变动记录

**请求头**: 需要认证

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "points": 10,
        "type": 2,
        "remark": "消费获得",
        "created_at": "2026-08-12 14:30:00"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pageSize": 10,
      "totalPages": 5
    }
  }
}
```

---

## 9. 轮播图模块

### 9.1 获取轮播图列表

**接口**: `GET /banners`

**说明**: 获取首页轮播图

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "新品上市",
      "image": "https://xxx.com/banner1.jpg",
      "link_type": 1,
      "link_value": "1",
      "sort": 1,
      "status": 1
    }
  ]
}
```

---

## 10. 管理员接口

### 10.1 管理员登录

**接口**: `POST /admin/login`

**说明**: 管理员登录

**请求参数**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "username": "admin",
      "nickname": "超级管理员",
      "role": 1
    }
  }
}
```

---

### 10.2 管理员商品管理

所有商品管理接口都需要管理员认证。

**创建商品**: `POST /products` （已在2.2节说明）

**更新商品**: `PUT /products/:id`

**删除商品**: `DELETE /products/:id`

**更新商品状态**: `PUT /products/:id/status`

---

## 11. 文件上传

### 11.1 上传图片

**接口**: `POST /upload`

**说明**: 上传图片文件

**请求头**: 需要认证

**Content-Type**: `multipart/form-data`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 图片文件 |

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://xxx.com/uploads/202608/image.jpg"
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 1001 | 参数验证失败 |
| 1002 | 数据不存在 |
| 1003 | 数据已存在 |
| 1004 | 库存不足 |
| 1005 | 优惠券已领完 |
| 1006 | 优惠券已过期 |
| 2001 | 登录失败 |
| 2002 | Token无效 |
| 2003 | Token过期 |
| 3001 | 订单创建失败 |
| 3002 | 订单状态异常 |
| 3003 | 支付失败 |
| 4001 | 文件上传失败 |
| 4002 | 文件格式不支持 |
| 4003 | 文件大小超限 |

---

## 附录

### 订单状态说明

| 状态值 | 说明 |
|--------|------|
| 0 | 待支付 |
| 1 | 待发货 |
| 2 | 待收货 |
| 3 | 已完成 |
| 4 | 已取消 |
| 5 | 退款中 |
| 6 | 已退款 |

### 积分类型说明

| 类型值 | 说明 |
|--------|------|
| 1 | 签到 |
| 2 | 消费 |
| 3 | 兑换 |
| 4 | 退款 |

### 会员等级说明

| 等级 | 名称 |
|------|------|
| 1 | 普通会员 |
| 2 | 银卡会员 |
| 3 | 金卡会员 |
| 4 | 铂金会员 |
| 5 | VIP会员 |

---

**文档版本**: v1.0  
**最后更新**: 2026-08-12  
**维护者**: 开发团队



## 10. 搜索模块

### 10.1 获取用户搜索历史

**接口**: `GET /api/search/history`  
**认证**: 需要  
**说明**: 获取当前用户的搜索历史记录

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | Number | 否 | 返回数量，默认10 |

#### 响应示例

```json
{
  "code": 200,
  "message": "获取搜索历史成功",
  "data": [
    {
      "id": 1,
      "keyword": "巧克力",
      "search_count": 5,
      "updated_at": "2026-08-20T10:30:00.000Z"
    }
  ]
}
```

---

### 10.2 保存搜索历史

**接口**: `POST /api/search/history`  
**认证**: 需要  
**说明**: 保存用户搜索记录，重复搜索会增加计数

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | String | 是 | 搜索关键词 |

#### 请求示例

```json
{
  "keyword": "巧克力"
}
```

#### 响应示例

```json
{
  "code": 200,
  "message": "保存搜索历史成功",
  "data": null
}
```

---

### 10.3 删除单条搜索历史

**接口**: `DELETE /api/search/history/:id`  
**认证**: 需要  
**说明**: 删除指定的搜索历史记录

#### 路径参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Number | 是 | 历史记录ID |

#### 响应示例

```json
{
  "code": 200,
  "message": "删除搜索历史成功",
  "data": null
}
```

---

### 10.4 清空所有搜索历史

**接口**: `DELETE /api/search/history`  
**认证**: 需要  
**说明**: 清空当前用户的所有搜索历史

#### 响应示例

```json
{
  "code": 200,
  "message": "清空搜索历史成功",
  "data": null
}
```

---

### 10.5 获取热门搜索词

**接口**: `GET /api/search/hot`  
**认证**: 不需要  
**说明**: 获取热门搜索关键词列表

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | Number | 否 | 返回数量，默认10 |

#### 响应示例

```json
{
  "code": 200,
  "message": "获取热门搜索成功",
  "data": [
    {
      "id": 1,
      "keyword": "巧克力",
      "search_count": 1350
    },
    {
      "id": 2,
      "keyword": "饼干",
      "search_count": 980
    }
  ]
}
```

---

### 10.6 搜索联想词

**接口**: `GET /api/search/suggest`  
**认证**: 不需要  
**说明**: 根据输入的关键词获取搜索联想词

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | String | 是 | 搜索关键词 |
| limit | Number | 否 | 返回数量，默认10 |

#### 请求示例

```
GET /api/search/suggest?keyword=巧克力&limit=5
```

#### 响应示例

```json
{
  "code": 200,
  "message": "获取搜索联想成功",
  "data": [
    "巧克力",
    "德芙丝滑牛奶巧克力",
    "M&M巧克力豆"
  ]
}
```

---

### 10.7 商品搜索（带排序）

**接口**: `GET /api/products`  
**认证**: 不需要  
**说明**: 搜索商品，支持多种排序方式

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | String | 否 | 搜索关键词 |
| category_id | Number | 否 | 分类ID |
| is_hot | Number | 否 | 是否热门（0/1） |
| is_new | Number | 否 | 是否新品（0/1） |
| sort_by | String | 否 | 排序方式：default-默认, price_asc-价格升序, price_desc-价格降序, sales-销量, rating-好评 |
| page | Number | 否 | 页码，默认1 |
| limit | Number | 否 | 每页数量，默认20 |

#### 请求示例

```
GET /api/products?keyword=巧克力&sort_by=sales&page=1&limit=10
```

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "德芙丝滑牛奶巧克力",
        "price": 39.90,
        "sales": 2345,
        "rating": 4.8,
        "cover": "https://example.com/image.jpg"
      }
    ],
    "total": 15
  }
}
```

---

## 搜索功能特性

### 搜索历史
- 自动保存用户搜索记录
- 重复搜索增加计数和更新时间
- 支持单独删除和清空所有
- 最多保存10条历史记录

### 热门搜索
- 全局统计搜索热度
- 支持手动排序（sort字段）
- 支持显示/隐藏控制
- 按sort和search_count排序

### 搜索联想
- 基于商品名称模糊匹配
- 结合热门搜索词
- 实时响应输入
- 去重并限制返回数量

### 搜索排序
- **综合排序**：按商品权重和创建时间
- **销量排序**：按销量从高到低
- **价格升序**：从低到高
- **价格降序**：从高到低
- **好评排序**：按评分从高到低


## 11. 积分兑换模块

### 11.1 获取积分商品列表

**接口**: `GET /api/points-exchange/products`  
**认证**: 不需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Number | 否 | 页码，默认1 |
| limit | Number | 否 | 每页数量，默认20 |
| status | Number | 否 | 状态（0-下架 1-上架），默认1 |

#### 响应示例

```json
{
  "code": 200,
  "message": "获取积分商品列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "三只松鼠大礼包",
        "cover": "https://example.com/snack-gift.jpg",
        "points": 1000,
        "stock": 50,
        "exchange_count": 12,
        "limit_per_user": 2
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

### 11.2 兑换积分商品

**接口**: `POST /api/points-exchange/exchange`  
**认证**: 需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| product_id | Number | 是 | 商品ID |
| quantity | Number | 否 | 兑换数量，默认1 |
| address_id | Number | 否 | 收货地址ID |

#### 响应示例

```json
{
  "code": 200,
  "message": "兑换成功",
  "data": {
    "exchange_id": 123,
    "remaining_points": 500
  }
}
```

### 11.3 获取兑换记录

**接口**: `GET /api/points-exchange/records`  
**认证**: 需要

---

## 12. 积分抽奖模块

### 12.1 获取抽奖活动列表

**接口**: `GET /api/lottery/activities`  
**认证**: 不需要

#### 响应示例

```json
{
  "code": 200,
  "message": "获取抽奖活动成功",
  "data": [
    {
      "id": 1,
      "name": "新年幸运大转盘",
      "cover": "https://example.com/lottery.jpg",
      "points_per_draw": 100,
      "start_time": "2026-01-01T00:00:00.000Z",
      "end_time": "2026-12-31T23:59:59.000Z",
      "daily_limit": 5,
      "prizes": [
        {
          "id": 1,
          "name": "50积分",
          "type": 1,
          "probability": "30.00"
        }
      ]
    }
  ]
}
```

### 12.2 参与抽奖

**接口**: `POST /api/lottery/draw/:activityId`  
**认证**: 需要

#### 响应示例

```json
{
  "code": 200,
  "message": "抽奖成功",
  "data": {
    "prize": {
      "id": 1,
      "name": "50积分",
      "type": 1,
      "value": "50"
    },
    "record_id": 456,
    "remaining_points": 900
  }
}
```

### 12.3 获取抽奖记录

**接口**: `GET /api/lottery/records`  
**认证**: 需要

---

## 13. 签到系统模块

### 13.1 签到

**接口**: `POST /api/check-in`  
**认证**: 需要

#### 响应示例

```json
{
  "code": 200,
  "message": "签到成功",
  "data": {
    "points": 10,
    "continuous_days": 3,
    "total_points": 1510,
    "is_continuous": true
  }
}
```

**连续签到奖励规则**:
- 第1天：5积分
- 第2天：10积分
- 第3天：15积分
- 第4天：20积分
- 第5天：25积分
- 第6天：30积分
- 第7天：50积分（连续签到奖励）

### 13.2 获取签到状态

**接口**: `GET /api/check-in/status`  
**认证**: 需要

#### 响应示例

```json
{
  "code": 200,
  "message": "获取签到状态成功",
  "data": {
    "is_checked_in": false,
    "continuous_days": 2,
    "month_check_in_count": 15,
    "next_reward": 15,
    "reward_config": {
      "1": 5,
      "2": 10,
      "3": 15,
      "4": 20,
      "5": 25,
      "6": 30,
      "7": 50
    }
  }
}
```

### 13.3 获取签到日历

**接口**: `GET /api/check-in/calendar/:year/:month`  
**认证**: 需要

---

## 14. 积分任务模块

### 14.1 获取任务列表

**接口**: `GET /api/points-task/list`  
**认证**: 需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | String | 否 | 任务类型：daily-每日 weekly-每周 once-一次性 |

#### 响应示例

```json
{
  "code": 200,
  "message": "获取任务列表成功",
  "data": [
    {
      "id": 1,
      "name": "每日签到",
      "description": "每天签到即可获得积分",
      "type": "daily",
      "task_key": "daily_check_in",
      "target_count": 1,
      "points_reward": 10,
      "user_progress": {
        "current_count": 0,
        "status": 0,
        "completed_at": null
      }
    }
  ]
}
```

**任务状态说明**:
- 0: 进行中
- 1: 已完成（可领取奖励）
- 2: 已领取奖励

### 14.2 更新任务进度

**接口**: `POST /api/points-task/progress`  
**认证**: 需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_key | String | 是 | 任务标识 |
| increment | Number | 否 | 进度增量，默认1 |

### 14.3 领取任务奖励

**接口**: `POST /api/points-task/claim/:taskId`  
**认证**: 需要

#### 响应示例

```json
{
  "code": 200,
  "message": "领取奖励成功",
  "data": {
    "points_reward": 10,
    "total_points": 1520
  }
}
```

### 14.4 获取任务概况

**接口**: `GET /api/points-task/summary`  
**认证**: 需要

#### 响应示例

```json
{
  "code": 200,
  "message": "获取任务概况成功",
  "data": {
    "today_completed": 3,
    "total_completed": 25,
    "pending_claim": 2
  }
}
```

---

## 积分系统特性总结

### 积分兑换商城
- ✅ 商品库存管理
- ✅ 每人限购数量控制
- ✅ 积分扣除和记录
- ✅ 兑换记录查询
- ✅ 发货状态追踪

### 积分抽奖
- ✅ 多活动支持
- ✅ 概率算法（支持不同概率配置）
- ✅ 每日抽奖次数限制
- ✅ 总抽奖次数限制
- ✅ 奖品库存管理
- ✅ 自动发放奖励（积分、优惠券）
- ✅ 抽奖记录查询

### 签到系统
- ✅ 连续签到奖励递增（1-7天）
- ✅ 断签后重新计算
- ✅ 签到状态查询
- ✅ 月度签到日历
- ✅ 签到记录统计

### 积分任务
- ✅ 三种任务类型（每日、每周、一次性）
- ✅ 任务进度追踪
- ✅ 自动重置机制（每日/每周任务）
- ✅ 任务完成奖励领取
- ✅ 任务概况统计

### 已内置的任务类型
- `daily_check_in`: 每日签到
- `first_order`: 完成首单
- `share_product`: 分享商品
- `review_product`: 评价商品
- `invite_friend`: 邀请好友
- `browse_product`: 浏览商品
- `add_to_cart`: 加入购物车


## 15. 积分排行榜模块

### 15.1 获取总积分排行榜

**接口**: `GET /api/points-ranking/total`  
**认证**: 不需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | Number | 否 | 返回数量，默认50 |

#### 响应示例

```json
{
  "code": 200,
  "message": "获取总积分排行榜成功",
  "data": [
    {
      "rank": 1,
      "id": 1,
      "phone": "13800138000",
      "nickname": "积分达人",
      "avatar": "https://example.com/avatar.jpg",
      "points": 5280
    }
  ]
}
```

### 15.2 获取今日积分增长排行榜

**接口**: `GET /api/points-ranking/daily`  
**认证**: 不需要

### 15.3 获取本周积分增长排行榜

**接口**: `GET /api/points-ranking/weekly`  
**认证**: 不需要

### 15.4 获取我的排名

**接口**: `GET /api/points-ranking/my-rank`  
**认证**: 需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | String | 否 | 排行榜类型：total-总榜 daily-日榜 weekly-周榜，默认total |

#### 响应示例

```json
{
  "code": 200,
  "message": "获取我的排名成功",
  "data": {
    "type": "total",
    "rank": 25,
    "points": 1580
  }
}
```

---

## 16. 积分转赠模块

### 16.1 转赠积分

**接口**: `POST /api/points-transfer/transfer`  
**认证**: 需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| to_user_id | Number | 是 | 接收用户ID |
| points | Number | 是 | 转赠积分数（最少10分） |
| message | String | 否 | 留言（最多200字） |

#### 转赠限制

- 最少转赠10积分
- 不能转赠给自己
- 每日最多转赠5次
- 每日最多转赠500积分

#### 响应示例

```json
{
  "code": 200,
  "message": "转赠成功",
  "data": {
    "transfer_id": 123,
    "remaining_points": 1470,
    "to_user": {
      "id": 2,
      "nickname": "好友昵称",
      "avatar": "https://example.com/avatar2.jpg"
    }
  }
}
```

### 16.2 获取转赠记录

**接口**: `GET /api/points-transfer/records`  
**认证**: 需要

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | String | 否 | 记录类型：all-全部 sent-转出 received-收到，默认all |
| page | Number | 否 | 页码，默认1 |
| limit | Number | 否 | 每页数量，默认20 |

### 16.3 获取今日转赠统计

**接口**: `GET /api/points-transfer/today-stats`  
**认证**: 需要

#### 响应示例

```json
{
  "code": 200,
  "message": "获取今日统计成功",
  "data": {
    "sent": {
      "count": 2,
      "points": 150,
      "remaining_count": 3,
      "remaining_points": 350
    },
    "received": {
      "count": 1,
      "points": 50
    }
  }
}
```

---

## 积分系统完整功能清单

### ✅ 已实现功能

#### 1. 积分商城
- 11件积分商品（零食礼包、数码产品、优惠券等）
- 库存管理和兑换次数统计
- 每人限购数量控制
- 兑换记录和发货追踪

#### 2. 积分抽奖
- 3个抽奖活动（新年转盘、周年庆、新用户专享）
- 多种奖品类型（积分、优惠券、实物、谢谢参与）
- 概率抽奖算法
- 每日/总抽奖次数限制
- 自动发放奖励
- 中奖记录查询

#### 3. 签到系统
- 连续签到奖励递增（5→10→15→20→25→30→50积分）
- 断签自动重置
- 签到状态实时查询
- 月度签到日历
- 签到记录统计

#### 4. 积分任务
- 7个内置任务（签到、首单、分享、评价、邀请、浏览、购物车）
- 三种任务类型（每日/每周/一次性）
- 任务进度自动追踪
- 任务完成奖励领取
- 任务概况统计
- **任务触发工具**（支持业务代码自动触发）

#### 5. 积分排行榜 🆕
- 总积分排行榜
- 今日积分增长排行榜
- 本周积分增长排行榜
- 个人排名查询

#### 6. 积分转赠 🆕
- 转赠给好友（最少10分）
- 每日限额控制（5次/500积分）
- 转赠记录查询
- 今日统计数据

### 🎯 使用场景

1. **用户获取积分**
   - 每日签到（连续签到奖励更多）
   - 完成任务（首单、评价、分享等）
   - 参与抽奖（有机会赢取积分）
   - 接受好友转赠

2. **用户消费积分**
   - 兑换实物商品
   - 兑换优惠券
   - 参与抽奖活动
   - 转赠给好友

3. **激励用户行为**
   - 签到培养用户习惯
   - 任务引导用户完成关键动作
   - 排行榜激发竞争意识
   - 转赠增加社交互动

### 📊 数据统计

- 商品数量：11件
- 抽奖活动：3个
- 抽奖奖品：19种
- 积分任务：7个
- API接口：30+个
