// utils/util.js - 工具函数

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {String} format 格式 如：YYYY-MM-DD HH:mm:ss
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return format
    .replace('YYYY', year)
    .replace('MM', padZero(month))
    .replace('DD', padZero(day))
    .replace('HH', padZero(hour))
    .replace('mm', padZero(minute))
    .replace('ss', padZero(second))
}

/**
 * 补零
 */
function padZero(num) {
  return num < 10 ? '0' + num : num
}

/**
 * 格式化价格
 * @param {Number} price 价格
 * @param {Number} decimal 小数位数
 */
function formatPrice(price, decimal = 2) {
  return parseFloat(price).toFixed(decimal)
}

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间
 */
function debounce(fn, delay = 500) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间
 */
function throttle(fn, delay = 500) {
  let timer = null
  return function(...args) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 显示成功提示
 */
function showSuccess(title, duration = 2000) {
  wx.showToast({
    title,
    icon: 'success',
    duration
  })
}

/**
 * 显示失败提示
 */
function showError(title, duration = 2000) {
  wx.showToast({
    title,
    icon: 'none',
    duration
  })
}

/**
 * 显示加载提示
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading()
}

/**
 * 确认对话框
 */
function showConfirm(content, title = '提示') {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          resolve()
        } else {
          reject()
        }
      }
    })
  })
}

/**
 * 跳转页面（带登录检查）
 */
function navigateTo(url, needAuth = false) {
  if (needAuth) {
    const app = getApp()
    if (!app.globalData.token) {
      showError('请先登录')
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/user/user'
        })
      }, 1500)
      return
    }
  }
  wx.navigateTo({ url })
}

/**
 * 生成订单号
 */
function generateOrderNo() {
  const now = new Date()
  const year = now.getFullYear()
  const month = padZero(now.getMonth() + 1)
  const day = padZero(now.getDate())
  const hour = padZero(now.getHours())
  const minute = padZero(now.getMinutes())
  const second = padZero(now.getSeconds())
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `${year}${month}${day}${hour}${minute}${second}${random}`
}

/**
 * 深拷贝
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  const cloneObj = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key])
    }
  }
  return cloneObj
}

/**
 * 手机号验证
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 计算距离（km）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = (lat1 * Math.PI) / 180
  const radLat2 = (lat2 * Math.PI) / 180
  const a = radLat1 - radLat2
  const b = (lng1 * Math.PI) / 180 - (lng2 * Math.PI) / 180
  let distance = 2 * Math.asin(Math.sqrt(
    Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
  ))
  distance = distance * 6378.137 // 地球半径
  distance = Math.round(distance * 10000) / 10000
  return distance
}

/**
 * 获取订单状态文本
 */
function getOrderStatusText(status) {
  const statusMap = {
    0: '待支付',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消',
    5: '退款中',
    6: '已退款'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取订单状态颜色
 */
function getOrderStatusColor(status) {
  const colorMap = {
    0: '#FF6B00',  // 待支付 - 橙色
    1: '#52C41A',  // 待发货 - 绿色
    2: '#1890FF',  // 待收货 - 蓝色
    3: '#999',     // 已完成 - 灰色
    4: '#999',     // 已取消 - 灰色
    5: '#FAAD14',  // 退款中 - 黄色
    6: '#999'      // 已退款 - 灰色
  }
  return colorMap[status] || '#999'
}

module.exports = {
  formatTime,
  formatPrice,
  debounce,
  throttle,
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  showConfirm,
  navigateTo,
  generateOrderNo,
  deepClone,
  validatePhone,
  calculateDistance,
  getOrderStatusText,
  getOrderStatusColor
}
