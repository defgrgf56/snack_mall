// models/UserTaskProgress.js - 用户任务进度模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserTaskProgress = sequelize.define('UserTaskProgress', {
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
    task_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '任务ID'
    },
    current_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '当前完成次数'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态（0-进行中 1-已完成 2-已领取奖励）'
    },
    completed_at: {
      type: DataTypes.DATE,
      comment: '完成时间'
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
    tableName: 'user_task_progress',
    timestamps: false
  });

  return UserTaskProgress;
};
