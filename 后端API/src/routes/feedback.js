// src/routes/feedback.js - 意见反馈路由
const express = require('express')
const router = express.Router()
const { Feedback, User } = require('../models')
const { authenticateToken } = require('../middleware/auth')
const { Op } = require('sequelize')

/**
 * 提交反馈
 * POST /api/feedbacks
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, content, images, contact } = req.body
    const userId = req.user.id

    // 验证必填字段
    if (!type || !content) {
      return res.status(400).json({
        code: 400,
        message: '反馈类型和内容不能为空'
      })
    }

    // 创建反馈
    const feedback = await Feedback.create({
      user_id: userId,
      type,
      content,
      images: images || null,
      contact,
      status: 1
    })

    res.json({
      code: 200,
      message: '提交成功，我们会尽快处理',
      data: feedback
    })
  } catch (error) {
    console.error('提交反馈失败:', error)
    res.status(500).json({
      code: 500,
      message: '提交失败，请稍后重试'
    })
  }
})

/**
 * 获取我的反馈列表
 * GET /api/feedbacks
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, pageSize = 10, status } = req.query

    const where = { user_id: userId }
    if (status) {
      where.status = status
    }

    const { count, rows } = await Feedback.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    })

    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(count / parseInt(pageSize))
        }
      }
    })
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 获取反馈详情
 * GET /api/feedbacks/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const feedback = await Feedback.findOne({
      where: { 
        id,
        user_id: userId 
      }
    })

    if (!feedback) {
      return res.status(404).json({
        code: 404,
        message: '反馈不存在'
      })
    }

    res.json({
      code: 200,
      data: feedback
    })
  } catch (error) {
    console.error('获取反馈详情失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 删除反馈
 * DELETE /api/feedbacks/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const feedback = await Feedback.findOne({
      where: { 
        id,
        user_id: userId 
      }
    })

    if (!feedback) {
      return res.status(404).json({
        code: 404,
        message: '反馈不存在'
      })
    }

    await feedback.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除反馈失败:', error)
    res.status(500).json({
      code: 500,
      message: '删除失败'
    })
  }
})

module.exports = router