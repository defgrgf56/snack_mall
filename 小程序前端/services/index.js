// services/index.js - 统一导出所有服务

import authService from './auth.service'
import productService from './product.service'
import cartService from './cart.service'
import orderService from './order.service'
import http from './http'

/**
 * 统一导出所有 API 服务
 */
export default {
  auth: authService,
  product: productService,
  cart: cartService,
  order: orderService,
  http, // 导出 http 实例供特殊场景使用
}

// 也支持解构导入
export {
  authService,
  productService,
  cartService,
  orderService,
  http,
}