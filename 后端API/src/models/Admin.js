// src/models/Admin.js - 管理员模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码(bcrypt加密)'
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '昵称'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像'
    },
    role: {
      type: DataTypes.TINYINT,
      defaultValue: 2,
      comment: '角色 1:超级管理员 2:普通管理员'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 0:禁用 1:启用'
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    },
    last_login_ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '最后登录IP'
    }
  }, {
    tableName: 'admins',
    comment: '管理员表',
    indexes: [
      {
        unique: true,
        fields: ['username']
      }
    ]
  })

  // 实例方法
  Admin.prototype.toJSON = function() {
    const values = Object.assign({}, this.get())
    // 不返回密码
    delete values.password
    delete values.deleted_at
    return values
  }

  return Admin
}
