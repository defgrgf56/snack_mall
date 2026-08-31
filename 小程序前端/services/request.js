// services/request.js - 统一网络请求服务

const { API_BASE_URL } = require('../config/env')
const { CODE } = require('../constants/index')
const logger = require('../utils/logger')
const errorHandler = require('../utils/error-handler')

class Request {
  constructor() {
    this.baseURL = API_BASE_URL
    this.timeout = 10000
    this.requestQueue = new Map() // 请求队列，用于去重
  }

  /**
   * 发起请求
   */
  async request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      needAuth = true,
      silent = false,  // 静默处理错误
      loading = false, // 是否显示 loading
      loadingText = '加载中...'
    } = options

    // 请求去重
    const requestKey = this.getRequestKey(method, url, data)
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)
    }

    // 显示 loading
    if (loading) {
      errorHandler.showLoading(loadingText)
    }

    const requestPromise = this._doRequest({
      url,
      method,
      data,
      needAuth,
      silent
    }).finally(() => {
      // 请求完成后从队列移除
      this.requestQueue.delete(requestKey)
      if (loading) {
        errorHandler.hideLoading()
      }
    })

    // 加入请求队列
    this.requestQueue.set(requestKey, requestPromise)

    return requestPromise
  }

  /**
   * 执行实际请求
   */
  _doRequest({ url, method, data, needAuth, silent }) {
    return new Promise((resolve, reject) => {
      const app = getApp()
      
      // 安全检查：确保 app 和 store 已初始化
      if (!app || !app.store) {
        const error = new Error('应用未初始化')
        error.code = 'APP_NOT_READY'
        console.error('Request error: app or app.store is undefined')
        reject(error)
        return
      }
      
      const header = {
        'Content-Type': 'application/json'
      }

      // 获取 token
      const token = app.store.getToken()

      // 需要认证但没有 token
      if (needAuth && !token) {
        const error = new Error('未登录')
        error.code = 'NOT_LOGGED_IN'
        errorHandler.handle(error, { silent })
        reject(error)
        return
      }

      // 添加 token
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      const fullUrl = `${this.baseURL}${url}`

      wx.request({
        url: fullUrl,
        method,
        data,
        header,
        timeout: this.timeout,
        success: (res) => {
          logger.api(method, url, data, res.data)

          if (res.statusCode === 200) {
            if (res.data.code === CODE.SUCCESS) {
              resolve(res.data.data)
            } else if (res.data.code === CODE.UNAUTHORIZED) {
              // Token 失效
              const error = new Error(res.data.message || '登录已失效')
              error.code = 'UNAUTHORIZED'
              errorHandler.handle(error, { silent })
              reject(error)
            } else {
              // 业务错误
              const error = new Error(res.data.message || '请求失败')
              error.code = res.data.code
              errorHandler.handle(error, { silent })
              reject(error)
            }
          } else {
            // HTTP 错误
            const error = new Error(`网络错误 (${res.statusCode})`)
            error.code = 'NETWORK_ERROR'
            error.statusCode = res.statusCode
            errorHandler.handle(error, { silent })
            reject(error)
          }
        },
        fail: (err) => {
          logger.error('请求失败:', err)
          
          const error = new Error(err.errMsg || '网络连接失败')
          error.code = 'REQUEST_FAILED'
          error.originalError = err
          errorHandler.handle(error, { silent })
          reject(error)
        }
      })
    })
  }

  /**
   * 生成请求唯一键
   */
  getRequestKey(method, url, data) {
    return `${method}:${url}:${JSON.stringify(data)}`
  }

  /**
   * GET 请求
   */
  get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    })
  }

  /**
   * POST 请求
   */
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  /**
   * PUT 请求
   */
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  /**
   * DELETE 请求
   */
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }

  /**
   * 文件上传
   */
  upload(filePath, options = {}) {
    const {
      name = 'file',
      formData = {},
      loadingText = '上传中...'
    } = options

    return new Promise((resolve, reject) => {
      const app = getApp()
      const token = app.store.getToken()

      errorHandler.showLoading(loadingText)

      wx.uploadFile({
        url: `${this.baseURL}/upload`,
        filePath,
        name,
        formData,
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          errorHandler.hideLoading()
          
          const data = JSON.parse(res.data)
          if (data.code === CODE.SUCCESS) {
            resolve(data.data)
          } else {
            const error = new Error(data.message || '上传失败')
            errorHandler.handle(error)
            reject(error)
          }
        },
        fail: (err) => {
          errorHandler.hideLoading()
          const error = new Error('上传失败')
          errorHandler.handle(error)
          reject(error)
        }
      })
    })
  }
}

module.exports = new Request()