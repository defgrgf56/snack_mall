// routes/points-exchange.js - 积分兑换路由
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PointsProduct, PointsExchange, User, Address, PointsLog } = require('../models');
const Response = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

/**
 * @route   GET /api/points-exchange/products
 * @desc    获取积分商品列表
 * @access  Public
 */
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await PointsProduct.findAndCountAll({
      where: { status: parseInt(status) },
      order: [['sort', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return Response.success(res, {
      products: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit)
    }, '获取积分商品列表成功');
  } catch (error) {
    console.error('获取积分商品列表失败:', error);
    return Response.error(res, '获取积分商品列表失败', 500);
  }
});

/**
 * @route   GET /api/points-exchange/products/:id
 * @desc    获取积分商品详情
 * @access  Public
 */
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await PointsProduct.findByPk(id);
    
    if (!product) {
      return Response.error(res, '商品不存在', 404);
    }

    return Response.success(res, product, '获取商品详情成功');
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return Response.error(res, '获取商品详情失败', 500);
  }
});

/**
 * @route   POST /api/points-exchange/exchange
 * @desc    兑换积分商品
 * @access  Private
 */
router.post('/exchange', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1, address_id } = req.body;

    // 1. 检查商品是否存在
    const product = await PointsProduct.findByPk(product_id, { transaction });
    if (!product) {
      await transaction.rollback();
      return Response.error(res, '商品不存在', 404);
    }

    // 检查商品状态
    if (product.status !== 1) {
      await transaction.rollback();
      return Response.error(res, '商品已下架', 400);
    }

    // 检查库存
    if (product.stock < quantity) {
      await transaction.rollback();
      return Response.error(res, '库存不足', 400);
    }

    // 2. 检查用户积分是否足够
    const user = await User.findByPk(userId, { transaction });
    const totalPoints = product.points * quantity;
    
    if (user.points < totalPoints) {
      await transaction.rollback();
      return Response.error(res, '积分不足', 400);
    }

    // 3. 检查限购数量
    if (product.limit_per_user) {
      const exchangedCount = await PointsExchange.sum('quantity', {
        where: {
          user_id: userId,
          product_id: product_id
        },
        transaction
      }) || 0;

      if (exchangedCount + quantity > product.limit_per_user) {
        await transaction.rollback();
        return Response.error(res, `该商品每人限兑${product.limit_per_user}件`, 400);
      }
    }

    // 4. 检查收货地址
    if (address_id) {
      const address = await Address.findOne({
        where: { id: address_id, user_id: userId },
        transaction
      });
      
      if (!address) {
        await transaction.rollback();
        return Response.error(res, '收货地址不存在', 404);
      }
    }

    // 5. 扣除积分
    await user.decrement('points', { by: totalPoints, transaction });

    // 6. 扣除库存，增加兑换次数
    await product.decrement('stock', { by: quantity, transaction });
    await product.increment('exchange_count', { by: quantity, transaction });

    // 7. 创建兑换记录
    const exchange = await PointsExchange.create({
      user_id: userId,
      product_id: product.id,
      product_name: product.name,
      product_cover: product.cover,
      points: totalPoints,
      quantity,
      address_id: address_id || null,
      status: 0
    }, { transaction });

    // 8. 记录积分日志
    await PointsLog.create({
      user_id: userId,
      type: 'exchange',
      points: -totalPoints,
      balance: user.points - totalPoints,
      description: `兑换商品：${product.name}`
    }, { transaction });

    await transaction.commit();

    return Response.success(res, {
      exchange_id: exchange.id,
      remaining_points: user.points - totalPoints
    }, '兑换成功');
  } catch (error) {
    await transaction.rollback();
    console.error('兑换商品失败:', error);
    return Response.error(res, '兑换失败', 500);
  }
});

/**
 * @route   GET /api/points-exchange/records
 * @desc    获取我的兑换记录
 * @access  Private
 */
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { user_id: userId };
    if (status !== undefined) {
      where.status = parseInt(status);
    }

    const { count, rows } = await PointsExchange.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Address,
          as: 'address',
          required: false
        }
      ]
    });

    return Response.success(res, {
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(limit)
    }, '获取兑换记录成功');
  } catch (error) {
    console.error('获取兑换记录失败:', error);
    return Response.error(res, '获取兑换记录失败', 500);
  }
});

/**
 * @route   GET /api/points-exchange/records/:id
 * @desc    获取兑换记录详情
 * @access  Private
 */
router.get('/records/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const exchange = await PointsExchange.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: Address,
          as: 'address',
          required: false
        }
      ]
    });

    if (!exchange) {
      return Response.error(res, '兑换记录不存在', 404);
    }

    return Response.success(res, exchange, '获取兑换记录详情成功');
  } catch (error) {
    console.error('获取兑换记录详情失败:', error);
    return Response.error(res, '获取兑换记录详情失败', 500);
  }
});

/**
 * @route   GET /api/points-exchange/check-limit/:productId
 * @desc    检查商品是否可兑换（限购检查）
 * @access  Private
 */
router.get('/check-limit/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const product = await PointsProduct.findByPk(productId);
    if (!product) {
      return Response.error(res, '商品不存在', 404);
    }

    // 获取用户已兑换数量
    const exchangedCount = await PointsExchange.sum('quantity', {
      where: {
        user_id: userId,
        product_id: productId
      }
    }) || 0;

    // 计算可兑换数量
    let canExchange = true;
    let remainingCount = null;

    if (product.limit_per_user) {
      remainingCount = product.limit_per_user - exchangedCount;
      canExchange = remainingCount > 0;
    }

    return Response.success(res, {
      can_exchange: canExchange,
      exchanged_count: exchangedCount,
      limit_per_user: product.limit_per_user,
      remaining_count: remainingCount,
      stock: product.stock
    }, '检查成功');
  } catch (error) {
    console.error('检查限购失败:', error);
    return Response.error(res, '检查失败', 500);
  }
});

module.exports = router;
