// models/SearchHot.js - 热门搜索模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SearchHot = sequelize.define('SearchHot', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    keyword: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '搜索关键词'
    },
    search_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '搜索次数'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序（数字越大越靠前）'
    },
    is_show: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '是否显示（0-隐藏 1-显示）'
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
    tableName: 'search_hot',
    timestamps: false,
    indexes: [
      {
        fields: ['search_count']
      },
      {
        fields: ['sort']
      }
    ]
  });

  return SearchHot;
};
