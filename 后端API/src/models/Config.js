// src/models/Config.js - 系统配置模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Config = sequelize.define('Config', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '配置键'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '配置值'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '描述'
    }
  }, {
    tableName: 'configs',
    comment: '系统配置表',
    indexes: [
      {
        unique: true,
        fields: ['key']
      }
    ]
  })

  return Config
}
