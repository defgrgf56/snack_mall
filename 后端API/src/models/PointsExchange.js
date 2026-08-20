// models/PointsExchange.js - 积分兑换记录模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PointsExchange = sequelize.define('PointsExchange', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '用户ID'
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '商品ID'
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称'
    },
    product_cover: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '商品封面'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '消耗积分'
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '兑换数量'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态（0-待发货 1-已发货 2-已完成）'
    },
    address_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      comment: '收货地址ID'
    },
    express_company: {
      type: DataTypes.STRING(100),
      comment: '快递公司'
    },
    express_no: {
      type: DataTypes.STRING(100),
      comment: '快递单号'
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
    tableName: 'points_exchanges',
    timestamps: false
  });

  return PointsExchange;
};
