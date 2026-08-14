// src/models/Banner.js - 轮播图模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Banner = sequelize.define('Banner', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '标题'
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '图片URL'
    },
    link_type: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '链接类型 1:商品 2:分类 3:外链'
    },
    link_value: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '链接值'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 0:禁用 1:启用'
    }
  }, {
    tableName: 'banners',
    timestamps: false,
    paranoid: false,
    comment: '轮播图表',
    indexes: [
      {
        fields: ['sort']
      },
      {
        fields: ['status']
      }
    ]
  })

  return Banner
}
