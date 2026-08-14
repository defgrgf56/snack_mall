// src/models/ProductImage.js - 商品图片模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const ProductImage = sequelize.define('ProductImage', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '图片URL'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    }
  }, {
    tableName: 'product_images',
    comment: '商品图片表',
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['product_id']
      }
    ]
  })

  return ProductImage
}
