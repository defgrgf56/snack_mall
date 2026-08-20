// models/LotteryRecord.js - 抽奖记录模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LotteryRecord = sequelize.define('LotteryRecord', {
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
    activity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '活动ID'
    },
    prize_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '奖品ID'
    },
    prize_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '奖品名称'
    },
    prize_type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '奖品类型'
    },
    prize_value: {
      type: DataTypes.STRING(200),
      comment: '奖品价值'
    },
    points_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '消耗积分'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '状态（0-未领取 1-已领取）'
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
    tableName: 'lottery_records',
    timestamps: false
  });

  return LotteryRecord;
};
