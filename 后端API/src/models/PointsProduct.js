// models/PointsProduct.js - 积分商品模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PointsProduct = sequelize.define('PointsProduct', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称'
    },
    cover: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '商品封面图'
    },
    images: {
      type: DataTypes.TEXT,
      comment: '商品图片（JSON数组）',
      get() {
        const value = this.getDataValue('images');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('images', JSON.stringify(value));
      }
    },
    description: {
      type: DataTypes.TEXT,
      comment: '商品描述'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '所需积分'
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '库存数量'
    },
    exchange_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '兑换次数'
    },
    limit_per_user: {
      type: DataTypes.INTEGER,
      comment: '每人限兑数量'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态（0-下架 1-上架）'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'points_products',
    timestamps: false
  });

  return PointsProduct;
};
