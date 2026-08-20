// models/LotteryActivity.js - 抽奖活动模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LotteryActivity = sequelize.define('LotteryActivity', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '活动名称'
    },
    cover: {
      type: DataTypes.STRING(500),
      comment: '活动封面图'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '活动描述'
    },
    points_per_draw: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      comment: '每次抽奖消耗积分'
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间'
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结束时间'
    },
    daily_limit: {
      type: DataTypes.INTEGER,
      comment: '每日抽奖次数限制'
    },
    total_limit: {
      type: DataTypes.INTEGER,
      comment: '总抽奖次数限制'
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
    tableName: 'lottery_activities',
    timestamps: false
  });

  return LotteryActivity;
};
