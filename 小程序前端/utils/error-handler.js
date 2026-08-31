// utils/error-handler.js - 统一错误处理

const logger = require('./logger')

/**
 * 错误码映射
 */
const ERROR_MESSAGE_MAP = {
  'NOT_LOGGED_IN': '请先登录',
  'UNAUTHORIZED': '登录已失效，请重新登录',
  'NETWORK_ERROR': '网络连接失败，请检查网络',
  'REQUEST_FAILED': '请求失败，请稍后重试',
  'TIMEOUT': '请求超时，请稍后重试',
  'SERVER_ERROR': '服务器错误，请稍后重试',
  'INVALID_PARAMS': '参数错误',
  'STOCK_INSUFFICIENT': '库存不足'
}

class ErrorHandler {
  /**
   * 处理错误
   * @param {Error} error 错误对象
   * @param {Object} options 配置项
   * @returns {String} 错误信息
   */
  handle(error, options = {}) {
    const {
      silent = false,        // 是否静默处理（不显示 toast）
      customMessage = null,  // 自定义错误消息
      duration = 2000        // toast 显示时长
    } = options

    logger.error('错误处理:', error)

    let message = customMessage || this.getErrorMessage(error)

    // 显示错误提示
    if (!silent) {
      wx.showToast({
        title: message,
        icon: 'none',
        duration
      })
    }

    // 特殊错误处理
    this.handleSpecialError(error)

    return message
  }

  /**
   * 获取错误信息
   */
  getErrorMessage(error) {
    // 自定义错误码
    if (error.code && ERROR_MESSAGE_MAP[error.code]) {
      return ERROR_MESSAGE_MAP[error.code]
    }

    // HTTP 状态码
    if (error.statusCode) {
      switch (error.statusCode) {
        case 401:
          return '登录已失效'
        case 403:
          return '没有权限'
        case 404:
          return '请求的资源不存在'
        case 500:
          return '服务器错误'
        default:
          return `网络错误 (${error.statusCode})`
      }
    }

    // 错误消息
    return error.message || '操作失败'
  }

  /**
   * 处理特殊错误
   */
  handleSpecialError(error) {
    // Token 失效，清除登录状态
    if (error.code === 'UNAUTHORIZED' || error.statusCode === 401) {
      const app = getApp()
      app.store.logout()

      // 延迟跳转到个人中心
      setTimeout(() => {
        wx.switchTab({ url: '/pages/user/user' })
      }, 1500)
    }
  }

  /**
   * 显示成功提示
   */
  showSuccess(message, duration = 1500) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration
    })
  }

  /**
   * 显示加载中
   */
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  }

  /**
   * 隐藏加载
   */
  hideLoading() {
    wx.hideLoading()
  }

  /**
   * 显示确认框
   */
  confirm(options = {}) {
    const {
      title = '提示',
      content = '',
      confirmText = '确定',
      cancelText = '取消',
      confirmColor = '#FF6B00'
    } = options

    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        confirmText,
        cancelText,
        confirmColor,
        success: (res) => {
          resolve(res.confirm)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  }
}

module.exports = new ErrorHandler()