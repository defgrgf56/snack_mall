// src/utils/jwt.js - JWT工具
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'your-secret-key'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

/**
 * 生成Token
 */
function generateToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: EXPIRES_IN
  })
}

/**
 * 验证Token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch (error) {
    return null
  }
}

/**
 * 解码Token（不验证）
 */
function decodeToken(token) {
  return jwt.decode(token)
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
}
