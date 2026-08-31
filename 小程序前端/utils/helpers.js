// utils/helpers.js - 实用工具函数

/**
 * 格式化价格
 */
export function formatPrice(price) {
  return parseFloat(price || 0).toFixed(2)
}

/**
 * 格式化时间
 */
export function formatTime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  const now = Date.now()
  const date = new Date(timestamp).getTime()
  const diff = now - date
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatTime(timestamp, 'YYYY-MM-DD')
  }
}

/**
 * 防抖函数
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime > delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  
  const cloned = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 生成唯一 ID
 */
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 隐藏手机号中间4位
 */
export function maskPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 隐藏身份证号中间部分
 */
export function maskIdCard(idCard) {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

/**
 * 验证手机号
 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证身份证号
 */
export function validateIdCard(idCard) {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)
}

/**
 * 获取图片完整URL
 */
export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 假设后端静态文件路径
  return `http://localhost:3000${path}`
}

/**
 * 数组分组
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * 数组去重
 */
export function unique(array, key) {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * 计算购物车总价
 */
export function calculateCartTotal(items) {
  return items.reduce((total, item) => {
    if (item.selected !== false) {
      return total + parseFloat(item.product.price) * item.quantity
    }
    return total
  }, 0)
}

/**
 * 复制到剪贴板
 */
export function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
        resolve()
      },
      fail: reject
    })
  })
}

/**
 * 保存图片到相册
 */
export function saveImageToAlbum(url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存到相册', icon: 'success' })
            resolve()
          },
          fail: reject
        })
      },
      fail: reject
    })
  })
}

/**
 * 预览图片
 */
export function previewImage(current, urls) {
  wx.previewImage({
    current,
    urls: Array.isArray(urls) ? urls : [urls]
  })
}

/**
 * 拨打电话
 */
export function makePhoneCall(phoneNumber) {
  wx.makePhoneCall({ phoneNumber })
}

/**
 * 获取地理位置
 */
export function getLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 显示 Loading
 */
export function showLoading(title = '加载中...', mask = true) {
  wx.showLoading({ title, mask })
}

/**
 * 隐藏 Loading
 */
export function hideLoading() {
  wx.hideLoading()
}

/**
 * 显示成功提示
 */
export function showSuccess(title = '操作成功', duration = 1500) {
  wx.showToast({ title, icon: 'success', duration })
}

/**
 * 显示失败提示
 */
export function showError(title = '操作失败', duration = 2000) {
  wx.showToast({ title, icon: 'none', duration })
}

/**
 * 显示确认对话框
 */
export function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm)
    })
  })
}