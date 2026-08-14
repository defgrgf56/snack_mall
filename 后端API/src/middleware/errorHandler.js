// src/middleware/errorHandler.js - 错误处理中间件
const logger = require('../utils/logger')
const Response = require('../utils/response')

function errorHandler(err, req, res, next) {
  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  })

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      code: 500,
      message: err.message,
      data: {
        stack: err.stack
      }
    })
  }

  // 生产环境返回通用错误信息
  return Response.serverError(res, '服务器内部错误')
}

module.exports = {
  errorHandler
}
