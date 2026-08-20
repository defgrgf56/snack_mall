// models/PointsTransfer.js - 积分转赠模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PointsTransfer = sequelize.define('PointsTransfer', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    from_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '转出用户ID'
    },
    to_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '转入用户ID'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '转赠积分数'
    },
    message: {
      type: DataTypes.STRING(200),
      comment: '留言'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态（1-成功 2-已撤回）'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'points_transfers',
    timestamps: false
  });

  return PointsTransfer;
};
