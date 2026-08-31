// src/routes/config.js - 系统配置路由
const express = require('express')
const router = express.Router()
const { Config } = require('../models')
const { adminAuth } = require('../middleware/auth')

// 获取系统配置
router.get('/', adminAuth, async (req, res) => {
  try {
    const configs = await Config.findAll()
    
    // 转换为键值对对象
    const configObj = {}
    configs.forEach(item => {
      try {
        // 尝试解析JSON值
        configObj[item.key] = JSON.parse(item.value)
      } catch {
        configObj[item.key] = item.value
      }
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: configObj
    })
  } catch (error) {
    console.error('获取系统配置失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 更新系统配置
router.put('/', adminAuth, async (req, res) => {
  try {
    const configs = req.body

    for (const key in configs) {
      const value = typeof configs[key] === 'object' 
        ? JSON.stringify(configs[key]) 
        : String(configs[key])

      await Config.upsert({
        key,
        value
      })
    }

    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新系统配置失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

// 获取单个配置
router.get('/:key', adminAuth, async (req, res) => {
  try {
    const { key } = req.params
    const config = await Config.findOne({ where: { key } })

    if (!config) {
      return res.json({
        code: 404,
        message: '配置不存在'
      })
    }

    let value
    try {
      value = JSON.parse(config.value)
    } catch {
      value = config.value
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        key: config.key,
        value,
        description: config.description
      }
    })
  } catch (error) {
    console.error('获取配置失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 设置单个配置
router.put('/:key', adminAuth, async (req, res) => {
  try {
    const { key } = req.params
    const { value, description } = req.body

    const valueStr = typeof value === 'object' 
      ? JSON.stringify(value) 
      : String(value)

    await Config.upsert({
      key,
      value: valueStr,
      description
    })

    res.json({
      code: 200,
      message: '设置成功'
    })
  } catch (error) {
    console.error('设置配置失败:', error)
    res.json({
      code: 500,
      message: '设置失败'
    })
  }
})

module.exports = router