// models/SearchHistory.js - 搜索历史模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SearchHistory = sequelize.define('SearchHistory', {
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
    keyword: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '搜索关键词'
    },
    search_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '搜索次数'
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
    tableName: 'search_history',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['keyword']
      },
      {
        fields: ['updated_at']
      },
      {
        unique: true,
        fields: ['user_id', 'keyword']
      }
    ]
  });

  return SearchHistory;
};
