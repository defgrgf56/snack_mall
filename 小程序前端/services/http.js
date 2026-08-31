// services/http.js - 统一的 HTTP 请求封装

import store from '../store/index'
import { API_CONFIG, ERROR_CODE } from '../constants/index'

/**
 * HTTP 请求类
 */
class Http {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.pendingRequests = new Map() // 用于请求去重
  }

  /**
   * 设置 API 基础地址
   */
  setBaseURL(url) {
    this.baseURL = url
  }

  /**
   * 生成请求唯一标识
   */
  getRequestKey(url, method, data) {
    return `${method}:${url}:${JSON.stringify(data)}`
  }

  /**
   * 统一请求方法
   */
  request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      needAuth = true,
      showLoading = false,
      loadingText = '加载中...',
      enableRequestDedupe = true, // 是否启用请求去重
    } = options

    return new Promise((resolve, reject) => {
      // 请求去重
      const requestKey = this.getRequestKey(url, method, data)
      if (enableRequestDedupe && this.pendingRequests.has(requestKey)) {
        console.log('请求去重:', requestKey)
        return this.pendingRequests.get(requestKey).then(resolve).catch(reject)
      }

      // 检查登录状态
      if (needAuth && !store.isLoggedIn()) {
        const error = new Error('请先登录')
        error.code = ERROR_CODE.NOT_LOGGED_IN
        reject(error)
        return
      }

      // 显示加载提示
      if (showLoading) {
        wx.showLoading({ title: loadingText, mask: true })
      }

      // 构建请求头
      const header = {
        'Content-Type': 'application/json',
      }

      // 添加 Token
      const token = store.getToken()
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      const fullUrl = `${this.baseURL}${url}`
      
      console.log(`[HTTP ${method}] ${fullUrl}`, data)

      // 创建请求 Promise
      const requestPromise = new Promise((resolve, reject) => {
        wx.request({
          url: fullUrl,
          method,
          data,
          header,
          timeout: this.timeout,
          success: (res) => {
            if (showLoading) {
              wx.hideLoading()
            }

            console.log(`[HTTP ${method}] Response:`, res.statusCode, res.data)

            // HTTP 状态码检查
            if (res.statusCode !== 200) {
              const error = new Error(`网络错误 (${res.statusCode})`)
              error.code = ERROR_CODE.NETWORK_ERROR
              error.statusCode = res.statusCode
              reject(error)
              return
            }

            // 业务状态码检查
            if (res.data.code === ERROR_CODE.SUCCESS) {
              resolve(res.data.data)
            } else if (res.data.code === ERROR_CODE.UNAUTHORIZED) {
              // Token 失效，统一处理
              this.handleUnauthorized(res.data.message)
              const error = new Error(res.data.message || '登录已失效')
              error.code = ERROR_CODE.UNAUTHORIZED
              reject(error)
            } else {
              // 其他业务错误
              const error = new Error(res.data.message || '请求失败')
              error.code = res.data.code
              reject(error)
            }
          },
          fail: (err) => {
            if (showLoading) {
              wx.hideLoading()
            }

            console.error(`[HTTP ${method}] Failed:`, err)

            const error = new Error(err.errMsg || '网络连接失败')
            error.code = ERROR_CODE.REQUEST_FAILED
            error.originalError = err
            reject(error)
          },
        })
      })

      // 保存到待处理请求
      if (enableRequestDedupe) {
        this.pendingRequests.set(requestKey, requestPromise)
        
        // 请求完成后清理
        requestPromise.finally(() => {
          this.pendingRequests.delete(requestKey)
        })
      }

      requestPromise.then(resolve).catch(reject)
    })
  }

  /**
   * 统一处理 401 未授权
   */
  handleUnauthorized(message) {
    // 清空登录状态
    store.clear()
    
    // 更新 TabBar
    const pages = getCurrentPages()
    pages.forEach(page => {
      if (typeof page.getTabBar === 'function' && page.getTabBar()) {
        page.getTabBar().setData({ cartCount: 0 })
      }
    })

    // 提示用户
    wx.showToast({
      title: message || '登录已失效',
      icon: 'none',
      duration: 2000,
    })

    // 跳转到用户页面
    setTimeout(() => {
      wx.switchTab({ url: '/pages/user/user' })
    }, 2000)
  }

  /**
   * GET 请求
   */
  get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options,
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
      ...options,
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
      ...options,
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
      ...options,
    })
  }

  /**
   * 文件上传
   */
  upload(filePath, options = {}) {
    const {
      name = 'file',
      formData = {},
      showLoading = true,
    } = options

    return new Promise((resolve, reject) => {
      if (showLoading) {
        wx.showLoading({ title: '上传中...', mask: true })
      }

      const token = store.getToken()
      if (!token) {
        if (showLoading) {
          wx.hideLoading()
        }
        const error = new Error('请先登录')
        error.code = ERROR_CODE.NOT_LOGGED_IN
        reject(error)
        return
      }

      wx.uploadFile({
        url: `${this.baseURL}/upload`,
        filePath,
        name,
        formData,
        header: {
          'Authorization': `Bearer ${token}`,
        },
        success: (res) => {
          if (showLoading) {
            wx.hideLoading()
          }

          try {
            const data = JSON.parse(res.data)
            if (data.code === ERROR_CODE.SUCCESS) {
              resolve(data.data)
            } else {
              const error = new Error(data.message || '上传失败')
              error.code = data.code
              reject(error)
            }
          } catch (error) {
            reject(new Error('解析上传结果失败'))
          }
        },
        fail: (err) => {
          if (showLoading) {
            wx.hideLoading()
          }
          const error = new Error(err.errMsg || '上传失败')
          error.code = ERROR_CODE.REQUEST_FAILED
          reject(error)
        },
      })
    })
  }
}

// 创建单例
const http = new Http()

export default http