const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
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
      comment: '通知类型: order/activity/system'
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
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // 通知类型
  Notification.TYPE = {
    ORDER: 'order',           // 订单通知
    ACTIVITY: 'activity',     // 活动通知
    SYSTEM: 'system'          // 系统公告
  };

  // 通知类型文本
  Notification.TYPE_TEXT = {
    order: '订单通知',
    activity: '优惠活动',
    system: '系统公告'
  };

  // 通知类型图标
  Notification.TYPE_ICON = {
    order: '📦',
    activity: '🎉',
    system: '📢'
  };

  return Notification;
};
