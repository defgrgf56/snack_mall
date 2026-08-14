// src/models/UserCoupon.js - 用户优惠券模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const UserCoupon = sequelize.define('UserCoupon', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    coupon_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: '使用的订单ID'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态 0:未使用 1:已使用 2:已过期'
    },
    receive_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '领取时间'
    },
    use_time: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '使用时间'
    },
    expire_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '过期时间'
    }
  }, {
    tableName: 'user_coupons',
    comment: '用户优惠券表',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['coupon_id']
      },
      {
        fields: ['status']
      }
    ]
  })

  return UserCoupon
}
