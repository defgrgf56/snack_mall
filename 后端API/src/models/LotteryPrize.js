// models/LotteryPrize.js - 抽奖奖品模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LotteryPrize = sequelize.define('LotteryPrize', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    activity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '活动ID'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '奖品名称'
    },
    image: {
      type: DataTypes.STRING(500),
      comment: '奖品图片'
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '类型（1-积分 2-优惠券 3-实物 4-谢谢参与）'
    },
    value: {
      type: DataTypes.STRING(200),
      comment: '奖品价值'
    },
    probability: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: '中奖概率（百分比）'
    },
    stock: {
      type: DataTypes.INTEGER,
      comment: '库存数量'
    },
    win_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '中奖次数'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
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
    tableName: 'lottery_prizes',
    timestamps: false
  });

  return LotteryPrize;
};
