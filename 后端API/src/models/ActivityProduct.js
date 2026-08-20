// models/ActivityProduct.js - 活动商品关联模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityProduct = sequelize.define('ActivityProduct', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '活动ID'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      comment: '折扣（如8.5表示8.5折）'
    },
    special_price: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '活动价格'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'activity_products',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['activity_id', 'product_id']
      }
    ]
  });

  return ActivityProduct;
};
