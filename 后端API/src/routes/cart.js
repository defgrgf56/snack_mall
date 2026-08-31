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
    console.log(`[购物车] 用户${req.userId}请求购物车列表`);
    const { sequelize } = require('../models');
    
    // 使用原生SQL查询，关联活动价格
    const cartItems = await sequelize.query(`
      SELECT 
        c.id,
        c.user_id,
        c.product_id,
        c.quantity,
        c.selected,
        c.created_at,
        c.updated_at,
        p.id as 'product.id',
        p.name as 'product.name',
        p.cover as 'product.cover',
        p.price as 'product.price',
        p.stock as 'product.stock',
        p.status as 'product.status',
        COALESCE(
          MIN(
            CASE 
              WHEN ap.special_price IS NOT NULL THEN ap.special_price
              WHEN ap.discount IS NOT NULL THEN ROUND(p.price * ap.discount / 10, 2)
              ELSE NULL
            END
          ),
          p.price
        ) as actual_price,
        CASE 
          WHEN MIN(ap.activity_id) IS NOT NULL THEN 1
          ELSE 0
        END as has_activity
      FROM cart c
      LEFT JOIN products p ON c.product_id = p.id
      LEFT JOIN activity_products ap ON (
        ap.product_id = c.product_id
        AND ap.activity_id IN (
          SELECT id FROM activities 
          WHERE status = 1 
          AND NOW() BETWEEN start_time AND end_time
        )
      )
      WHERE c.user_id = ?
        AND p.status = 1
      GROUP BY c.id, c.user_id, c.product_id, c.quantity, c.selected, c.created_at, c.updated_at,
               p.id, p.name, p.cover, p.price, p.stock, p.status
      ORDER BY c.created_at DESC
    `, {
      replacements: [req.userId],
      type: sequelize.QueryTypes.SELECT
    });
    
    // 转换嵌套结构
    const formattedItems = cartItems.map(item => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      quantity: item.quantity,
      selected: item.selected,
      created_at: item.created_at,
      updated_at: item.updated_at,
      actual_price: parseFloat(item.actual_price),
      has_activity: item.has_activity === 1,
      product: {
        id: item['product.id'],
        name: item['product.name'],
        cover: item['product.cover'],
        price: parseFloat(item['product.price']),
        stock: item['product.stock'],
        status: item['product.status']
      }
    }));
    
    console.log(`[购物车] 用户${req.userId}查询成功，共${formattedItems.length}个商品`);
    
    res.json({
      code: 200,
      message: 'success',
      data: formattedItems
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
    // 获取购物车已选中的商品
    const cartItems = await Cart.findAll({
      where: { 
        user_id: req.userId,
        selected: 1  // 只统计选中的商品
      },
      attributes: ['quantity']
    });
    
    // 计算选中商品总数量（累加所有选中商品的quantity）
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log(`用户${req.userId}购物车: ${cartItems.length}种选中商品, 总数量${count}`);
    
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
    
    // 查找是否已存在该商品
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
      
      // 更新数量，并将商品设为选中状态
      await existingCart.update({ 
        quantity: newQuantity,
        selected: 1  // 再次加入购物车时自动选中
      });
      
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
 * 批量更新购物车选中状态
 * PUT /api/cart/batch-selected
 * Body: { ids: [1, 2, 3], selected }
 */
router.put('/batch-selected', authenticateToken, async (req, res) => {
  try {
    const { ids, selected } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({
        code: 400,
        message: '请选择要更新的商品',
        data: null
      });
    }
    
    if (typeof selected !== 'number' || (selected !== 0 && selected !== 1)) {
      return res.json({
        code: 400,
        message: '选中状态无效',
        data: null
      });
    }
    
    await Cart.update(
      { selected },
      {
        where: {
          id: ids,
          user_id: req.userId
        }
      }
    );
    
    res.json({
      code: 200,
      message: '更新成功',
      data: null
    });
  } catch (error) {
    console.error('批量更新选中状态失败:', error);
    res.json({
      code: 500,
      message: '更新失败',
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
 * 更新购物车选中状态
 * PUT /api/cart/:id/selected
 * Body: { selected }
 */
router.put('/:id/selected', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { selected } = req.body;
    
    if (typeof selected !== 'number' || (selected !== 0 && selected !== 1)) {
      return res.json({
        code: 400,
        message: '选中状态无效',
        data: null
      });
    }
    
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
    
    await cartItem.update({ selected });
    
    res.json({
      code: 200,
      message: '更新成功',
      data: cartItem
    });
  } catch (error) {
    console.error('更新购物车选中状态失败:', error);
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
