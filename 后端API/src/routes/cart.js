// src/routes/cart.js - 购物车路由
const express = require('express');
const router = express.Router();
const { Cart, Product } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * 获取购物车列表
 * GET /api/cart
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'price', 'stock', 'status']
      }],
      order: [['created_at', 'DESC']]
    });
    
    // 过滤掉已下架或删除的商品
    const validItems = cartItems.filter(item => 
      item.product && item.product.status === 1
    );
    
    res.json({
      code: 200,
      message: 'success',
      data: validItems
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取购物车数量
 * GET /api/cart/count
 */
router.get('/count', authenticateToken, async (req, res) => {
  try {
    // 获取购物车所有商品
    const cartItems = await Cart.findAll({
      where: { user_id: req.userId },
      attributes: ['quantity']
    });
    
    // 计算商品总数量（累加所有商品的quantity）
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log(`用户${req.userId}购物车: ${cartItems.length}种商品, 总数量${count}`);
    
    res.json({
      code: 200,
      message: 'success',
      data: { count }
    });
  } catch (error) {
    console.error('获取购物车数量失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 添加到购物车
 * POST /api/cart/add
 * Body: { product_id, quantity, spec }
 */
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    
    if (!product_id) {
      return res.json({
        code: 400,
        message: '缺少商品ID',
        data: null
      });
    }
    
    // 检查商品是否存在
    const product = await Product.findByPk(product_id);
    
    if (!product || product.status !== 1) {
      return res.json({
        code: 404,
        message: '商品不存在或已下架',
        data: null
      });
    }
    
    // 检查库存
    if (product.stock < quantity) {
      return res.json({
        code: 400,
        message: '库存不足',
        data: null
      });
    }
    
    // 查找是否已存在相同商品（相同规格）
    const existingCart = await Cart.findOne({
      where: {
        user_id: req.userId,
        product_id
      }
    });
    
    if (existingCart) {
      // 更新数量
      const newQuantity = existingCart.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.json({
          code: 400,
          message: '库存不足',
          data: null
        });
      }
      
      await existingCart.update({ quantity: newQuantity });
      
      return res.json({
        code: 200,
        message: '已更新购物车',
        data: existingCart
      });
    }
    
    // 创建新的购物车项
    const cartItem = await Cart.create({
      user_id: req.userId,
      product_id,
      quantity
    });
    
    res.json({
      code: 200,
      message: '已加入购物车',
      data: cartItem
    });
  } catch (error) {
    console.error('添加购物车失败:', error);
    res.json({
      code: 500,
      message: '添加失败',
      data: null
    });
  }
});

/**
 * 更新购物车数量
 * PUT /api/cart/:id
 * Body: { quantity }
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.json({
        code: 400,
        message: '数量无效',
        data: null
      });
    }
    
    const cartItem = await Cart.findOne({
      where: { id, user_id: req.userId },
      include: [{ model: Product, as: 'product' }]
    });
    
    if (!cartItem) {
      return res.json({
        code: 404,
        message: '购物车项不存在',
        data: null
      });
    }
    
    // 检查库存
    if (cartItem.product.stock < quantity) {
      return res.json({
        code: 400,
        message: '库存不足',
        data: null
      });
    }
    
    await cartItem.update({ quantity });
    
    res.json({
      code: 200,
      message: '更新成功',
      data: cartItem
    });
  } catch (error) {
    console.error('更新购物车失败:', error);
    res.json({
      code: 500,
      message: '更新失败',
      data: null
    });
  }
});

/**
 * 删除购物车项
 * DELETE /api/cart/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const cartItem = await Cart.findOne({
      where: { id, user_id: req.userId }
    });
    
    if (!cartItem) {
      return res.json({
        code: 404,
        message: '购物车项不存在',
        data: null
      });
    }
    
    await cartItem.destroy();
    
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除购物车失败:', error);
    res.json({
      code: 500,
      message: '删除失败',
      data: null
    });
  }
});

/**
 * 批量删除购物车
 * POST /api/cart/batch-delete
 * Body: { ids: [1, 2, 3] }
 */
router.post('/batch-delete', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({
        code: 400,
        message: '请选择要删除的商品',
        data: null
      });
    }
    
    await Cart.destroy({
      where: {
        id: ids,
        user_id: req.userId
      }
    });
    
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('批量删除失败:', error);
    res.json({
      code: 500,
      message: '删除失败',
      data: null
    });
  }
});

/**
 * 清空购物车
 * DELETE /api/cart/clear
 */
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const deletedCount = await Cart.destroy({
      where: { user_id: req.userId }
    });
    
    console.log(`用户${req.userId}清空购物车，删除${deletedCount}个商品`);
    
    res.json({
      code: 200,
      message: '购物车已清空',
      data: { deletedCount }
    });
  } catch (error) {
    console.error('清空购物车失败:', error);
    res.json({
      code: 500,
      message: '清空失败',
      data: null
    });
  }
});

/**
 * 结算购物车（获取结算信息）
 * GET /api/cart/settle
 * Query: ids=1,2,3
 */
router.get('/settle', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.json({
        code: 400,
        message: '请选择要结算的商品',
        data: null
      });
    }
    
    const idArray = ids.split(',').map(id => parseInt(id));
    
    const cartItems = await Cart.findAll({
      where: {
        id: idArray,
        user_id: req.userId
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'cover', 'price', 'stock', 'status']
      }]
    });
    
    // 检查商品状态和库存
    const validItems = [];
    for (const item of cartItems) {
      if (!item.product || item.product.status !== 1) {
        continue;
      }
      
      if (item.product.stock < item.quantity) {
        return res.json({
          code: 400,
          message: `商品 ${item.product.name} 库存不足`,
          data: null
        });
      }
      
      validItems.push(item);
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: { items: validItems }
    });
  } catch (error) {
    console.error('获取结算信息失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

module.exports = router;
