// utils/request.js - 网络请求封装
const app = getApp()

/**
 * 封装的请求方法
 * @param {String} url 请求地址
 * @param {String} method 请求方法
 * @param {Object} data 请求数据
 * @param {Boolean} needAuth 是否需要登录
 */
function request(url, method = 'GET', data = {}, needAuth = true) {
  return new Promise((resolve, reject) => {
    // 不显示loading，避免频繁弹窗
    // wx.showLoading({
    //   title: '加载中...',
    //   mask: true
    // })

    const header = {
      'Content-Type': 'application/json'
    }

    const token = app.globalData.token || wx.getStorageSync('token')

    // needAuth=true 时必须有 token；有 token 时始终带上
    if (needAuth && !token) {
      console.log('未登录，跳过认证接口')
      const error = new Error('未登录')
      error.code = 'NOT_LOGGED_IN'
      reject(error)
      return
    }
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    const fullUrl = `${app.globalData.apiBase}${url}`
    console.log(`发起请求: ${method} ${fullUrl}`, data)
    console.log(`API Base: ${app.globalData.apiBase}`)

    wx.request({
      url: fullUrl,
      method,
      data,
      header,
      success: (res) => {
        // wx.hideLoading()
        console.log(`请求成功: ${url}`, res.statusCode, res.data)

        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data)
          } else if (res.data.code === 401) {
            // token失效
            app.logout()
            console.log('登录已失效')
            const error = new Error(res.data.message || '登录已失效')
            error.code = 'UNAUTHORIZED'
            reject(error)
          } else {
            console.log('请求失败:', res.data.message)
            const error = new Error(res.data.message || '请求失败')
            error.code = res.data.code
            reject(error)
          }
        } else {
          console.error('❌ 网络错误:', res.statusCode)
          const error = new Error(`网络错误 (${res.statusCode})`)
          error.code = 'NETWORK_ERROR'
          error.statusCode = res.statusCode
          reject(error)
        }
      },
      fail: (err) => {
        // wx.hideLoading()
        console.error('❌ 请求失败:', url, err)
        console.error('❌ 完整URL:', fullUrl)
        console.error('❌ 错误详情:', JSON.stringify(err))
        
        wx.showModal({
          title: '网络请求失败',
          content: `URL: ${fullUrl}\n错误: ${err.errMsg}`,
          showCancel: false
        })
        
        const error = new Error(err.errMsg || '网络连接失败')
        error.code = 'REQUEST_FAILED'
        error.originalError = err
        reject(error)
      }
    })
  })
}

/**
 * GET请求
 */
function get(url, data = {}, needAuth = true) {
  return request(url, 'GET', data, needAuth)
}

/**
 * POST请求
 */
function post(url, data = {}, needAuth = true) {
  return request(url, 'POST', data, needAuth)
}

/**
 * PUT请求
 */
function put(url, data = {}, needAuth = true) {
  return request(url, 'PUT', data, needAuth)
}

/**
 * DELETE请求
 */
function del(url, data = {}, needAuth = true) {
  return request(url, 'DELETE', data, needAuth)
}

/**
 * 文件上传
 */
function uploadFile(filePath, name = 'file') {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '上传中...',
      mask: true
    })

    const token = app.globalData.token || wx.getStorageSync('token')
    
    wx.uploadFile({
      url: `${app.globalData.apiBase}/upload`,
      filePath,
      name,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        wx.hideLoading()
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data.data)
        } else {
          wx.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          })
          reject(data.message)
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile
}
