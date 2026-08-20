// models/ReviewImage.js - 评价图片模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReviewImage = sequelize.define('ReviewImage', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    review_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '评价ID'
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '图片URL'
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
    tableName: 'review_images',
    timestamps: false,
    indexes: [
      {
        fields: ['review_id']
      }
    ]
  });

  return ReviewImage;
};
