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

