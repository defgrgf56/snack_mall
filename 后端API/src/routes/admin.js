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
    const { sequelize } = require('../models')
    
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

    // 获取订单状态统计
    const orderStatsByStatus = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    })

    // 映射订单状态
    const orderStats = {
      pending: 0,    // status = 1
      paid: 0,       // status = 2
      shipped: 0,    // status = 3
      completed: 0,  // status = 4
      cancelled: 0   // status = 5
    }

    orderStatsByStatus.forEach(item => {
      const statusMap = {
        1: 'pending',
        2: 'paid',
        3: 'shipped',
        4: 'completed',
        5: 'cancelled'
      }
      const key = statusMap[item.status]
      if (key) {
        orderStats[key] = parseInt(item.count)
      }
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalOrders,
        totalUsers,
        totalProducts,
        orderStats
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
        attributes: ['id', 'name', 'price', 'cover']
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
      cover: item.product?.cover || '',
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
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      order_no,
      user_nickname,
      start_date,
      end_date
    } = req.query
    const offset = (page - 1) * pageSize
    const { OrderItem } = require('../models')

    const where = {}
    
    // 订单状态筛选
    if (status) {
      where.status = parseInt(status)
    }
    
    // 订单号搜索
    if (order_no) {
      where.order_no = { [Op.like]: `%${order_no}%` }
    }
    
    // 日期范围筛选
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [
          new Date(start_date + ' 00:00:00'),
          new Date(end_date + ' 23:59:59')
        ]
      }
    }

    // 用户关联条件
    const include = [
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
        attributes: ['id', 'nickname', 'avatar'],
        where: user_nickname ? { nickname: { [Op.like]: `%${user_nickname}%` } } : undefined,
        required: !!user_nickname // 如果有用户昵称筛选，必须有关联的用户
      }
    ]

    const { count, rows } = await Order.findAndCountAll({
      where,
      include,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      distinct: true // 避免 JOIN 导致的重复计数
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

// 发货（管理员）
router.put('/orders/:id/ship', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { express_company, express_no } = req.body

    if (!express_company || !express_no) {
      return res.json({
        code: 400,
        message: '请填写快递公司和快递单号'
      })
    }

    const order = await Order.findByPk(id)
    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在'
      })
    }

    if (order.status !== 2) {
      return res.json({
        code: 400,
        message: '只能对待发货订单进行发货操作'
      })
    }

    await order.update({
      status: 3,  // 改为已发货
      ship_company: express_company,
      ship_no: express_no,
      ship_time: new Date()
    })

    res.json({
      code: 200,
      message: '发货成功',
      data: order
    })
  } catch (error) {
    console.error('发货失败:', error)
    res.json({
      code: 500,
      message: '发货失败'
    })
  }
})

// 取消订单（管理员）
router.put('/orders/:id/cancel', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const order = await Order.findByPk(id)
    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在'
      })
    }

    if (order.status !== 1) {
      return res.json({
        code: 400,
        message: '只能取消待付款订单'
      })
    }

    await order.update({
      status: 5,  // 已取消
      cancel_time: new Date(),
      cancel_reason: reason || '管理员取消'
    })

    res.json({
      code: 200,
      message: '取消成功',
      data: order
    })
  } catch (error) {
    console.error('取消订单失败:', error)
    res.json({
      code: 500,
      message: '取消失败'
    })
  }
})

// 退款（管理员）
router.put('/orders/:id/refund', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const { User } = require('../models')

    const order = await Order.findByPk(id)
    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在'
      })
    }

    if (![2, 3].includes(order.status)) {
      return res.json({
        code: 400,
        message: '只能对待发货或已发货的订单进行退款'
      })
    }

    // 如果已支付，需要退款到用户余额
    if (order.pay_amount && order.pay_amount > 0) {
      const user = await User.findByPk(order.user_id)
      if (user) {
        // 退款到余额
        await user.increment('balance', { by: order.pay_amount })
      }
    }

    await order.update({
      status: 7,  // 已退款
      refund_time: new Date(),
      refund_reason: reason || '管理员退款',
      remark: reason || '管理员退款'
    })

    res.json({
      code: 200,
      message: '退款成功',
      data: order
    })
  } catch (error) {
    console.error('退款失败:', error)
    res.json({
      code: 500,
      message: '退款失败'
    })
  }
})

