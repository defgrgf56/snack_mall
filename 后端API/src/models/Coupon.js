// src/models/Coupon.js - 优惠券模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '优惠券名称'
    },
    type: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '类型 1:满减 2:折扣 3:无门槛'
    },
    discount_type: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '优惠类型 1:金额 2:折扣'
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '优惠值(金额或折扣)'
    },
    min_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '最低消费金额'
    },
    total_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '发放总数 0:不限'
    },
    receive_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已领取数量'
    },
    used_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '已使用数量'
    },
    per_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '每人限领数量'
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间'
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结束时间'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 0:禁用 1:启用'
    }
  }, {
    tableName: 'coupons',
    timestamps: false,
    paranoid: false,
    comment: '优惠券表',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['start_time', 'end_time']
      }
    ]
  })

  return Coupon
}
