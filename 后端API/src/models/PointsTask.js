// models/PointsTask.js - 积分任务模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PointsTask = sequelize.define('PointsTask', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '任务名称'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '任务描述'
    },
    icon: {
      type: DataTypes.STRING(500),
      comment: '任务图标'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '任务类型（daily-每日 weekly-每周 once-一次性）'
    },
    task_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: '任务标识'
    },
    target_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '目标完成次数'
    },
    points_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '完成奖励积分'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态（0-禁用 1-启用）'
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
    tableName: 'points_tasks',
    timestamps: false
  });

  return PointsTask;
};
