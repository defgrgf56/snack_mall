const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Refund = sequelize.define('Refund', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    refund_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '退款单号'
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    refund_type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '退款类型: 1-仅退款 2-退货退款'
    },
    refund_reason: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '退款原因'
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '退款金额'
    },
    refund_desc: {
      type: DataTypes.TEXT,
      comment: '退款说明'
    },
    refund_images: {
      type: DataTypes.JSON,
      comment: '退款凭证图片'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '状态: 0-待审核 1-审核通过 2-审核拒绝 3-退款中 4-退款成功 5-已取消'
    },
    reject_reason: {
      type: DataTypes.STRING(200),
      comment: '拒绝原因'
    },
    admin_remark: {
      type: DataTypes.STRING(500),
      comment: '管理员备注'
    },
    refund_time: {
      type: DataTypes.DATE,
      comment: '退款完成时间'
    }
  }, {
    tableName: 'refunds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // 退款日志模型
  const RefundLog = sequelize.define('RefundLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    refund_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '退款ID'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '状态'
    },
    operator: {
      type: DataTypes.STRING(50),
      comment: '操作人'
    },
    remark: {
      type: DataTypes.STRING(500),
      comment: '备注'
    }
  }, {
    tableName: 'refund_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  // 生成退款单号
  Refund.generateRefundNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `R${year}${month}${day}${random}`;
  };

  // 退款类型
  Refund.TYPE = {
    REFUND_ONLY: 1,      // 仅退款
    RETURN_REFUND: 2     // 退货退款
  };

  // 退款状态
  Refund.STATUS = {
    PENDING: 0,          // 待审核
    APPROVED: 1,         // 审核通过
    REJECTED: 2,         // 审核拒绝
    PROCESSING: 3,       // 退款中
    SUCCESS: 4,          // 退款成功
    CANCELLED: 5         // 已取消
  };

  // 退款状态文本
  Refund.STATUS_TEXT = {
    0: '待审核',
    1: '审核通过',
    2: '审核拒绝',
    3: '退款中',
    4: '退款成功',
    5: '已取消'
  };

  // 退款类型文本
  Refund.TYPE_TEXT = {
    1: '仅退款',
    2: '退货退款'
  };

  return { Refund, RefundLog };
};
