// src/models/AdminNotification.js - 管理员通知模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminNotification = sequelize.define('AdminNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '通知标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '通知内容'
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '通知类型: order/favorite/review/system'
    },
    related_id: {
      type: DataTypes.INTEGER,
      comment: '关联ID(订单ID等)'
    },
    is_read: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '是否已读: 0-未读 1-已读'
    }
  }, {
    tableName: 'admin_notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // 通知类型常量
  AdminNotification.TYPE = {
    ORDER: 'order',
    FAVORITE: 'favorite',
    REVIEW: 'review',
    SYSTEM: 'system'
  };

  return AdminNotification;
};