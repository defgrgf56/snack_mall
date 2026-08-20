// src/routes/notification.js - 消息通知路由
const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { success, error } = require('../utils/response');

/**
 * 获取消息列表
 * GET /api/notifications
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type, is_read } = req.query;

    const where = { user_id: req.user.id };
    
    // 类型筛选
    if (type) {
      where.type = type;
    }
    
    // 已读状态筛选
    if (is_read !== undefined) {
      where.is_read = parseInt(is_read);
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    // 格式化数据
    const list = rows.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type,
      type_text: Notification.TYPE_TEXT[item.type],
      type_icon: Notification.TYPE_ICON[item.type],
      related_id: item.related_id,
      is_read: item.is_read,
      created_at: item.created_at
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
    console.error('获取消息列表失败:', err);
    error(res, '获取消息列表失败', 500);
  }
});

/**
 * 获取未读消息数量
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.id,
        is_read: 0
      }
    });

    success(res, { count });

  } catch (err) {
    console.error('获取未读消息数量失败:', err);
    error(res, '获取未读消息数量失败', 500);
  }
});

/**
 * 标记已读
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!notification) {
      return error(res, '消息不存在', 404);
    }

    await notification.update({ is_read: 1 });

    success(res, null, '标记成功');

  } catch (err) {
    console.error('标记已读失败:', err);
    error(res, '标记已读失败', 500);
  }
});

/**
 * 标记全部已读
 * PUT /api/notifications/read-all
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { is_read: 1 },
      {
        where: {
          user_id: req.user.id,
          is_read: 0
        }
      }
    );

    success(res, null, '全部已读');

  } catch (err) {
    console.error('标记全部已读失败:', err);
    error(res, '标记全部已读失败', 500);
  }
});

/**
 * 删除消息
 * DELETE /api/notifications/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!notification) {
      return error(res, '消息不存在', 404);
    }

    await notification.destroy();

    success(res, null, '删除成功');

  } catch (err) {
    console.error('删除消息失败:', err);
    error(res, '删除消息失败', 500);
  }
});

/**
 * 清空已读消息
 * DELETE /api/notifications/clear-read
 */
router.delete('/clear-read', authenticateToken, async (req, res) => {
  try {
    await Notification.destroy({
      where: {
        user_id: req.user.id,
        is_read: 1
      }
    });

    success(res, null, '清空成功');

  } catch (err) {
    console.error('清空消息失败:', err);
    error(res, '清空消息失败', 500);
  }
});

module.exports = router;
