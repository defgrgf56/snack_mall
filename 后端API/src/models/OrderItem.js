// src/models/OrderItem.js - 订单商品模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商品名称(快照)'
    },
    product_cover: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '商品封面(快照)'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '商品单价'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '购买数量'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      comment: '小计金额'
    }
  }, {
    tableName: 'order_items',
    comment: '订单商品表',
    updatedAt: false,
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['product_id']
      }
    ]
  })

  return OrderItem
}
