// utils/format.js - 格式化工具函数

/**
 * 格式化价格
 */
function formatPrice(price) {
  return parseFloat(price).toFixed(2)
}

/**
 * 格式化时间
 */
function formatTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * 格式化日期
 */
function formatDate(date) {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * 格式化订单状态
 */
function formatOrderStatus(status) {
  const statusMap = {
    1: '待付款',
    2: '待发货',
    3: '待收货',
    4: '已完成',
    5: '已取消',
    6: '已退款'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 格式化订单状态类型（用于样式）
 */
function formatOrderStatusType(status) {
  const typeMap = {
    1: 'warning',  // 待付款 - 橙色
    2: 'primary',  // 待发货 - 蓝色
    3: 'info',     // 待收货 - 灰色
    4: 'success',  // 已完成 - 绿色
    5: 'default',  // 已取消 - 灰色
    6: 'danger'    // 已退款 - 红色
  }
  return typeMap[status] || 'default'
}

/**
 * 格式化手机号（隐藏中间4位）
 */
function formatPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化地址
 */
function formatAddress(address) {
  if (!address) return ''
  return `${address.province} ${address.city} ${address.district} ${address.detail}`
}

/**
 * 格式化收货人信息
 */
function formatConsignee(address) {
  if (!address) return ''
  return `${address.consignee} ${formatPhone(address.phone)}`
}

/**
 * 计算相对时间（多久之前）
 */
function formatRelativeTime(date) {
  if (!date) return ''
  
  const now = new Date().getTime()
  const time = new Date(date).getTime()
  const diff = now - time
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 12 * month
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 格式化数字（千位分隔符）
 */
function formatNumber(num) {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

module.exports = {
  formatPrice,
  formatTime,
  formatDate,
  formatOrderStatus,
  formatOrderStatusType,
  formatPhone,
  formatAddress,
  formatConsignee,
  formatRelativeTime,
  formatNumber
}
