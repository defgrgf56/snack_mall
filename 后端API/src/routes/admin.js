// src/routes/admin.js - 管理员路由
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Admin, Order, Product, User } = require('../models')
const { adminAuth } = require('../middleware/auth')
const { Op } = require('sequelize')

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }

    // 查找管理员
    const admin = await Admin.findOne({ where: { username } })
    if (!admin) {
      return res.json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return res.json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 检查状态
    if (admin.status === 0) {
      return res.json({
        code: 403,
        message: '账号已被禁用'
      })
    }

    // 更新登录信息
    await admin.update({
      last_login_at: new Date(),
      last_login_ip: req.ip
    })

    // 生成token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          avatar: admin.avatar,
          role: admin.role
        }
      }
    })
  } catch (error) {
    console.error('管理员登录失败:', error)
    res.json({
      code: 500,
      message: '登录失败'
    })
  }
})

// 获取管理员列表
router.get('/list', adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query
    const offset = (page - 1) * pageSize

    const where = {}
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { nickname: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const { count, rows } = await Admin.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取管理员列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 创建管理员
router.post('/', adminAuth, async (req, res) => {
  try {
    const { username, password, nickname, role = 2 } = req.body

    // 验证必填字段
    if (!username || !password) {
      return res.json({
        code: 400,
        message: '用户名和密码不能为空'
      })
    }

    // 检查用户名是否已存在
    const existingAdmin = await Admin.findOne({ where: { username } })
    if (existingAdmin) {
      return res.json({
        code: 400,
        message: '用户名已存在'
      })
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建管理员
    const admin = await Admin.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      role,
      status: 1
    })

    res.json({
      code: 200,
      message: '创建成功',
      data: admin
    })
  } catch (error) {
    console.error('创建管理员失败:', error)
    res.json({
      code: 500,
      message: '创建失败'
    })
  }
})

// 更新管理员
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { nickname, role, status } = req.body

    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.json({
        code: 404,
        message: '管理员不存在'
      })
    }

    // 不允许修改超级管理员
    if (admin.role === 1 && req.admin.role !== 1) {
      return res.json({
        code: 403,
        message: '无权限修改超级管理员'
      })
    }

    await admin.update({
      nickname: nickname !== undefined ? nickname : admin.nickname,
      role: role !== undefined ? role : admin.role,
      status: status !== undefined ? status : admin.status
    })

    res.json({
      code: 200,
      message: '更新成功',
      data: admin
    })
  } catch (error) {
    console.error('更新管理员失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

// 重置密码
router.put('/:id/password', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.json({
        code: 400,
        message: '密码长度不能少于6位'
      })
    }

    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.json({
        code: 404,
        message: '管理员不存在'
      })
    }

    // 不允许修改超级管理员密码
    if (admin.role === 1 && req.admin.role !== 1) {
      return res.json({
        code: 403,
        message: '无权限修改超级管理员密码'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await admin.update({ password: hashedPassword })

    res.json({
      code: 200,
      message: '密码重置成功'
    })
  } catch (error) {
    console.error('重置密码失败:', error)
    res.json({
      code: 500,
      message: '重置失败'
    })
  }
})

// 删除管理员
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.json({
        code: 404,
        message: '管理员不存在'
      })
    }

    // 不允许删除超级管理员
    if (admin.role === 1) {
      return res.json({
        code: 403,
        message: '不能删除超级管理员'
      })
    }

    // 不允许删除自己
    if (admin.id === req.admin.id) {
      return res.json({
        code: 403,
        message: '不能删除自己'
      })
    }

    await admin.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除管理员失败:', error)
    res.json({
      code: 500,
      message: '删除失败'
    })
  }
})

