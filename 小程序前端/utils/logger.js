// utils/logger.js - 统一日志系统

const { IS_DEV } = require('../config/env')

class Logger {
  constructor() {
    this.enabled = IS_DEV
  }

  log(...args) {
    if (this.enabled) {
      console.log('[LOG]', ...args)
    }
  }

  info(...args) {
    if (this.enabled) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args) {
    console.warn('[WARN]', ...args)
  }

  error(...args) {
    console.error('[ERROR]', ...args)
    // 可以在这里上报到监控平台
  }

  api(method, url, data, response) {
    if (this.enabled) {
      console.group(`[API] ${method} ${url}`)
      console.log('请求:', data)
      console.log('响应:', response)
      console.groupEnd()
    }
  }
}

module.exports = new Logger()