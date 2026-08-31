// src/models/Feedback.js - 意见反馈模型
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      comment: '反馈ID'
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '用户ID'
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '反馈类型 1:功能建议 2:Bug反馈 3:产品咨询 4:投诉建议 5:其他'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '反馈内容'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '反馈图片'
    },
    contact: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '联系方式'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      allowNull: false,
      comment: '状态 1:待处理 2:处理中 3:已回复 4:已关闭'
    },
    reply: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '回复内容'
    },
    reply_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '回复时间'
    }
  }, {
    tableName: 'feedbacks',
    comment: '意见反馈表',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  })

  return Feedback
}