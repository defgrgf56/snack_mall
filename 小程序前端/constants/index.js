// constants/index.js - 统一常量配置

/**
 * API 状态码
 */
export const CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

/**
 * 订单状态
 */
export const ORDER_STATUS = {
  PENDING_PAYMENT: 1,  // 待付款
  PENDING_DELIVERY: 2, // 待发货
  PENDING_RECEIVE: 3,  // 待收货
  COMPLETED: 4,        // 已完成
  CANCELLED: 5,        // 已取消
  REFUNDED: 6          // 已退款
}

export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING_PAYMENT]: '待付款',
  [ORDER_STATUS.PENDING_DELIVERY]: '待发货',
  [ORDER_STATUS.PENDING_RECEIVE]: '待收货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
}

/**
 * 轮播图链接类型
 */
export const BANNER_LINK_TYPE = {
  PRODUCT: 1,   // 商品
  CATEGORY: 2,  // 分类
  EXTERNAL: 3   // 外链
}

/**
 * 优惠券状态
 */
export const COUPON_STATUS = {
  AVAILABLE: 0,  // 未使用
  USED: 1,       // 已使用
  EXPIRED: 2     // 已过期
}

/**
 * 主题配置
 */
export const THEME = {
  PRIMARY_COLOR: '#FF6B00',
  SUCCESS_COLOR: '#52c41a',
  WARNING_COLOR: '#faad14',
  ERROR_COLOR: '#ff4d4f',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#999999',
  BORDER_COLOR: '#e5e5e5',
  BG_COLOR: '#f5f5f5'
}

/**
 * 分页配置
 */
export const PAGE_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
}

/**
 * 请求超时配置 (毫秒)
 */
export const TIMEOUT = {
  DEFAULT: 10000,
  UPLOAD: 30000
}

/**
 * 积分兑换状态
 */
export const EXCHANGE_STATUS = {
  0: { text: '待发货', color: '#FF6B00' },
  1: { text: '已发货', color: '#1989fa' },
  2: { text: '已完成', color: '#07c160' },
  3: { text: '已取消', color: '#999' }
}

/**
 * 本地存储 Key
 */
export const STORAGE_KEY = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SEARCH_HISTORY: 'searchHistory'
}