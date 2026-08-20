// models/Seckill.js - 秒杀活动模型
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Seckill = sequelize.define('Seckill', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: '商品ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '秒杀标题'
    },
    seckill_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '秒杀价格'
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '原价'
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '秒杀库存'
    },
    sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '已售数量'
    },
    limit_per_user: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '每人限购数量'
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
    tableName: 'seckills',
    timestamps: false,
    indexes: [
      {
        fields: ['status', 'start_time', 'end_time']
      }
    ]
  });

  return Seckill;
};
