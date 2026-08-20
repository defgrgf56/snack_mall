// src/routes/review.js - 评价路由
const express = require('express');
const router = express.Router();
const { Review, ReviewImage, Order, OrderItem, Product, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { sequelize } = require('../models');

/**
 * 提交评价
 * POST /api/reviews
 * Body: { order_item_id, rating, content, images: [], is_anonymous }
 */
router.post('/', authenticateToken, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { order_item_id, rating, content, images = [], is_anonymous = 0 } = req.body;
    
    // 验证必填字段
    if (!order_item_id || !rating) {
      await transaction.rollback();
      return res.json({
        code: 400,
        message: '订单商品ID和评分不能为空',
        data: null
      });
    }
    
    // 验证评分范围
    if (rating < 1 || rating > 5) {
      await transaction.rollback();
      return res.json({
        code: 400,
        message: '评分必须在1-5之间',
        data: null
      });
    }
    
    // 查询订单商品
    const orderItem = await OrderItem.findOne({
      where: { id: order_item_id },
      include: [{
        model: Order,
        as: 'order',
        where: { user_id: req.userId }
      }]
    });
    
    if (!orderItem) {
      await transaction.rollback();
      return res.json({
        code: 404,
        message: '订单商品不存在',
        data: null
      });
    }
    
    // 检查订单状态（只有已完成的订单才能评价）
    if (orderItem.order.status !== 4) {
      await transaction.rollback();
      return res.json({
        code: 400,
        message: '订单未完成，暂不能评价',
        data: null
      });
    }
    
    // 检查是否已评价
    const existReview = await Review.findOne({
      where: { order_item_id }
    });
    
    if (existReview) {
      await transaction.rollback();
      return res.json({
        code: 400,
        message: '该商品已评价',
        data: null
      });
    }
    
    // 创建评价
    const review = await Review.create({
      order_id: orderItem.order_id,
      order_item_id,
      user_id: req.userId,
      product_id: orderItem.product_id,
      rating,
      content: content || '',
      is_anonymous,
      status: 1, // 自动通过审核
      is_show: 1
    }, { transaction });
    
    // 保存评价图片
    if (images && images.length > 0) {
      const imageRecords = images.map((url, index) => ({
        review_id: review.id,
        image_url: url,
        sort: index
      }));
      
      await ReviewImage.bulkCreate(imageRecords, { transaction });
    }
    
    // 更新订单商品评价状态
    await OrderItem.update(
      { is_reviewed: 1 },
      { where: { id: order_item_id }, transaction }
    );
    
    await transaction.commit();
    
    res.json({
      code: 200,
      message: '评价成功',
      data: { review_id: review.id }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('提交评价失败:', error);
    res.json({
      code: 500,
      message: '评价失败',
      data: null
    });
  }
});

/**
 * 获取商品评价列表
 * GET /api/reviews/product/:product_id
 * Query: page, pageSize, rating (评分筛选：1-5，不传则全部)
 */
router.get('/product/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    const { page = 1, pageSize = 10, rating } = req.query;
    const offset = (page - 1) * pageSize;
    
    const where = {
      product_id,
      status: 1, // 已通过审核
      is_show: 1 // 显示
    };
    
    // 如果有评分筛选
    if (rating) {
      where.rating = parseInt(rating);
    }
    
    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar']
        },
        {
          model: ReviewImage,
          as: 'images',
          attributes: ['id', 'image_url'],
          order: [['sort', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset
    });
    
    // 处理匿名用户
    const formattedReviews = reviews.map(review => {
      const reviewData = review.toJSON();
      
      if (reviewData.is_anonymous === 1) {
        reviewData.user = {
          id: 0,
          nickname: '匿名用户',
          avatar: ''
        };
      }
      
      return reviewData;
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: formattedReviews,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(count / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取评价列表失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取商品评价统计
 * GET /api/reviews/product/:product_id/stats
 */
router.get('/product/:product_id/stats', async (req, res) => {
  try {
    const { product_id } = req.params;
    
    // 总评价数
    const totalCount = await Review.count({
      where: {
        product_id,
        status: 1,
        is_show: 1
      }
    });
    
    // 好评数（4-5星）
    const goodCount = await Review.count({
      where: {
        product_id,
        status: 1,
        is_show: 1,
        rating: { [require('sequelize').Op.gte]: 4 }
      }
    });
    
    // 各星级数量
    const ratingStats = await Promise.all([1, 2, 3, 4, 5].map(async (rating) => {
      const count = await Review.count({
        where: {
          product_id,
          status: 1,
          is_show: 1,
          rating
        }
      });
      return { rating, count };
    }));
    
    // 有图评价数
    const imageCount = await Review.count({
      where: {
        product_id,
        status: 1,
        is_show: 1
      },
      include: [{
        model: ReviewImage,
        as: 'images',
        required: true
      }]
    });
    
    // 计算好评率
    const goodRate = totalCount > 0 ? ((goodCount / totalCount) * 100).toFixed(1) : 0;
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        total: totalCount,
        goodCount,
        goodRate: parseFloat(goodRate),
        imageCount,
        ratingStats
      }
    });
  } catch (error) {
    console.error('获取评价统计失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取我的待评价订单商品列表
 * GET /api/reviews/pending
 */
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    // 查询已完成但未评价的订单商品
    const orderItems = await OrderItem.findAll({
      where: {
        is_reviewed: 0
      },
      include: [
        {
          model: Order,
          as: 'order',
          where: {
            user_id: req.userId,
            status: 4 // 已完成
          },
          attributes: ['id', 'order_no', 'status', 'created_at']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'cover', 'price']
        }
      ],
      order: [[{ model: Order, as: 'order' }, 'created_at', 'DESC']]
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: orderItems
    });
  } catch (error) {
    console.error('获取待评价列表失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取我的评价列表
 * GET /api/reviews/my
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'cover']
        },
        {
          model: ReviewImage,
          as: 'images',
          attributes: ['id', 'image_url'],
          order: [['sort', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset
    });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: reviews,
        pagination: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(count / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取我的评价失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 商家回复评价（管理员权限）
 * PUT /api/reviews/:id/reply
 * Body: { reply_content }
 */
router.put('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply_content } = req.body;
    
    if (!reply_content) {
      return res.json({
        code: 400,
        message: '回复内容不能为空',
        data: null
      });
    }
    
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.json({
        code: 404,
        message: '评价不存在',
        data: null
      });
    }
    
    await review.update({
      reply_content,
      reply_time: new Date()
    });
    
    res.json({
      code: 200,
      message: '回复成功',
      data: null
    });
  } catch (error) {
    console.error('回复评价失败:', error);
    res.json({
      code: 500,
      message: '回复失败',
      data: null
    });
  }
});

/**
 * 点赞评价
 * POST /api/reviews/:id/like
 */
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.json({
        code: 404,
        message: '评价不存在',
        data: null
      });
    }
    
    await review.increment('likes', { by: 1 });
    
    res.json({
      code: 200,
      message: '点赞成功',
      data: { likes: review.likes + 1 }
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.json({
      code: 500,
      message: '点赞失败',
      data: null
    });
  }
});

module.exports = router;
