// models/Review.js - 商品评价模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '订单ID'
    },
    order_item_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '订单商品ID'
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
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 5,
      comment: '评分（1-5星）'
    },
    content: {
      type: DataTypes.TEXT,
      comment: '评价内容'
    },
    is_anonymous: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否匿名（0-否 1-是）'
    },
    reply_content: {
      type: DataTypes.TEXT,
      comment: '商家回复内容'
    },
    reply_time: {
      type: DataTypes.DATE,
      comment: '商家回复时间'
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '点赞数'
    },
    is_show: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '是否显示（0-隐藏 1-显示）'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态（0-待审核 1-已通过 2-已拒绝）'
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
    tableName: 'reviews',
    timestamps: false,
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Review;
};
