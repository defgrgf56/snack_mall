// src/models/OrderLog.js - 订单日志模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const OrderLog = sequelize.define('OrderLog', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    operator: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作人'
    },
    content: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '操作内容'
    }
  }, {
    tableName: 'order_logs',
    comment: '订单日志表',
    updatedAt: false,
    indexes: [
      {
        fields: ['order_id']
      }
    ]
  })

  return OrderLog
}
