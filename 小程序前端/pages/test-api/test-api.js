// pages/test-api/test-api.js - 重构后的API测试页面
const createPageMixin = require('../../mixins/page-mixin')
const envConfig = require('../../config/env')

const app = getApp()

Page(createPageMixin({
  data: {
    testResults: [],
    backendStatus: '未检测',
    apiUrl: ''
  },

  onLoad() {
    // 在 onLoad 时获取 API 地址，确保模块已完全加载
    const apiUrl = envConfig.apiConfig ? envConfig.apiConfig.baseUrl : envConfig.API_BASE_URL
    this.setData({ apiUrl })
    this.checkBackend()
  },

  /**
   * 检查后端服务
   */
  async checkBackend() {
    this.addResult('正在检查后端服务...')

    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${this.data.apiUrl}/categories`,
          method: 'GET',
          success: resolve,
          fail: reject,
          timeout: 5000
        })
      })

      if (res.statusCode === 200) {
        this.setData({ backendStatus: '✅ 运行中' })
        this.addResult('✅ 后端服务正常运行')
      } else {
        this.setData({ backendStatus: '❌ 异常' })
        this.addResult(`❌ 后端返回异常状态: ${res.statusCode}`)
      }
    } catch (error) {
      this.setData({ backendStatus: '❌ 未启动' })
      this.addResult(`❌ 后端服务连接失败: ${error.errMsg || error}`)
      this.addResult('💡 请确保后端服务已启动 (npm run dev)')
    }
  },

  /**
   * 测试获取商品分类
   */
  async testCategories() {
    this.addResult('开始测试：获取商品分类...')

    try {
      const result = await app.api.product.getCategories()
      this.addResult(`✅ 成功：获取到 ${result.length} 个分类`)
    } catch (error) {
      this.addResult(`❌ 失败：${error.message}`)
    }
  },

  /**
   * 测试获取商品列表
   */
  async testProducts() {
    this.addResult('开始测试：获取商品列表...')

    try {
      const result = await app.api.product.getProducts({ page: 1, pageSize: 5 })
      this.addResult(`✅ 成功：获取到 ${result.items.length} 个商品`)
    } catch (error) {
      this.addResult(`❌ 失败：${error.message}`)
    }
  },

  /**
   * 测试开发快速登录
   */
  async testDevLogin() {
    this.addResult('开始测试：开发快速登录...')
    this.addResult(`请求地址: ${this.data.apiUrl}/auth/dev-login`)

    try {
      const result = await app.api.auth.devLogin()
      
      this.addResult(`✅ 成功：登录用户 ${result.userInfo.nickname}`)
      this.addResult(`Token: ${result.token.substring(0, 20)}...`)
    } catch (error) {
      this.addResult(`❌ 失败：${error.message}`)

      if (error.message && error.message.includes('fail')) {
        this.addResult('💡 网络请求失败，请检查:')
        this.addResult('1. 后端服务是否启动')
        this.addResult('2. 是否勾选"不校验合法域名"')
      }
    }
  },

  /**
   * 测试获取购物车
   */
  async testCart() {
    this.addResult('开始测试：获取购物车...')

    if (!app.store.getState().token) {
      this.addResult('⚠️ 请先登录')
      return
    }

    try {
      const result = await app.api.cart.getCart()
      this.addResult(`✅ 成功：购物车有 ${result.length} 个商品`)
    } catch (error) {
      this.addResult(`❌ 失败：${error.message}`)
    }
  },

  /**
   * 测试获取地址列表
   */
  async testAddresses() {
    this.addResult('开始测试：获取地址列表...')

    if (!app.store.getState().token) {
      this.addResult('⚠️ 请先登录')
      return
    }

    try {
      const result = await app.api.address.getAddresses()
      this.addResult(`✅ 成功：有 ${result.length} 个地址`)
    } catch (error) {
      this.addResult(`❌ 失败：${error.message}`)
    }
  },

  /**
   * 测试获取订单列表
   */
  async testOrders() {
    this.addResult('开始测试：获取订单列表...')

    if (!app.store.getState().token) {
      this.addResult('⚠️ 请先登录')
      return
    }

    try {
      const result = await app.api.order.getOrders({ page: 1, limit: 5 })
      this.addResult(`✅ 成功：有 ${result.items.length} 个订单`)
    } catch (error) {
      this.addResult(`❌ 失败：${error.message}`)
    }
  },

  /**
   * 运行所有测试
   */
  async runAllTests() {
    this.setData({ testResults: [] })

    this.addResult('========== 开始运行所有测试 ==========')
    this.addResult(`API地址: ${this.data.apiUrl}`)
    this.addResult(`时间: ${new Date().toLocaleString()}`)
    this.addResult('')

    await this.checkBackend()
    await this.wait(500)

    await this.testCategories()
    await this.wait(500)

    await this.testProducts()
    await this.wait(500)

    await this.testDevLogin()
    await this.wait(1000)

    await this.testCart()
    await this.wait(500)

    await this.testAddresses()
    await this.wait(500)

    await this.testOrders()

    this.addResult('')
    this.addResult('========== 所有测试完成 ==========')
  },

  /**
   * 清空结果
   */
  clearResults() {
    this.setData({ testResults: [] })
  },

  /**
   * 添加测试结果
   */
  addResult(message) {
    const time = new Date().toLocaleTimeString()
    const results = this.data.testResults
    results.push(`[${time}] ${message}`)

    this.setData({ testResults: results })

    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 10000,
        duration: 300
      })
    }, 100)
  },

  /**
   * 等待
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}))