// 获取商品统计数据（管理员）- 必须在 /products 之前
router.get('/products/stats', adminAuth, async (req, res) => {
  try {
    const { Op } = require('sequelize')
    
    // 商品总数
    const totalCount = await Product.count()
    
    // 上架商品数
    const onlineCount = await Product.count({
      where: { status: 1 }
    })
    
    // 下架商品数
    const offlineCount = await Product.count({
      where: { status: 0 }
    })
    
    // 库存告急商品数（库存 < 10）
    const lowStockCount = await Product.count({
      where: {
        stock: { [Op.lt]: 10 }
      }
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        totalCount,
        onlineCount,
        offlineCount,
        lowStockCount
      }
    })
  } catch (error) {
    console.error('获取商品统计失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
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
    
    console.log('查询参数:', { page, pageSize, offset, order: [['id', 'DESC']] })
    
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['id', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    })
    
    console.log('查询结果 IDs:', rows.map(p => p.id).join(', '))

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

// 获取单个商品详情（管理员）
router.get('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Category } = require('../models')
    
    const product = await Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    })
    
    if (!product) {
      return res.json({
        code: 404,
        message: '商品不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: product
    })
  } catch (error) {
    console.error('获取商品详情失败:', error)
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
    const { Sequelize } = require('sequelize')
    
    // 查询分类列表，并统计每个分类下的商品数量
    const categories = await Category.findAll({
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM products
              WHERE products.category_id = Category.id
            )`),
            'product_count'
          ]
        ]
      },
      order: [['sort', 'ASC'], ['id', 'DESC']]
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

// 更新商品（管理员）
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const productData = req.body
    
    const product = await Product.findByPk(id)
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
  } catch (error) {
    console.error('更新商品失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
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

// ==================== 活动专区管理 ====================

/**
 * 获取活动列表（管理员）
 * GET /api/admin/activities
 */
router.get('/activities', adminAuth, async (req, res) => {
  try {
    const { title, type, status, page = 1, pageSize = 10 } = req.query
    const { Activity } = require('../models')
    
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    // 构建查询条件
    const where = {}
    
    if (title) {
      where.title = { [Op.like]: `%${title}%` }
    }
    
    if (type) {
      where.type = type
    }
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }
    
    const { count, rows } = await Activity.findAndCountAll({
      where,
      order: [['sort', 'DESC'], ['created_at', 'DESC']],
      offset,
      limit
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取活动列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 获取活动详情（管理员）
 * GET /api/admin/activities/:id
 */
router.get('/activities/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Activity } = require('../models')
    
    const activity = await Activity.findByPk(id)
    
    if (!activity) {
      return res.json({
        code: 404,
        message: '活动不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: activity
    })
  } catch (error) {
    console.error('获取活动详情失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 创建活动（管理员）
 * POST /api/admin/activities
 */
router.post('/activities', adminAuth, async (req, res) => {
  try {
    const { Activity } = require('../models')
    const activityData = req.body
    
    // 验证必填字段
    if (!activityData.title || !activityData.subtitle || !activityData.cover) {
      return res.json({
        code: 400,
        message: '请填写完整的活动信息'
      })
    }
    
    // 验证时间
    if (new Date(activityData.start_time) >= new Date(activityData.end_time)) {
      return res.json({
        code: 400,
        message: '结束时间必须大于开始时间'
      })
    }
    
    const activity = await Activity.create(activityData)
    
    res.json({
      code: 200,
      message: '创建成功',
      data: activity
    })
  } catch (error) {
    console.error('创建活动失败:', error)
    res.json({
      code: 500,
      message: '创建失败'
    })
  }
})

/**
 * 更新活动（管理员）
 * PUT /api/admin/activities/:id
 */
router.put('/activities/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Activity } = require('../models')
    const activityData = req.body
    
    const activity = await Activity.findByPk(id)
    
    if (!activity) {
      return res.json({
        code: 404,
        message: '活动不存在'
      })
    }
    
    // 验证时间
    if (activityData.start_time && activityData.end_time) {
      if (new Date(activityData.start_time) >= new Date(activityData.end_time)) {
        return res.json({
          code: 400,
          message: '结束时间必须大于开始时间'
        })
      }
    }
    
    await activity.update(activityData)
    
    res.json({
      code: 200,
      message: '更新成功',
      data: activity
    })
  } catch (error) {
    console.error('更新活动失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

/**
 * 删除活动（管理员）
 * DELETE /api/admin/activities/:id
 */
router.delete('/activities/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Activity, ActivityProduct } = require('../models')
    
    const activity = await Activity.findByPk(id)
    
    if (!activity) {
      return res.json({
        code: 404,
        message: '活动不存在'
      })
    }
    
    // 删除关联的商品
    await ActivityProduct.destroy({ where: { activity_id: id } })
    
    // 删除活动
    await activity.destroy()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除活动失败:', error)
    res.json({
      code: 500,
      message: '删除失败'
    })
  }
})

/**
 * 更新活动状态（管理员）
 * PUT /api/admin/activities/:id/status
 */
router.put('/activities/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { Activity } = require('../models')
    
    const activity = await Activity.findByPk(id)
    
    if (!activity) {
      return res.json({
        code: 404,
        message: '活动不存在'
      })
    }
    
    await activity.update({ status })
    
    res.json({
      code: 200,
      message: '更新成功',
      data: activity
    })
  } catch (error) {
    console.error('更新活动状态失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

/**
 * 获取活动商品列表（管理员）
 * GET /api/admin/activities/:id/products
 */
router.get('/activities/:id/products', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, pageSize = 100 } = req.query
    const { ActivityProduct, Product } = require('../models')
    
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    const { count, rows } = await ActivityProduct.findAndCountAll({
      where: { activity_id: id },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'price', 'stock', 'sales']
      }],
      order: [['sort', 'DESC']],
      offset,
      limit
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取活动商品失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 批量添加活动商品（管理员）
 * POST /api/admin/activities/:id/products/batch
 */
router.post('/activities/:id/products/batch', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { products } = req.body
    const { Activity, ActivityProduct, Product } = require('../models')
    
    // 验证活动是否存在
    const activity = await Activity.findByPk(id)
    if (!activity) {
      return res.json({
        code: 404,
        message: '活动不存在'
      })
    }
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.json({
        code: 400,
        message: '请选择要添加的商品'
      })
    }
    
    // 验证商品是否存在
    const productIds = products.map(p => p.product_id)
    const existingProducts = await Product.findAll({
      where: { id: { [Op.in]: productIds } }
    })
    
    if (existingProducts.length !== productIds.length) {
      return res.json({
        code: 400,
        message: '部分商品不存在'
      })
    }
    
    // 批量创建或更新
    const results = []
    for (const item of products) {
      const [activityProduct, created] = await ActivityProduct.findOrCreate({
        where: {
          activity_id: id,
          product_id: item.product_id
        },
        defaults: {
          discount: item.discount || 10,
          special_price: item.special_price || null,
          sort: item.sort || 0
        }
      })
      
      if (!created) {
        // 如果已存在，更新数据
        await activityProduct.update({
          discount: item.discount || activityProduct.discount,
          special_price: item.special_price !== undefined ? item.special_price : activityProduct.special_price,
          sort: item.sort !== undefined ? item.sort : activityProduct.sort
        })
      }
      
      results.push(activityProduct)
    }
    
    res.json({
      code: 200,
      message: '添加成功',
      data: results
    })
  } catch (error) {
    console.error('批量添加活动商品失败:', error)
    res.json({
      code: 500,
      message: '添加失败'
    })
  }
})

/**
 * 更新活动商品（管理员）
 * PUT /api/admin/activities/:id/products/:productId
 */
router.put('/activities/:id/products/:productId', adminAuth, async (req, res) => {
  try {
    const { id, productId } = req.params
    const { discount, special_price, sort } = req.body
    const { ActivityProduct } = require('../models')
    
    const activityProduct = await ActivityProduct.findOne({
      where: {
        activity_id: id,
        product_id: productId
      }
    })
    
    if (!activityProduct) {
      return res.json({
        code: 404,
        message: '活动商品不存在'
      })
    }
    
    await activityProduct.update({
      discount: discount !== undefined ? discount : activityProduct.discount,
      special_price: special_price !== undefined ? special_price : activityProduct.special_price,
      sort: sort !== undefined ? sort : activityProduct.sort
    })
    
    res.json({
      code: 200,
      message: '更新成功',
      data: activityProduct
    })
  } catch (error) {
    console.error('更新活动商品失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

/**
 * 移除活动商品（管理员）
 * DELETE /api/admin/activities/:id/products/:productId
 */
router.delete('/activities/:id/products/:productId', adminAuth, async (req, res) => {
  try {
    const { id, productId } = req.params
    const { ActivityProduct } = require('../models')
    
    const result = await ActivityProduct.destroy({
      where: {
        activity_id: id,
        product_id: productId
      }
    })
    
    if (result === 0) {
      return res.json({
        code: 404,
        message: '活动商品不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '移除成功'
    })
  } catch (error) {
    console.error('移除活动商品失败:', error)
    res.json({
      code: 500,
      message: '移除失败'
    })
  }
})

/**
 * 秒杀活动管理 API
 */

/**
 * 获取秒杀列表（管理员）
 * GET /api/admin/seckills
 */
router.get('/seckills', adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query
    const { Seckill, Product } = require('../models')
    
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    const where = {}
    if (status) {
      where.status = parseInt(status)
    }
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }
    
    const { count, rows } = await Seckill.findAndCountAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'price', 'stock', 'sales']
      }],
      order: [['sort', 'DESC'], ['created_at', 'DESC']],
      offset,
      limit
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取秒杀列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 获取秒杀详情（管理员）
 * GET /api/admin/seckills/:id
 */
router.get('/seckills/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Seckill, Product } = require('../models')
    
    const seckill = await Seckill.findByPk(id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'price', 'stock', 'sales']
      }]
    })
    
    if (!seckill) {
      return res.json({
        code: 404,
        message: '秒杀活动不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: seckill
    })
  } catch (error) {
    console.error('获取秒杀详情失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 创建秒杀活动（管理员）
 * POST /api/admin/seckills
 */
router.post('/seckills', adminAuth, async (req, res) => {
  try {
    const { Seckill } = require('../models')
    const {
      title,
      product_id,
      start_time,
      end_time,
      original_price,
      seckill_price,
      stock,
      limit_per_user,
      sort = 0,
      status = 2
    } = req.body
    
    // 验证必填字段
    if (!title || !product_id || !start_time || !end_time || 
        !original_price || !seckill_price || !stock) {
      return res.json({
        code: 400,
        message: '请填写完整信息'
      })
    }
    
    // 验证价格
    if (parseFloat(seckill_price) >= parseFloat(original_price)) {
      return res.json({
        code: 400,
        message: '秒杀价必须低于原价'
      })
    }
    
    // 创建秒杀活动
    const seckill = await Seckill.create({
      title,
      product_id,
      start_time,
      end_time,
      original_price,
      seckill_price,
      stock,
      sold: 0,
      limit_per_user: limit_per_user || 1,
      sort,
      status
    })
    
    res.json({
      code: 200,
      message: '创建成功',
      data: seckill
    })
  } catch (error) {
    console.error('创建秒杀活动失败:', error)
    res.json({
      code: 500,
      message: '创建失败'
    })
  }
})

/**
 * 更新秒杀活动（管理员）
 * PUT /api/admin/seckills/:id
 */
router.put('/seckills/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Seckill } = require('../models')
    const {
      title,
      product_id,
      start_time,
      end_time,
      original_price,
      seckill_price,
      stock,
      limit_per_user,
      sort,
      status
    } = req.body
    
    const seckill = await Seckill.findByPk(id)
    if (!seckill) {
      return res.json({
        code: 404,
        message: '秒杀活动不存在'
      })
    }
    
    // 验证价格
    if (seckill_price && original_price && parseFloat(seckill_price) >= parseFloat(original_price)) {
      return res.json({
        code: 400,
        message: '秒杀价必须低于原价'
      })
    }
    
    // 更新秒杀活动
    await seckill.update({
      title: title || seckill.title,
      product_id: product_id || seckill.product_id,
      start_time: start_time || seckill.start_time,
      end_time: end_time || seckill.end_time,
      original_price: original_price !== undefined ? original_price : seckill.original_price,
      seckill_price: seckill_price !== undefined ? seckill_price : seckill.seckill_price,
      stock: stock !== undefined ? stock : seckill.stock,
      limit_per_user: limit_per_user !== undefined ? limit_per_user : seckill.limit_per_user,
      sort: sort !== undefined ? sort : seckill.sort,
      status: status !== undefined ? status : seckill.status
    })
    
    res.json({
      code: 200,
      message: '更新成功',
      data: seckill
    })
  } catch (error) {
    console.error('更新秒杀活动失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

/**
 * 删除秒杀活动（管理员）
 * DELETE /api/admin/seckills/:id
 */
router.delete('/seckills/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Seckill } = require('../models')
    
    const seckill = await Seckill.findByPk(id)
    if (!seckill) {
      return res.json({
        code: 404,
        message: '秒杀活动不存在'
      })
    }
    
    await seckill.destroy()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除秒杀活动失败:', error)
    res.json({
      code: 500,
      message: '删除失败'
    })
  }
})

/**
 * 更新秒杀状态（管理员）
 * PUT /api/admin/seckills/:id/status
 */
router.put('/seckills/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { Seckill } = require('../models')
    
    if (![0, 1, 2].includes(parseInt(status))) {
      return res.json({
        code: 400,
        message: '无效的状态值'
      })
    }
    
    const seckill = await Seckill.findByPk(id)
    if (!seckill) {
      return res.json({
        code: 404,
        message: '秒杀活动不存在'
      })
    }
    
    await seckill.update({ status: parseInt(status) })
    
    res.json({
      code: 200,
      message: '状态更新成功',
      data: seckill
    })
  } catch (error) {
    console.error('更新秒杀状态失败:', error)
    res.json({
      code: 500,
      message: '状态更新失败'
    })
  }
})

// ==================== 用户管理 ====================

/**
 * 获取用户列表（管理员）
 * GET /api/admin/users
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, nickname, phone, level, status } = req.query
    
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    const where = {}
    
    if (nickname) {
      where.nickname = { [Op.like]: `%${nickname}%` }
    }
    
    if (phone) {
      where.phone = { [Op.like]: `%${phone}%` }
    }
    
    if (level !== undefined && level !== '') {
      where.level = parseInt(level)
    }
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }
    
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['openid', 'unionid', 'deleted_at'] },
      order: [['created_at', 'DESC']],
      offset,
      limit
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 获取用户详情（管理员）
 * GET /api/admin/users/:id
 */
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['openid', 'unionid', 'deleted_at'] }
    })
    
    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: user
    })
  } catch (error) {
    console.error('获取用户详情失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 更新用户（管理员）
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { nickname, phone, gender, level, status, points, balance } = req.body
    
    const user = await User.findByPk(id)
    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    const updateData = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (phone !== undefined) updateData.phone = phone
    if (gender !== undefined) updateData.gender = gender
    if (level !== undefined) updateData.level = level
    if (status !== undefined) updateData.status = status
    if (points !== undefined) updateData.points = points
    if (balance !== undefined) updateData.balance = balance
    
    await user.update(updateData)
    
    res.json({
      code: 200,
      message: '更新成功',
      data: user
    })
  } catch (error) {
    console.error('更新用户失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

/**
 * 更新用户状态（管理员）
 * PUT /api/admin/users/:id/status
 */
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const user = await User.findByPk(id)
    if (!user) {
      return res.json({
        code: 404,
        message: '用户不存在'
      })
    }
    
    await user.update({ status: parseInt(status) })
    
    res.json({
      code: 200,
      message: '状态更新成功',
      data: user
    })
  } catch (error) {
    console.error('更新用户状态失败:', error)
    res.json({
      code: 500,
      message: '状态更新失败'
    })
  }
})

// ==================== 优惠券管理 ====================

/**
 * 获取优惠券列表（管理员）
 * GET /api/admin/coupons
 */
router.get('/coupons', adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, type, status } = req.query
    const { Coupon } = require('../models')
    
    const offset = (page - 1) * pageSize
    const limit = parseInt(pageSize)
    
    const where = {}
    
    if (name) {
      where.name = { [Op.like]: `%${name}%` }
    }
    
    if (type !== undefined && type !== '') {
      where.type = parseInt(type)
    }
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }
    
    const { count, rows } = await Coupon.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 获取优惠券详情（管理员）
 * GET /api/admin/coupons/:id
 */
router.get('/coupons/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Coupon } = require('../models')
    
    const coupon = await Coupon.findByPk(id)
    
    if (!coupon) {
      return res.json({
        code: 404,
        message: '优惠券不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: coupon
    })
  } catch (error) {
    console.error('获取优惠券详情失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 创建优惠券（管理员）
 * POST /api/admin/coupons
 */
router.post('/coupons', adminAuth, async (req, res) => {
  try {
    const { Coupon } = require('../models')
    const {
      name,
      type,
      discount_type,
      discount_value,
      min_amount,
      total_count,
      per_limit,
      start_time,
      end_time,
      status = 1
    } = req.body
    
    // 验证必填字段
    if (!name || !discount_value || !total_count) {
      return res.json({
        code: 400,
        message: '请填写完整信息'
      })
    }
    
    // 创建优惠券
    const coupon = await Coupon.create({
      name,
      type: type || 1,
      discount_type: discount_type || 1,
      discount_value,
      min_amount: min_amount || 0,
      total_count,
      receive_count: 0,
      used_count: 0,
      per_limit: per_limit || 1,
      start_time,
      end_time,
      status
    })
    
    res.json({
      code: 200,
      message: '创建成功',
      data: coupon
    })
  } catch (error) {
    console.error('创建优惠券失败:', error)
    res.json({
      code: 500,
      message: '创建失败'
    })
  }
})

/**
 * 更新优惠券（管理员）
 * PUT /api/admin/coupons/:id
 */
router.put('/coupons/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Coupon } = require('../models')
    const {
      name,
      type,
      discount_type,
      discount_value,
      min_amount,
      total_count,
      per_limit,
      start_time,
      end_time,
      status
    } = req.body
    
    const coupon = await Coupon.findByPk(id)
    if (!coupon) {
      return res.json({
        code: 404,
        message: '优惠券不存在'
      })
    }
    
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (discount_type !== undefined) updateData.discount_type = discount_type
    if (discount_value !== undefined) updateData.discount_value = discount_value
    if (min_amount !== undefined) updateData.min_amount = min_amount
    if (total_count !== undefined) updateData.total_count = total_count
    if (per_limit !== undefined) updateData.per_limit = per_limit
    if (start_time !== undefined) updateData.start_time = start_time
    if (end_time !== undefined) updateData.end_time = end_time
    if (status !== undefined) updateData.status = status
    
    await coupon.update(updateData)
    
    res.json({
      code: 200,
      message: '更新成功',
      data: coupon
    })
  } catch (error) {
    console.error('更新优惠券失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

/**
 * 删除优惠券（管理员）
 * DELETE /api/admin/coupons/:id
 */
router.delete('/coupons/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Coupon } = require('../models')
    
    const coupon = await Coupon.findByPk(id)
    if (!coupon) {
      return res.json({
        code: 404,
        message: '优惠券不存在'
      })
    }
    
    await coupon.destroy()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除优惠券失败:', error)
    res.json({
      code: 500,
      message: '删除失败'
    })
  }
})

/**
 * 更新优惠券状态（管理员）
 * PUT /api/admin/coupons/:id/status
 */
router.put('/coupons/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { Coupon } = require('../models')
    
    const coupon = await Coupon.findByPk(id)
    if (!coupon) {
      return res.json({
        code: 404,
        message: '优惠券不存在'
      })
    }
    
    await coupon.update({ status: parseInt(status) })
    
    res.json({
      code: 200,
      message: '状态更新成功',
      data: coupon
    })
  } catch (error) {
    console.error('更新优惠券状态失败:', error)
    res.json({
      code: 500,
      message: '状态更新失败'
    })
  }
})

// ==================== 轮播图管理 ====================

/**
 * 获取轮播图列表（管理员）
 * GET /api/admin/banners
 */
router.get('/banners', adminAuth, async (req, res) => {
  try {
    const { page, pageSize, status } = req.query
    const { Banner } = require('../models')
    
    const where = {}
    
    if (status !== undefined && status !== '') {
      where.status = parseInt(status)
    }
    
    // 如果提供分页参数
    if (page && pageSize) {
      const offset = (page - 1) * pageSize
      const limit = parseInt(pageSize)
      
      const { count, rows } = await Banner.findAndCountAll({
        where,
        order: [['sort', 'DESC'], ['created_at', 'DESC']],
        offset,
        limit
      })
      
      return res.json({
        code: 200,
        message: '获取成功',
        data: {
          list: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            pageSize: limit,
            totalPages: Math.ceil(count / limit)
          }
        }
      })
    }
    
    // 不分页，返回所有数据
    const banners = await Banner.findAll({
      where,
      order: [['sort', 'DESC'], ['created_at', 'DESC']]
    })
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: banners,
        total: banners.length
      }
    })
  } catch (error) {
    console.error('获取轮播图列表失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 获取轮播图详情（管理员）
 * GET /api/admin/banners/:id
 */
router.get('/banners/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Banner } = require('../models')
    
    const banner = await Banner.findByPk(id)
    
    if (!banner) {
      return res.json({
        code: 404,
        message: '轮播图不存在'
      })
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: banner
    })
  } catch (error) {
    console.error('获取轮播图详情失败:', error)
    res.json({
      code: 500,
      message: '获取失败'
    })
  }
})

/**
 * 创建轮播图（管理员）
 * POST /api/admin/banners
 */
router.post('/banners', adminAuth, async (req, res) => {
  try {
    const { Banner } = require('../models')
    const {
      title,
      image,
      link_type,
      link_value,
      sort = 0,
      status = 1
    } = req.body
    
    // 验证必填字段
    if (!title || !image) {
      return res.json({
        code: 400,
        message: '请填写完整信息'
      })
    }
    
    // 创建轮播图
    const banner = await Banner.create({
      title,
      image,
      link_type: link_type || 1,
      link_value,
      sort,
      status
    })
    
    res.json({
      code: 200,
      message: '创建成功',
      data: banner
    })
  } catch (error) {
    console.error('创建轮播图失败:', error)
    res.json({
      code: 500,
      message: '创建失败'
    })
  }
})

/**
 * 更新轮播图（管理员）
 * PUT /api/admin/banners/:id
 */
router.put('/banners/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Banner } = require('../models')
    const {
      title,
      image,
      link_type,
      link_value,
      sort,
      status
    } = req.body
    
    const banner = await Banner.findByPk(id)
    if (!banner) {
      return res.json({
        code: 404,
        message: '轮播图不存在'
      })
    }
    
    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (image !== undefined) updateData.image = image
    if (link_type !== undefined) updateData.link_type = link_type
    if (link_value !== undefined) updateData.link_value = link_value
    if (sort !== undefined) updateData.sort = sort
    if (status !== undefined) updateData.status = status
    
    await banner.update(updateData)
    
    res.json({
      code: 200,
      message: '更新成功',
      data: banner
    })
  } catch (error) {
    console.error('更新轮播图失败:', error)
    res.json({
      code: 500,
      message: '更新失败'
    })
  }
})

/**
 * 删除轮播图（管理员）
 * DELETE /api/admin/banners/:id
 */
router.delete('/banners/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { Banner } = require('../models')
    
    const banner = await Banner.findByPk(id)
    if (!banner) {
      return res.json({
        code: 404,
        message: '轮播图不存在'
      })
    }
    
    await banner.destroy()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除轮播图失败:', error)
    res.json({
      code: 500,
      message: '删除失败'
    })
  }
})

/**
 * 更新轮播图状态（管理员）
 * PUT /api/admin/banners/:id/status
 */
router.put('/banners/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const { Banner } = require('../models')
    
    const banner = await Banner.findByPk(id)
    if (!banner) {
      return res.json({
        code: 404,
        message: '轮播图不存在'
      })
    }
    
    await banner.update({ status: parseInt(status) })
    
    res.json({
      code: 200,
      message: '状态更新成功',
      data: banner
    })
  } catch (error) {
    console.error('更新轮播图状态失败:', error)
    res.json({
      code: 500,
      message: '状态更新失败'
    })
  }
})

module.exports = router
