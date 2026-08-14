// src/models/Cart.js - 购物车模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '数量'
    },
    selected: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '是否选中'
    }
  }, {
    tableName: 'cart',
    comment: '购物车表',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'product_id']
      }
    ]
  })

  return Cart
}
