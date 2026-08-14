// src/routes/admin.js - 管理员路由
const express = require('express')
const router = express.Router()

// 管理员登录
router.post('/login', async (req, res) => {
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token: 'admin_token_' + Date.now(),
      userInfo: {
        id: 1,
        username: 'admin',
        real_name: 'Administrator'
      }
    }
  })
})

module.exports = router
