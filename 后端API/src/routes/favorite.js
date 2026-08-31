// src/routes/favorite.js - 商品收藏路由
const express = require('express');
const router = express.Router();
const { Favorite, Product, ProductImage, ActivityProduct } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');
const { success, error } = require('../utils/response');

/**
 * 添加收藏
 * POST /api/favorites
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return error(res, '商品ID不能为空', 400);
    }

    // 检查商品是否存在
    const product = await Product.findByPk(product_id);
    if (!product) {
      return error(res, '商品不存在', 404);
    }

    // 检查是否已收藏
    const existFavorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        product_id
      }
    });

    if (existFavorite) {
      return error(res, '已收藏该商品', 400);
    }

    // 添加收藏
    const favorite = await Favorite.create({
      user_id: req.user.id,
      product_id
    });

    success(res, { 
      id: favorite.id,
      product_id: favorite.product_id 
    }, '收藏成功');

  } catch (err) {
    console.error('添加收藏失败:', err);
    error(res, '添加收藏失败', 500);
  }
});

/**
 * 取消收藏
 * DELETE /api/favorites/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!favorite) {
      return error(res, '收藏记录不存在', 404);
    }

    await favorite.destroy();

    success(res, null, '取消收藏成功');

  } catch (err) {
    console.error('取消收藏失败:', err);
    error(res, '取消收藏失败', 500);
  }
});

/**
 * 根据商品ID取消收藏
 * DELETE /api/favorites/product/:productId
 */
router.delete('/product/:productId', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        product_id: req.params.productId
      }
    });

    if (!favorite) {
      return error(res, '收藏记录不存在', 404);
    }

    await favorite.destroy();

    success(res, null, '取消收藏成功');

  } catch (err) {
    console.error('取消收藏失败:', err);
    error(res, '取消收藏失败', 500);
  }
});

/**
 * 获取收藏列表
 * GET /api/favorites
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'cover', 'price', 'original_price', 'stock', 'sales', 'status'],
          include: [
            {
              model: ProductImage,
              as: 'images',
              attributes: ['id', 'url'],
              limit: 1
            },
            {
              model: ActivityProduct,
              as: 'activityProducts',
              required: false,
              attributes: ['activity_id', 'discount', 'special_price'],
              include: [{
                association: 'activity',
                required: true,
                attributes: ['id', 'title', 'start_time', 'end_time', 'status'],
                where: {
                  status: 1,
                  start_time: { [Op.lte]: new Date() },
                  end_time: { [Op.gte]: new Date() }
                }
              }]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    // 过滤掉商品已下架的收藏，并计算实际价格
    const list = rows
      .filter(item => item.product && item.product.status === 1)
      .map(item => {
        const product = item.product;
        let actual_price = product.price;
        let has_activity = false;

        // 如果有活动价格，计算实际价格（activityProducts是数组，取第一个有效的活动）
        const activityProduct = product.activityProducts && product.activityProducts.length > 0 
          ? product.activityProducts[0] 
          : null;
        
        if (activityProduct && activityProduct.activity) {
          has_activity = true;
          if (activityProduct.special_price) {
            actual_price = activityProduct.special_price;
          } else if (activityProduct.discount) {
            actual_price = (product.price * activityProduct.discount / 10).toFixed(2);
          }
        }

        return {
          id: item.id,
          product_id: item.product_id,
          created_at: item.created_at,
          product: {
            id: product.id,
            name: product.name,
            cover: product.cover,
            price: product.price,
            original_price: product.original_price,
            actual_price: parseFloat(actual_price),
            has_activity,
            stock: product.stock,
            sales: product.sales
          }
        };
      });

    success(res, {
      list,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / pageSize)
      }
    });

  } catch (err) {
    console.error('获取收藏列表失败:', err);
    error(res, '获取收藏列表失败', 500);
  }
});

/**
 * 检查商品是否已收藏
 * GET /api/favorites/check/:productId
 */
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        product_id: req.params.productId
      }
    });

    success(res, {
      is_favorited: !!favorite,
      favorite_id: favorite ? favorite.id : null
    });

  } catch (err) {
    console.error('检查收藏状态失败:', err);
    error(res, '检查收藏状态失败', 500);
  }
});

/**
 * 获取收藏数量
 * GET /api/favorites/count
 */
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const count = await Favorite.count({
      where: { user_id: req.user.id }
    });

    success(res, { count });

  } catch (err) {
    console.error('获取收藏数量失败:', err);
    error(res, '获取收藏数量失败', 500);
  }
});

/**
 * 批量删除收藏
 * POST /api/favorites/batch-delete
 */
router.post('/batch-delete', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return error(res, '请选择要删除的收藏', 400);
    }

    await Favorite.destroy({
      where: {
        id: ids,
        user_id: req.user.id
      }
    });

    success(res, null, '批量删除成功');

  } catch (err) {
    console.error('批量删除失败:', err);
    error(res, '批量删除失败', 500);
  }
});

module.exports = router;
