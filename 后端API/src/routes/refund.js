// src/routes/refund.js - 退款路由
const express = require('express');
const router = express.Router();
const { Refund, RefundLog, Order, OrderItem, Product, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 申请退款
 * POST /api/refunds
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      order_id,
      refund_type,
      refund_reason,
      refund_desc,
      refund_images
    } = req.body;

    // 验证参数
    if (!order_id || !refund_type || !refund_reason) {
      return error(res, '缺少必要参数', 400);
    }

    // 查询订单
    const order = await Order.findOne({
      where: { 
        id: order_id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return error(res, '订单不存在', 404);
    }

    // 检查订单状态(只有已支付、已发货、已完成的订单可以申请退款)
    if (![1, 2, 3].includes(order.status)) {
      return error(res, '订单状态不允许申请退款', 400);
    }

    // 检查是否已有退款申请
    const existRefund = await Refund.findOne({
      where: {
        order_id: order_id,
        status: {
          [Op.notIn]: [2, 5] // 排除已拒绝和已取消的
        }
      }
    });

    if (existRefund) {
      return error(res, '该订单已有退款申请', 400);
    }

    // 生成退款单号
    const refund_no = Refund.generateRefundNo();

    // 创建退款申请
    const refund = await Refund.create({
      refund_no,
      order_id,
      user_id: req.user.id,
      refund_type,
      refund_reason,
      refund_amount: order.pay_amount,
      refund_desc,
      refund_images: refund_images || null,
      status: 0 // 待审核
    });

    // 创建退款日志
    await RefundLog.create({
      refund_id: refund.id,
      status: 0,
      operator: req.user.nickname || '用户',
      remark: '提交退款申请'
    });

    // 更新订单状态为退款中
    await order.update({ status: 5 });

    success(res, {
      id: refund.id,
      refund_no: refund.refund_no
    }, '退款申请已提交');

  } catch (err) {
    console.error('申请退款失败:', err);
    error(res, '申请退款失败', 500);
  }
});

/**
 * 获取退款列表
 * GET /api/refunds
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;

    const where = { user_id: req.user.id };
    if (status !== undefined) {
      where.status = parseInt(status);
    }

    const { count, rows } = await Refund.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_no', 'total_amount'],
          include: [
            {
              model: OrderItem,
              as: 'items',
              attributes: ['product_name', 'product_cover', 'quantity'],
              limit: 1
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    // 格式化数据
    const list = rows.map(refund => ({
      id: refund.id,
      refund_no: refund.refund_no,
      order_id: refund.order_id,
      order_no: refund.order?.order_no,
      refund_type: refund.refund_type,
      refund_type_text: Refund.TYPE_TEXT[refund.refund_type],
      refund_reason: refund.refund_reason,
      refund_amount: refund.refund_amount,
      status: refund.status,
      status_text: Refund.STATUS_TEXT[refund.status],
      created_at: refund.created_at,
      product_cover: refund.order?.items?.[0]?.product_cover,
      product_name: refund.order?.items?.[0]?.product_name
    }));

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
    console.error('获取退款列表失败:', err);
    error(res, '获取退款列表失败', 500);
  }
});

/**
 * 获取退款详情
 * GET /api/refunds/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const refund = await Refund.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_no', 'total_amount', 'consignee', 'phone'],
          include: [
            {
              model: OrderItem,
              as: 'items',
              attributes: ['product_id', 'product_name', 'product_cover', 'price', 'quantity']
            }
          ]
        },
        {
          model: RefundLog,
          as: 'logs',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!refund) {
      return error(res, '退款记录不存在', 404);
    }

    success(res, {
      id: refund.id,
      refund_no: refund.refund_no,
      order_id: refund.order_id,
      order_no: refund.order?.order_no,
      refund_type: refund.refund_type,
      refund_type_text: Refund.TYPE_TEXT[refund.refund_type],
      refund_reason: refund.refund_reason,
      refund_amount: refund.refund_amount,
      refund_desc: refund.refund_desc,
      refund_images: refund.refund_images,
      status: refund.status,
      status_text: Refund.STATUS_TEXT[refund.status],
      reject_reason: refund.reject_reason,
      admin_remark: refund.admin_remark,
      refund_time: refund.refund_time,
      created_at: refund.created_at,
      order: refund.order,
      logs: refund.logs
    });

  } catch (err) {
    console.error('获取退款详情失败:', err);
    error(res, '获取退款详情失败', 500);
  }
});

/**
 * 取消退款
 * PUT /api/refunds/:id/cancel
 */
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const refund = await Refund.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      include: [
        {
          model: Order,
          as: 'order'
        }
      ]
    });

    if (!refund) {
      return error(res, '退款记录不存在', 404);
    }

    // 只有待审核状态可以取消
    if (refund.status !== 0) {
      return error(res, '当前状态不允许取消', 400);
    }

    // 更新退款状态
    await refund.update({ status: 5 });

    // 创建日志
    await RefundLog.create({
      refund_id: refund.id,
      status: 5,
      operator: req.user.nickname || '用户',
      remark: '用户取消退款申请'
    });

    // 恢复订单状态
    if (refund.order) {
      await refund.order.update({ status: 3 }); // 恢复为已完成
    }

    success(res, null, '退款申请已取消');

  } catch (err) {
    console.error('取消退款失败:', err);
    error(res, '取消退款失败', 500);
  }
});

