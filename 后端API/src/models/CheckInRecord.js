// models/CheckInRecord.js - 签到记录模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CheckInRecord = sequelize.define('CheckInRecord', {
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
    check_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '签到日期'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '获得积分'
    },
    continuous_days: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '连续签到天数'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'check_in_records',
    timestamps: false
  });

  return CheckInRecord;
};
