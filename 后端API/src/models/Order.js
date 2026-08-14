// src/models/Order.js - 订单模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    order_no: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '订单号'
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '商品总额'
    },
    freight_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '运费'
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '优惠金额'
    },
    pay_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '实付金额'
    },
    pay_method: {
      type: DataTypes.TINYINT,
      allowNull: true,
      comment: '支付方式 1:微信 2:余额'
    },
    pay_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivery_type: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '配送方式 1:快递 2:自提'
    },
    consignee: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人'
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '订单状态 0:待支付 1:待发货 2:待收货 3:已完成 4:已取消 5:退款中 6:已退款'
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    coupon_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    points_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    points_earned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ship_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ship_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ship_company: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    finish_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancel_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancel_reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'orders',
    comment: '订单表',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['order_no']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  })

  return Order
}
