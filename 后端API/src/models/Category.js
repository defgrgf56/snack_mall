// src/models/Category.js - 商品分类模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '父分类ID 0为顶级'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '分类名称'
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '分类图标'
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
    tableName: 'categories',
    timestamps: false, // 禁用自动时间戳
    paranoid: false, // 禁用软删除
    comment: '商品分类表',
    indexes: [
      {
        fields: ['parent_id']
      },
      {
        fields: ['sort']
      }
    ]
  })

  return Category
}
