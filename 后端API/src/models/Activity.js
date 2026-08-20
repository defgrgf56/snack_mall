// models/Activity.js - 活动专区模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '活动标题'
    },
    subtitle: {
      type: DataTypes.STRING(255),
      comment: '活动副标题'
    },
    cover: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '活动封面图'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '活动类型：festival-节日促销 newbie-新人专享 vip-会员专区 group-拼团活动'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '活动描述'
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
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：0-已结束 1-进行中 2-未开始'
    },
    link_type: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '链接类型：1-商品列表 2-外部链接 3-活动页面'
    },
    link_value: {
      type: DataTypes.TEXT,
      comment: '链接值'
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
    tableName: 'activities',
    timestamps: false,
    indexes: [
      {
        fields: ['status', 'start_time', 'end_time']
      },
      {
        fields: ['type']
      }
    ]
  });

  return Activity;
};
