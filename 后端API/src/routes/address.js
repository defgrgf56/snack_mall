// src/routes/address.js - 地址管理路由
const express = require('express');
const router = express.Router();
const { Address } = require('../models');
const { authenticateToken } = require('../middleware/auth');

function formatAddress(address) {
  if (!address) return null;
  const data = address.toJSON ? address.toJSON() : address;
  return {
    ...data,
    detail: data.address
  };
}

function formatAddressList(addresses) {
  return addresses.map(formatAddress);
}

function normalizeIsDefault(value) {
  return value === 1 || value === true ? 1 : 0;
}

/**
 * 获取地址列表
 * GET /api/addresses
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.userId },
      order: [
        ['is_default', 'DESC'],
        ['created_at', 'DESC']
      ]
    });
    
    res.json({
      code: 200,
      message: 'success',
      data: formatAddressList(addresses)
    });
  } catch (error) {
    console.error('获取地址列表失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取默认地址
 * GET /api/addresses/default
 */
router.get('/default', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        user_id: req.userId,
        is_default: 1
      }
    });
    
    res.json({
      code: 200,
      message: 'success',
      data: formatAddress(address)
    });
  } catch (error) {
    console.error('获取默认地址失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 获取地址详情
 * GET /api/addresses/:id
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOne({
      where: { id, user_id: req.userId }
    });
    
    if (!address) {
      return res.json({
        code: 404,
        message: '地址不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      message: 'success',
      data: formatAddress(address)
    });
  } catch (error) {
    console.error('获取地址详情失败:', error);
    res.json({
      code: 500,
      message: '获取失败',
      data: null
    });
  }
});

/**
 * 创建地址
 * POST /api/addresses
 * Body: { consignee, phone, province, city, district, detail, is_default }
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { consignee, phone, province, city, district, detail, is_default = 0 } = req.body;
    
    // 验证必填字段
    if (!consignee || !phone || !province || !city || !district || !detail) {
      return res.json({
        code: 400,
        message: '请填写完整的地址信息',
        data: null
      });
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({
        code: 400,
        message: '手机号格式不正确',
        data: null
      });
    }
    
    const isDefault = normalizeIsDefault(is_default);

    // 如果设置为默认地址，取消其他默认地址
    if (isDefault === 1) {
      await Address.update(
        { is_default: 0 },
        { where: { user_id: req.userId } }
      );
    }

    // 创建地址
    const address = await Address.create({
      user_id: req.userId,
      consignee,
      phone,
      province,
      city,
      district,
      address: detail,
      is_default: isDefault
    });

    res.json({
      code: 200,
      message: '添加成功',
      data: formatAddress(address)
    });
  } catch (error) {
    console.error('创建地址失败:', error);
    res.json({
      code: 500,
      message: '添加失败',
      data: null
    });
  }
});

/**
 * 更新地址
 * PUT /api/addresses/:id
 * Body: { consignee, phone, province, city, district, detail, is_default }
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { consignee, phone, province, city, district, detail, is_default } = req.body;
    
    const address = await Address.findOne({
      where: { id, user_id: req.userId }
    });
    
    if (!address) {
      return res.json({
        code: 404,
        message: '地址不存在',
        data: null
      });
    }
    
    // 验证手机号格式
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({
        code: 400,
        message: '手机号格式不正确',
        data: null
      });
    }
    
    // 如果设置为默认地址，取消其他默认地址
    if (is_default !== undefined && normalizeIsDefault(is_default) === 1) {
      await Address.update(
        { is_default: 0 },
        { where: { user_id: req.userId, id: { [require('sequelize').Op.ne]: id } } }
      );
    }

    // 更新地址
    await address.update({
      consignee: consignee || address.consignee,
      phone: phone || address.phone,
      province: province || address.province,
      city: city || address.city,
      district: district || address.district,
      address: detail || address.address,
      is_default: is_default !== undefined ? normalizeIsDefault(is_default) : address.is_default
    });

    res.json({
      code: 200,
      message: '更新成功',
      data: formatAddress(address)
    });
  } catch (error) {
    console.error('更新地址失败:', error);
    res.json({
      code: 500,
      message: '更新失败',
      data: null
    });
  }
});

/**
 * 删除地址
 * DELETE /api/addresses/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOne({
      where: { id, user_id: req.userId }
    });
    
    if (!address) {
      return res.json({
        code: 404,
        message: '地址不存在',
        data: null
      });
    }
    
    await address.destroy();
    
    res.json({
      code: 200,
      message: '删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除地址失败:', error);
    res.json({
      code: 500,
      message: '删除失败',
      data: null
    });
  }
});

/**
 * 设置默认地址
 * PUT /api/addresses/:id/default
 */
router.put('/:id/default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOne({
      where: { id, user_id: req.userId }
    });
    
    if (!address) {
      return res.json({
        code: 404,
        message: '地址不存在',
        data: null
      });
    }
    
    // 取消其他默认地址
    await Address.update(
      { is_default: 0 },
      { where: { user_id: req.userId } }
    );
    
    // 设置为默认地址
    await address.update({ is_default: 1 });
    
    res.json({
      code: 200,
      message: '设置成功',
      data: formatAddress(address)
    });
  } catch (error) {
    console.error('设置默认地址失败:', error);
    res.json({
      code: 500,
      message: '设置失败',
      data: null
    });
  }
});

module.exports = router;
