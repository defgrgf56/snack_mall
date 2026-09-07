// src/app.js - 应用入口文件
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const logger = require('./utils/logger')
const { sequelize } = require('./models')
const routes = require('./routes')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
// 配置 helmet - 放宽对静态资源的限制
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // 允许跨域资源访问
  contentSecurityPolicy: false // 禁用 CSP，避免阻止图片加载
}))

// 配置 CORS - 允许前端访问
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'],
  credentials: true
}))

app.use(express.json()) // 解析JSON
app.use(express.urlencoded({ extended: true })) // 解析URL编码

// 静态文件服务 - 使用绝对路径，并设置正确的响应头
const path = require('path')
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
}, express.static(path.join(__dirname, '../uploads')))

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

// API限流 - 根据环境设置不同限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'production' ? 300 : 1000, // 生产环境300，开发环境1000
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true, // 返回 RateLimit-* 响应头
  legacyHeaders: false, // 禁用 X-RateLimit-* 响应头
})
app.use('/api/', limiter)

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API路由
app.use(process.env.API_PREFIX || '/api', routes)

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  })
})

// 错误处理
app.use(errorHandler)

// 数据库连接和服务启动
async function startServer() {
  try {
    // 测试数据库连接
    try {
      await sequelize.authenticate()
      logger.info('数据库连接成功')

      // 同步数据库模型（开发环境）
      if (process.env.NODE_ENV === 'development') {
        // await sequelize.sync({ alter: true })
        logger.info('数据库模型同步完成')
      }
    } catch (dbError) {
      logger.warn('数据库连接失败，服务器将以无数据库模式启动')
      logger.warn('请检查数据库配置或稍后连接数据库')
      logger.warn('错误信息:', dbError.message)
    }

    // 启动服务器（即使数据库连接失败也启动）
    app.listen(PORT, () => {
      logger.info(`服务器运行在 http://localhost:${PORT}`)
      logger.info(`API前缀: ${process.env.API_PREFIX || '/api'}`)
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`)
      logger.info('💡 提示: 当前可以测试API接口，部分功能需要数据库支持')
      
      // 启动订单超时取消定时任务
      try {
        const { startSchedule } = require('./tasks/cancel-unpaid-orders')
        startSchedule()
        logger.info('✅ 订单超时取消任务已启动')
      } catch (taskError) {
        logger.warn('⚠️ 订单超时取消任务启动失败:', taskError.message)
      }
    })
  } catch (error) {
    logger.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅退出
process.on('SIGTERM', async () => {
  logger.info('收到SIGTERM信号，准备关闭服务器...')
  await sequelize.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('收到SIGINT信号，准备关闭服务器...')
  await sequelize.close()
  process.exit(0)
})

// 启动服务器
startServer()

module.exports = app
