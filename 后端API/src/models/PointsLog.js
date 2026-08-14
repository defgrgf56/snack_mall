// src/models/PointsLog.js - 积分记录模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const PointsLog = sequelize.define('PointsLog', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '积分变动(正数为增加,负数为减少)'
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '类型 1:签到 2:消费 3:兑换 4:退款'
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: '关联订单ID'
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'points_logs',
    comment: '积分记录表',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['created_at']
      }
    ]
  })

  return PointsLog
}
