// src/models/User.js - 用户模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    openid: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '微信OpenID'
    },
    unionid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '微信UnionID'
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '昵称'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像URL'
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: true,
      comment: '手机号'
    },
    gender: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '性别 0:未知 1:男 2:女'
    },
    level: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
      comment: '会员等级 1-5'
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: '积分余额'
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false,
      comment: '账户余额'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
      comment: '状态 0:禁用 1:正常'
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    }
  }, {
    tableName: 'users',
    comment: '用户表',
    indexes: [
      {
        unique: true,
        fields: ['openid']
      },
      {
        fields: ['phone']
      }
    ]
  })

  // 实例方法
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get())
    // 不返回敏感信息
    delete values.deleted_at
    return values
  }

  return User
}