// 获取统计数据
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    // 获取总销售额
    const totalSales = await Order.sum('total_amount', {
      where: { status: { [Op.in]: [2, 3, 4] } }
    }) || 0

    // 获取订单总数
    const totalOrders = await Order.count()

    // 获取用户总数
    const totalUsers = await User.count()

    // 获取商品总数
    const totalProducts = await Product.count()

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalOrders,
        totalUsers,
        totalProducts
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 获取销售趋势（最近7天）
router.get('/sales-trend', adminAuth, async (req, res) => {
  try {
    const { sequelize } = require('../models')
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'amount']
      ],
      where: {
        created_at: { [Op.gte]: sevenDaysAgo },
        status: { [Op.in]: [2, 3, 4] }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    })

    // 填充缺失的日期
    const result = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const found = salesData.find(item => item.date === dateStr)
      result.push({
        date: dateStr,
        amount: found ? parseFloat(found.amount) : 0
      })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    })
  } catch (error) {
    console.error('获取销售趋势失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 获取热销商品
router.get('/hot-products', adminAuth, async (req, res) => {
  try {
    const { sequelize } = require('../models')
    const { OrderItem } = require('../models')

    const hotProducts = await OrderItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sales']
      ],
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'image']
      }],
      group: ['product_id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 10,
      raw: false
    })

    const result = hotProducts.map(item => ({
      product_id: item.product_id,
      name: item.product?.name || '未知商品',
      price: item.product?.price || 0,
      image: item.product?.image || '',
      total_sales: parseInt(item.get('total_sales'))
    }))

    res.json({
      code: 200,
      message: '获取成功',
      data: result
    })
  } catch (error) {
    console.error('获取热销商品失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 获取订单列表（管理员）
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query
    const offset = (page - 1) * pageSize
    const { OrderItem } = require('../models')

    const where = {}
    if (status) {
      where.status = parseInt(status)
    }
    if (keyword) {
      where[Op.or] = [
        { order_no: { [Op.like]: `%${keyword}%` } },
        { consignee: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'cover']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取订单列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 获取订单详情（管理员）
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { OrderItem } = require('../models')

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'cover', 'price']
          }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar', 'phone']
        }
      ]
    })

    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在'
      })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: order
    })
  } catch (error) {
    console.error('获取订单详情失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 更新订单状态（管理员）
router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status, express_company, express_no, remark } = req.body

    const order = await Order.findByPk(id)
    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在'
      })
    }

    const updateData = {}
    if (status !== undefined) updateData.status = status
    if (express_company) updateData.express_company = express_company
    if (express_no) updateData.express_no = express_no
    if (remark !== undefined) updateData.remark = remark

    // 如果是发货，记录发货时间
    if (status === 3) {
      updateData.ship_time = new Date()
    }

    await order.update(updateData)

    res.json({
      code: 200,
      message: '更新成功',
      data: order
    })
  } catch (error) {
    console.error('更新订单失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

// 获取商品列表（管理员）
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, category_id, status } = req.query
    const offset = (page - 1) * pageSize

    const where = {}
    if (name) {
      where.name = { [Op.like]: `%${name}%` }
    }
    if (category_id) {
      where.category_id = parseInt(category_id)
    }
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }

    const { Category } = require('../models')
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 获取分类列表（管理员）
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const { Category } = require('../models')
    const categories = await Category.findAll({
      order: [['sort', 'ASC']]
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: categories,
        total: categories.length
      }
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

// 创建分类（管理员）
router.post('/categories', adminAuth, async (req, res) => {
  try {
    const { Category } = require('../models')
    const { name, icon, sort = 0, status = 1, parent_id = 0 } = req.body

    if (!name) {
      return res.json({
        code: 400,
        message: '分类名称不能为空'
      })
    }

    const category = await Category.create({
      name,
      icon,
      sort,
      status,
      parent_id
    })

    res.json({
      code: 200,
      message: '创建成功',
      data: category
    })
  } catch (error) {
    console.error('创建分类失败:', error)
    res.json({
      code: 500,
      message: '创建失败'
    })
  }
})

// 更新分类（管理员）
router.put('/categories/:id', adminAuth, async (req, res) => {
  try {
    const { Category } = require('../models')
    const { id } = req.params
    const { name, icon, sort, status, parent_id } = req.body

    const category = await Category.findByPk(id)
    if (!category) {
      return res.json({
        code: 404,
        message: '分类不存在'
      })
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (icon !== undefined) updateData.icon = icon
    if (sort !== undefined) updateData.sort = sort
    if (status !== undefined) updateData.status = status
    if (parent_id !== undefined) updateData.parent_id = parent_id

    await category.update(updateData)

    res.json({
      code: 200,
      message: '更新成功',
      data: category
    })
  } catch (error) {
    console.error('更新分类失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

// 删除分类（管理员）
router.delete('/categories/:id', adminAuth, async (req, res) => {
  try {
    const { Category } = require('../models')
    const { id } = req.params

    const category = await Category.findByPk(id)
    if (!category) {
      return res.json({
        code: 404,
        message: '分类不存在'
      })
    }

    // 检查是否有商品使用该分类
    const productCount = await Product.count({
      where: { category_id: id }
    })

    if (productCount > 0) {
      return res.json({
        code: 400,
        message: `该分类下还有 ${productCount} 个商品，无法删除`
      })
    }

    await category.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.json({
      code: 500,
      message: '删除失败'
    })
  }
})

// 创建/更新商品（管理员）
router.post('/products', adminAuth, async (req, res) => {
  try {
    const productData = req.body
    
    if (productData.id) {
      // 更新
      const product = await Product.findByPk(productData.id)
      if (!product) {
        return res.json({
          code: 404,
          message: '商品不存在'
        })
      }
      await product.update(productData)
      res.json({
        code: 200,
        message: '更新成功',
        data: product
      })
    } else {
      // 创建
      const product = await Product.create(productData)
      res.json({
        code: 200,
        message: '创建成功',
        data: product
      })
    }
  } catch (error) {
    console.error('保存商品失败:', error)
    res.json({
      code: 500,
      message: '保存失败'
    })
  }
})

// 更新商品状态（管理员）
router.put('/products/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const product = await Product.findByPk(id)
    if (!product) {
      return res.json({
        code: 404,
        message: '商品不存在'
      })
    }

    await product.update({ status })

    res.json({
      code: 200,
      message: '更新成功',
      data: product
    })
  } catch (error) {
    console.error('更新商品状态失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

// 删除商品（管理员）
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findByPk(id)
    if (!product) {
      return res.json({
        code: 404,
        message: '商品不存在'
      })
    }

    await product.destroy()

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除商品失败:', error)
    res.json({
      code: 500,
      message: '删除失败'
    })
  }
})

module.exports = router
