// src/models/Product.js - 商品模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '商品ID'
    },
    category_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分类ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商品名称'
    },
    subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '副标题'
    },
    cover: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '封面图'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '商品描述'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
      comment: '售价'
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '原价'
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '成本价'
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: '库存数量'
    },
    sales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: '销量'
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: '件',
      comment: '单位'
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '重量(kg)'
    },
    tags: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '标签(JSON数组)'
    },
    is_hot: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
      comment: '是否热门'
    },
    is_new: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
      comment: '是否新品'
    },
    is_recommend: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
      comment: '是否推荐'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
      comment: '状态 0:下架 1:上架'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
    comment: '商品表',
    indexes: [
      {
        fields: ['category_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['is_hot']
      },
      {
        fields: ['is_new']
      }
    ]
  })

  return Product
}
