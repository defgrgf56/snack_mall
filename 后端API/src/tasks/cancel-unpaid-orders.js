// src/tasks/cancel-unpaid-orders.js - 自动取消超时未支付订单
const { Order, OrderItem, Product, sequelize } = require('../models');

/**
 * 取消超时未支付的订单
 * 规则：待付款订单超过15分钟未支付，自动取消并恢复库存
 */
async function cancelUnpaidOrders() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('=== 开始检查超时未支付订单 ===');
    
    // 计算15分钟前的时间
    const timeoutDate = new Date(Date.now() - 15 * 60 * 1000);
    
    // 查找所有待付款且创建时间超过15分钟的订单
    const unpaidOrders = await Order.findAll({
      where: {
        status: 1, // 待付款
        created_at: {
          [sequelize.Sequelize.Op.lt]: timeoutDate
        }
      },
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });
    
    if (unpaidOrders.length === 0) {
      console.log('没有需要取消的超时订单');
      await transaction.commit();
      return { canceledCount: 0 };
    }
    
    console.log(`找到 ${unpaidOrders.length} 个超时未支付订单`);
    
    let canceledCount = 0;
    
    for (const order of unpaidOrders) {
      try {
        console.log(`取消订单: ${order.order_no}, 创建时间: ${order.created_at}`);
        
        // 更新订单状态为已取消
        await order.update({ 
          status: 5, // 已取消
          cancel_time: new Date(),
          cancel_reason: '超时未支付，系统自动取消'
        }, { transaction });
        
        // 恢复库存
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            await Product.increment('stock', {
              by: item.quantity,
              where: { id: item.product_id },
              transaction
            });
            console.log(`  - 恢复商品库存: ${item.product_name} +${item.quantity}`);
          }
        }
        
        // 如果使用了优惠券，恢复优惠券状态
        if (order.coupon_id) {
          const { UserCoupon } = require('../models');
          await UserCoupon.update(
            { 
              status: 0, // 恢复为未使用
              use_time: null,
              order_id: null
            },
            {
              where: { 
                id: order.coupon_id,
                order_id: order.id 
              },
              transaction
            }
          );
          console.log(`  - 恢复优惠券: ID ${order.coupon_id}`);
        }
        
        canceledCount++;
      } catch (error) {
        console.error(`取消订单 ${order.order_no} 失败:`, error);
        // 单个订单失败不影响其他订单
      }
    }
    
    await transaction.commit();
    
    console.log(`=== 完成订单取消，共取消 ${canceledCount} 个订单 ===`);
    
    return { canceledCount };
  } catch (error) {
    await transaction.rollback();
    console.error('自动取消订单任务失败:', error);
    throw error;
  }
}

/**
 * 启动定时任务（每分钟执行一次）
 */
function startSchedule() {
  console.log('订单超时取消任务已启动，每分钟检查一次');
  
  // 立即执行一次
  cancelUnpaidOrders().catch(err => {
    console.error('执行订单取消任务出错:', err);
  });
  
  // 每分钟执行一次
  setInterval(() => {
    cancelUnpaidOrders().catch(err => {
      console.error('执行订单取消任务出错:', err);
    });
  }, 60 * 1000); // 60秒
}

module.exports = {
  cancelUnpaidOrders,
  startSchedule
};