/**
 * 管理员审核退款
 * PUT /api/refunds/:id/review (需要管理员权限)
 */
router.put('/:id/review', authenticateToken, async (req, res) => {
  try {
    const { status, reject_reason, admin_remark } = req.body;

    // 验证参数
    if (![1, 2].includes(parseInt(status))) {
      return error(res, '状态参数错误', 400);
    }

    if (status == 2 && !reject_reason) {
      return error(res, '拒绝退款需要填写原因', 400);
    }

    const refund = await Refund.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order'
        }
      ]
    });

    if (!refund) {
      return error(res, '退款记录不存在', 404);
    }

    // 只有待审核状态可以审核
    if (refund.status !== 0) {
      return error(res, '当前状态不允许审核', 400);
    }

    // 更新退款状态
    const updateData = {
      status: parseInt(status),
      admin_remark
    };

    if (status == 2) {
      updateData.reject_reason = reject_reason;
      // 审核拒绝,恢复订单状态
      if (refund.order) {
        await refund.order.update({ status: 3 });
      }
    } else {
      // 审核通过,进入退款中状态
      updateData.status = 3;
    }

    await refund.update(updateData);

    // 创建日志
    await RefundLog.create({
      refund_id: refund.id,
      status: updateData.status,
      operator: req.user.username || '管理员',
      remark: status == 1 ? '审核通过' : `审核拒绝: ${reject_reason}`
    });

    // 如果审核通过,模拟退款成功
    if (status == 1) {
      setTimeout(async () => {
        await refund.update({
          status: 4,
          refund_time: new Date()
        });
        await RefundLog.create({
          refund_id: refund.id,
          status: 4,
          operator: '系统',
          remark: '退款成功'
        });
      }, 2000);
    }

    success(res, null, status == 1 ? '审核通过' : '审核拒绝');

  } catch (err) {
    console.error('审核退款失败:', err);
    error(res, '审核退款失败', 500);
  }
});

/**
 * 获取退款统计(管理员)
 * GET /api/refunds/stats
 */
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Refund.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      processing: 0,
      success: 0
    };

    stats.forEach(item => {
      result.total += parseInt(item.dataValues.count);
      switch (item.status) {
        case 0:
          result.pending = parseInt(item.dataValues.count);
          break;
        case 1:
          result.approved = parseInt(item.dataValues.count);
          break;
        case 2:
          result.rejected = parseInt(item.dataValues.count);
          break;
        case 3:
          result.processing = parseInt(item.dataValues.count);
          break;
        case 4:
          result.success = parseInt(item.dataValues.count);
          break;
      }
    });

    success(res, result);

  } catch (err) {
    console.error('获取退款统计失败:', err);
    error(res, '获取退款统计失败', 500);
  }
});

module.exports = router;
