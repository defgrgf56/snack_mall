// src/models/Address.js - 收货地址模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    consignee: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人'
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      comment: '电话'
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '详细地址'
    },
    is_default: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否默认'
    }
  }, {
    tableName: 'addresses',
    comment: '收货地址表',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  })

  return Address
}
