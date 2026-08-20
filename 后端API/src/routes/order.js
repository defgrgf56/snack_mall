// src/routes/order.js - 订单路由
const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, Address, Cart, sequelize } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * 获取订单统计
 * GET /api/orders/stats
 * 注意：此路由必须在 /:id 路由之前定义，否则 Express 会将 'stats' 当作 id 参数
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const pending = await Order.count({
      where: { user_id: req.userId, status: 1 }
    });
    
    const paid = await Order.count({
      where: { user_id: req.userId, status: 2 }
    });
    
    const shipped = await Order.count({
      where: { user_id: req.userId, status: 3 }
    });
    
    const uncommented = await Order.count({
      where: { user_id: req.userId, status: 4 }
    });
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        pending,    // 待付款
        paid,       // 待发货
        shipped,    // 待收货
        uncommented // 待评价
      }
    });
  } catch (error) {
    console.error('获取订单统计失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 创建订单
 * POST /api/orders
 * Body: { address_id, delivery_type, remark, coupon_id, points_used, items: [{ product_id, quantity, spec }] }
 */
router.post('/', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { address_id, delivery_type = 1, remark, coupon_id, points_used = 0, items } = req.body;
    
    // 验证商品列表
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.json({
        code: 400,
        message: '请选择商品',
        data: null
      });
    }
    
    // 验证地址（快递配送需要地址）
    if (delivery_type === 1 && !address_id) {
      await transaction.rollback();
      return res.json({
        code: 400,
        message: '请选择收货地址',
        data: null
      });
    }
    
    let address = null;
    if (address_id) {
      address = await Address.findOne({
        where: { id: address_id, user_id: req.userId }
      });
      
      if (!address) {
        await transaction.rollback();
        return res.json({
          code: 404,
          message: '地址不存在',
          data: null
        });
      }
    }
    
    // 计算商品总价
    let productAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      
      if (!product || product.status !== 1) {
        await transaction.rollback();
        return res.json({
          code: 400,
          message: `商品不存在或已下架`,
          data: null
        });
      }
      
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.json({
          code: 400,
          message: `商品 ${product.name} 库存不足`,
          data: null
        });
      }
      
      const itemTotal = parseFloat(product.price) * item.quantity;
      productAmount += itemTotal;
      
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_cover: product.cover,
        price: product.price,
        quantity: item.quantity,
        total_amount: itemTotal.toFixed(2)
      });
    }
    
    // 计算优惠券折扣
    let couponDiscount = 0;
    let usedCoupon = null;
    
    if (coupon_id) {
      // 查询用户优惠券
      const userCoupon = await UserCoupon.findOne({
        where: {
          id: coupon_id,
          user_id: req.userId,
          status: 0 // 未使用
        },
        include: [{
          model: Coupon,
          as: 'coupon'
        }]
      });
      
      if (!userCoupon) {
        await transaction.rollback();
        return res.json({
          code: 400,
          message: '优惠券不可用',
          data: null
        });
      }
      
      const coupon = userCoupon.coupon;
      
      // 检查是否过期
      if (new Date() > new Date(userCoupon.expire_time)) {
        await transaction.rollback();
        return res.json({
          code: 400,
          message: '优惠券已过期',
          data: null
        });
      }
      
      // 检查使用条件
      if (productAmount < coupon.min_amount) {
        await transaction.rollback();
        return res.json({
          code: 400,
          message: `订单金额需满${coupon.min_amount}元才能使用此优惠券`,
          data: null
        });
      }
      
      // 计算折扣金额
      if (coupon.discount_type === 'amount') {
        // 固定金额折扣
        couponDiscount = parseFloat(coupon.discount_value);
      } else if (coupon.discount_type === 'percent') {
        // 百分比折扣（如8.5折）
        const discountRate = parseFloat(coupon.discount_value) / 10;
        couponDiscount = productAmount * (1 - discountRate);
      }
      
      // 确保折扣不超过商品总额
      if (couponDiscount > productAmount) {
        couponDiscount = productAmount;
      }
      
      usedCoupon = userCoupon;
    }
    
    // 计算积分抵扣（暂不实现）
    const pointsDiscount = 0;
    const deliveryFee = 0; // 免运费
    
    const totalAmount = productAmount - couponDiscount - pointsDiscount + deliveryFee;
    
    // 生成订单号
    const orderNo = 'SN' + Date.now() + Math.floor(Math.random() * 1000);
    
    // 创建订单
    const order = await Order.create({
      user_id: req.userId,
      order_no: orderNo,
      status: 1, // 待付款
      total_amount: productAmount.toFixed(2),
      freight_amount: deliveryFee.toFixed(2),
      discount_amount: (couponDiscount + pointsDiscount).toFixed(2),
      pay_amount: totalAmount.toFixed(2),
      delivery_type,
      consignee: address?.consignee || '',
      phone: address?.phone || '',
      province: address?.province || '',
      city: address?.city || '',
      district: address?.district || '',
      address: address?.address || '',
      remark: remark || null,
      coupon_id: coupon_id || null,
      points_used
    }, { transaction });
    
    // 创建订单项
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item
      }, { transaction });
      
      // 扣减库存
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.product_id },
        transaction
      });
    }
    
    // 删除购物车中的商品（如果是从购物车结算的）
    if (req.body.cart_ids && Array.isArray(req.body.cart_ids)) {
      await Cart.destroy({
        where: {
          id: req.body.cart_ids,
          user_id: req.userId
        },
        transaction
      });
    }
    
    // 标记优惠券为已使用
    if (usedCoupon) {
      await usedCoupon.update({
        status: 1, // 已使用
        use_time: new Date(),
        order_id: order.id
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: {
        order_id: order.id,
        order_no: order.order_no
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建订单失败:', error);
    res.json({
      code: 500,
      message: '创建订单失败',
      data: null
    });
  }
});

/**
 * 获取订单列表
 * GET /api/orders
 * Query: status, page, limit
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('=== 获取订单列表 ===');
    console.log('用户ID:', req.userId);
    console.log('查询参数:', req.query);
    
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { user_id: req.userId };
    if (status) {
      where.status = parseInt(status);
    }
    
    console.log('查询条件:', where);
    console.log('分页:', { offset, limit });
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'cover']
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    console.log('查询结果: 共', count, '条订单');
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        items: orders,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    console.error('错误堆栈:', error.stack);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取订单详情
 * GET /api/orders/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, user_id: req.userId },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'cover', 'price']
        }]
      }]
    });
    
    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }
    
    // 组装地址信息
    const address = order.consignee ? {
      consignee: order.consignee,
      phone: order.phone,
      province: order.province,
      city: order.city,
      district: order.district,
      detail: order.address
    } : null;
    
    res.json({
      code: 200,
      message: 'success',
      data: {
        ...order.toJSON(),
        address
      }
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 取消订单
 * PUT /api/orders/:id/cancel
 */
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, user_id: req.userId },
      include: [{ model: OrderItem, as: 'items' }]
    });
    
    if (!order) {
      await transaction.rollback();
      return res.json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }
    
    // 只有待付款订单可以取消
    if (order.status !== 1) {
      await transaction.rollback();
      return res.json({
        code: 400,
        message: '订单状态不允许取消',
        data: null
      });
    }
    
    console.log(`取消订单 ${order.order_no}, 包含 ${order.items.length} 个商品`);
    
    // 更新订单状态
    await order.update({ status: 5 }, { transaction }); // 5: 已取消
    
    // 恢复库存 & 从购物车中删除该订单的商品
    let cartDeletedCount = 0;
    for (const item of order.items) {
      // 恢复库存
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.product_id },
        transaction
      });
      console.log(`商品 ${item.product_name} (ID: ${item.product_id}) 库存已恢复 +${item.quantity}`);
      
      // 从购物车中删除该商品
      const deleted = await Cart.destroy({
        where: {
          user_id: req.userId,
          product_id: item.product_id
        },
        transaction
      });
      
      if (deleted > 0) {
        cartDeletedCount++;
        console.log(`已从购物车删除商品: ${item.product_name} (ID: ${item.product_id})`);
      }
    }
    
    await transaction.commit();
    
    console.log(`订单取消成功: ${order.order_no}, 从购物车删除了 ${cartDeletedCount} 个商品`);
    
    res.json({
      code: 200,
      message: '订单已取消',
      data: null
    });
  } catch (error) {
    await transaction.rollback();
    console.error('取消订单失败:', error);
    res.json({
      code: 500,
      message: '取消失败',
      data: null
    });
  }
});

/**
 * 确认收货
 * PUT /api/orders/:id/receive
 */
router.put('/:id/receive', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, user_id: req.userId }
    });
    
    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }
    
    // 只有待收货订单可以确认收货
    if (order.status !== 3) {
      return res.json({
        code: 400,
        message: '订单状态不允许确认收货',
        data: null
      });
    }
    
    await order.update({
      status: 4, // 4: 已完成
      finish_time: new Date()
    });
    
    res.json({
      code: 200,
      message: '确认收货成功',
      data: null
    });
  } catch (error) {
    console.error('确认收货失败:', error);
    res.json({
      code: 500,
      message: '操作失败',
      data: null
    });
  }
});

/**
 * 删除订单
 * DELETE /api/orders/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, user_id: req.userId }
    });
    
    if (!order) {
      return res.json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }
    
    // 只有已取消或已完成的订单可以删除
    if (![4, 5, 6].includes(order.status)) {
      return res.json({
        code: 400,
        message: '订单状态不允许删除',
        data: null
      });
    }
    
    await order.destroy();
    
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除订单失败:', error);
    res.json({
      code: 500,
      message: '删除失败',
      data: null
    });
  }
});

module.exports = router;
