// pages/test-api/test-api.js
const { api } = require('../../config/api.js')
const { quickLogin } = require('../../utils/auth.js')

Page({
  data: {
    testResults: [],
    backendStatus: '未检测',
    apiUrl: 'http://localhost:3000/api'
  },

  onLoad() {
    console.log('API测试页面加载')
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
          url: 'http://localhost:3000/api/categories',
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
   * 测试1：获取商品分类（无需登录）
   */
  async testCategories() {
    this.addResult('开始测试：获取商品分类...')
    
    try {
      const res = await api.getCategories()
      
      if (res.code === 200) {
        this.addResult(`✅ 成功：获取到 ${res.data.length} 个分类`)
        console.log('分类数据:', res.data)
      } else {
        this.addResult(`❌ 失败：${res.message}`)
      }
    } catch (error) {
      this.addResult(`❌ 错误：${error.message || error}`)
    }
  },

  /**
   * 测试2：获取商品列表（无需登录）
   */
  async testProducts() {
    this.addResult('开始测试：获取商品列表...')
    
    try {
      const res = await api.getProducts({ page: 1, pageSize: 5 })
      
      if (res.code === 200) {
        this.addResult(`✅ 成功：获取到 ${res.data.items.length} 个商品`)
        console.log('商品数据:', res.data)
      } else {
        this.addResult(`❌ 失败：${res.message}`)
      }
    } catch (error) {
      this.addResult(`❌ 错误：${error.message || error}`)
    }
  },

  /**
   * 测试3：开发快速登录
   */
  async testDevLogin() {
    this.addResult('开始测试：开发快速登录...')
    this.addResult(`请求地址: ${this.data.apiUrl}/auth/dev-login`)
    
    try {
      // 直接使用wx.request测试，便于调试
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'http://localhost:3000/api/auth/dev-login',
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          success: resolve,
          fail: reject,
          timeout: 10000
        })
      })
      
      console.log('登录响应:', res)
      
      if (res.statusCode === 200 && res.data.code === 200) {
        const { token, userInfo } = res.data.data
        
        // 保存登录信息
        const app = getApp()
        app.globalData.token = token
        app.globalData.userInfo = userInfo
        wx.setStorageSync('token', token)
        wx.setStorageSync('userInfo', userInfo)
        
        this.addResult(`✅ 成功：登录用户 ${userInfo.nickname}`)
        this.addResult(`Token: ${token.substring(0, 20)}...`)
        console.log('用户信息:', userInfo)
      } else {
        this.addResult(`❌ 失败：${res.data.message || '未知错误'}`)
        console.error('登录失败响应:', res)
      }
    } catch (error) {
      this.addResult(`❌ 错误：${error.errMsg || error}`)
      console.error('登录错误:', error)
      
      // 详细的错误信息
      if (error.errMsg) {
        if (error.errMsg.includes('fail')) {
          this.addResult('💡 网络请求失败，请检查:')
          this.addResult('1. 后端服务是否启动')
          this.addResult('2. 是否勾选"不校验合法域名"')
        }
      }
    }
  },

  /**
   * 测试4：获取购物车（需要登录）
   */
  async testCart() {
    this.addResult('开始测试：获取购物车...')
    
    const app = getApp()
    if (!app.globalData.token) {
      this.addResult('⚠️ 请先登录')
      return
    }
    
    try {
      const res = await api.getCart()
      
      if (res.code === 200) {
        this.addResult(`✅ 成功：购物车有 ${res.data.length} 个商品`)
        console.log('购物车数据:', res.data)
      } else {
        this.addResult(`❌ 失败：${res.message}`)
      }
    } catch (error) {
      this.addResult(`❌ 错误：${error.message || error}`)
    }
  },

  /**
   * 测试5：获取地址列表（需要登录）
   */
  async testAddresses() {
    this.addResult('开始测试：获取地址列表...')
    
    const app = getApp()
    if (!app.globalData.token) {
      this.addResult('⚠️ 请先登录')
      return
    }
    
    try {
      const res = await api.getAddresses()
      
      if (res.code === 200) {
        this.addResult(`✅ 成功：有 ${res.data.length} 个地址`)
        console.log('地址数据:', res.data)
      } else {
        this.addResult(`❌ 失败：${res.message}`)
      }
    } catch (error) {
      this.addResult(`❌ 错误：${error.message || error}`)
    }
  },

  /**
   * 测试6：获取订单列表（需要登录）
   */
  async testOrders() {
    this.addResult('开始测试：获取订单列表...')
    
    const app = getApp()
    if (!app.globalData.token) {
      this.addResult('⚠️ 请先登录')
      return
    }
    
    try {
      const res = await api.getOrders({ page: 1, limit: 5 })
      
      if (res.code === 200) {
        this.addResult(`✅ 成功：有 ${res.data.items.length} 个订单`)
        console.log('订单数据:', res.data)
      } else {
        this.addResult(`❌ 失败：${res.message}`)
      }
    } catch (error) {
      this.addResult(`❌ 错误：${error.message || error}`)
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
    
    // 先检查后端
    await this.checkBackend()
    await this.wait(500)
    
    // 测试无需登录的接口
    await this.testCategories()
    await this.wait(500)
    
    await this.testProducts()
    await this.wait(500)
    
    // 测试登录
    await this.testDevLogin()
    await this.wait(1000)
    
    // 测试需要登录的接口
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
    
    // 滚动到底部
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
})
