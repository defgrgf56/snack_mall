// utils/diagnostic.js - 诊断工具

const { API_BASE_URL } = require('../config/env')
const logger = require('./logger')

class Diagnostic {
  /**
   * 运行完整诊断
   */
  static async runFullDiagnostic() {
    const results = {
      backend: await this.checkBackend(),
      network: await this.checkNetwork(),
      storage: this.checkStorage(),
      config: this.checkConfig()
    }

    logger.info('诊断结果:', results)
    return results
  }

  /**
   * 检查后端服务
   */
  static checkBackend() {
    return new Promise((resolve) => {
      wx.request({
        url: `${API_BASE_URL}`,
        method: 'GET',
        timeout: 5000,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve({
              status: 'success',
              message: '后端服务运行正常',
              data: res.data
            })
          } else {
            resolve({
              status: 'error',
              message: `后端返回异常状态码: ${res.statusCode}`,
              statusCode: res.statusCode
            })
          }
        },
        fail: (err) => {
          resolve({
            status: 'error',
            message: '后端服务连接失败',
            error: err.errMsg,
            suggestion: '请检查后端服务是否启动（npm run dev）'
          })
        }
      })
    })
  }

  /**
   * 检查网络连接
   */
  static checkNetwork() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          resolve({
            status: res.networkType !== 'none' ? 'success' : 'error',
            message: `网络类型: ${res.networkType}`,
            networkType: res.networkType
          })
        },
        fail: () => {
          resolve({
            status: 'error',
            message: '无法获取网络信息'
          })
        }
      })
    })
  }

  /**
   * 检查本地存储
   */
  static checkStorage() {
    try {
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')

      return {
        status: 'success',
        hasToken: !!token,
        hasUserInfo: !!userInfo,
        message: token ? '已登录' : '未登录'
      }
    } catch (error) {
      return {
        status: 'error',
        message: '读取本地存储失败',
        error: error.message
      }
    }
  }

  /**
   * 检查配置
   */
  static checkConfig() {
    const app = getApp()
    
    return {
      status: 'success',
      apiBaseUrl: API_BASE_URL,
      hasStore: !!app.store,
      hasApi: !!app.api,
      message: '配置正常'
    }
  }

  /**
   * 测试单个接口
   */
  static testApi(url, method = 'GET', needAuth = false) {
    return new Promise((resolve) => {
      const app = getApp()
      const header = {
        'Content-Type': 'application/json'
      }

      if (needAuth) {
        const token = app.store.getToken()
        if (!token) {
          resolve({
            status: 'error',
            message: '需要登录但未找到 token'
          })
          return
        }
        header['Authorization'] = `Bearer ${token}`
      }

      const startTime = Date.now()

      wx.request({
        url: `${API_BASE_URL}${url}`,
        method,
        header,
        timeout: 10000,
        success: (res) => {
          const endTime = Date.now()
          resolve({
            status: res.statusCode === 200 ? 'success' : 'error',
            statusCode: res.statusCode,
            data: res.data,
            time: endTime - startTime,
            message: `请求耗时 ${endTime - startTime}ms`
          })
        },
        fail: (err) => {
          resolve({
            status: 'error',
            message: '请求失败',
            error: err.errMsg
          })
        }
      })
    })
  }

  /**
   * 生成诊断报告
   */
  static async generateReport() {
    const results = await this.runFullDiagnostic()
    
    // 测试关键接口
    const apiTests = {
      banners: await this.testApi('/banners'),
      categories: await this.testApi('/categories'),
      products: await this.testApi('/products')
    }

    const report = {
      timestamp: new Date().toLocaleString(),
      results,
      apiTests,
      summary: this.generateSummary(results, apiTests)
    }

    logger.info('诊断报告:', report)
    return report
  }

  /**
   * 生成摘要
   */
  static generateSummary(results, apiTests) {
    const issues = []
    const suggestions = []

    // 检查后端
    if (results.backend.status === 'error') {
      issues.push('后端服务异常')
      suggestions.push('启动后端服务: npm run dev')
    }

    // 检查网络
    if (results.network.status === 'error' || results.network.networkType === 'none') {
      issues.push('网络连接异常')
      suggestions.push('检查网络连接')
    }

    // 检查接口
    Object.entries(apiTests).forEach(([name, result]) => {
      if (result.status === 'error') {
        issues.push(`${name} 接口异常`)
      } else if (result.data && result.data.data && result.data.data.length === 0) {
        issues.push(`${name} 数据为空`)
        suggestions.push('运行数据库迁移脚本初始化测试数据')
      }
    })

    return {
      healthy: issues.length === 0,
      issues,
      suggestions
    }
  }

  /**
   * 显示诊断结果
   */
  static async showDiagnosticModal() {
    const report = await this.generateReport()
    const { summary } = report

    let content = ''
    
    if (summary.healthy) {
      content = '✅ 所有检查通过\n系统运行正常'
    } else {
      content = '❌ 发现以下问题:\n\n'
      summary.issues.forEach(issue => {
        content += `• ${issue}\n`
      })
      content += '\n建议:\n'
      summary.suggestions.forEach(suggestion => {
        content += `• ${suggestion}\n`
      })
    }

    wx.showModal({
      title: '系统诊断',
      content,
      showCancel: false,
      confirmText: '知道了'
    })

    return report
  }
}

module.exports = Diagnostic