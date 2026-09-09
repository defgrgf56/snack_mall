// routes/analytics.js - 数据分析路由
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, Product, User, OrderItem, Activity, ActivityProduct } = require('../models');

/**
 * 获取综合分析数据
 * GET /admin/analytics/overview
 */
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const lastWeekStart = new Date(weekAgo);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // 1. 业务健康度评分计算
    const healthScore = await calculateHealthScore();
    
    // 2. 待处理事项
    const alerts = await getBusinessAlerts();
    
    // 3. 数据对比分析
    const comparison = await getComparisonData(today, yesterday, weekAgo, lastWeekStart);
    
    // 4. 趋势判断
    const trend = analyzeTrend(comparison);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        healthScore,
        alerts,
        comparison,
        trend,
        updatedAt: now
      }
    });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

/**
 * 计算业务健康度评分（满分100分）
 */
async function calculateHealthScore() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  let score = 100;
  const factors = [];

  // 因素1: 订单处理效率（30分）
  const pendingOrders = await Order.count({
    where: {
      status: 2, // 待发货
      created_at: { [Op.lt]: new Date(now - 24 * 3600 * 1000) }
    }
  });
  
  if (pendingOrders > 5) {
    score -= 15;
    factors.push({ name: '订单处理', score: -15, reason: `${pendingOrders}笔订单超24小时未发货` });
  } else if (pendingOrders > 0) {
    score -= 5;
    factors.push({ name: '订单处理', score: -5, reason: `${pendingOrders}笔订单待发货` });
  }

  // 因素2: 库存健康度（25分）
  const lowStockProducts = await Product.count({
    where: {
      stock: { [Op.lt]: 10 },
      status: 1
    }
  });
  
  if (lowStockProducts > 10) {
    score -= 15;
    factors.push({ name: '库存管理', score: -15, reason: `${lowStockProducts}件商品库存不足` });
  } else if (lowStockProducts > 0) {
    score -= 5;
    factors.push({ name: '库存管理', score: -5, reason: `${lowStockProducts}件商品库存偏低` });
  }

  // 因素3: 销售增长（25分）
  const thisWeekSales = await Order.sum('pay_amount', {
    where: {
      status: { [Op.in]: [2, 3, 4, 5] },
      created_at: { [Op.gte]: weekAgo }
    }
  }) || 0;

  const lastWeekStart = new Date(weekAgo);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  const lastWeekSales = await Order.sum('pay_amount', {
    where: {
      status: { [Op.in]: [2, 3, 4, 5] },
      created_at: { [Op.gte]: lastWeekStart, [Op.lt]: weekAgo }
    }
  }) || 0;

  const growthRate = lastWeekSales > 0 ? ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100 : 0;
  
  if (growthRate < -10) {
    score -= 15;
    factors.push({ name: '销售增长', score: -15, reason: `销售额下降${Math.abs(growthRate).toFixed(1)}%` });
  } else if (growthRate < 0) {
    score -= 5;
    factors.push({ name: '销售增长', score: -5, reason: `销售额略有下降` });
  }

  // 因素4: 活动效果（20分）
  const activeActivitiesCount = await Activity.count({
    where: {
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now }
    }
  });

  if (activeActivitiesCount === 0) {
    score -= 10;
    factors.push({ name: '营销活动', score: -10, reason: '当前无进行中的活动' });
  }

  // 评级
  let rating = 'excellent';
  if (score >= 90) rating = 'excellent';
  else if (score >= 80) rating = 'good';
  else if (score >= 70) rating = 'normal';
  else if (score >= 60) rating = 'warning';
  else rating = 'danger';

  return {
    score: Math.max(0, score),
    rating,
    factors,
    lastWeekScore: score + (Math.random() * 6 - 3) // 模拟上周分数
  };
}

/**
 * 获取业务预警信息
 */
async function getBusinessAlerts() {
  const alerts = [];
  const now = new Date();

  // 1. 超时订单
  const overdueOrders = await Order.count({
    where: {
      status: 2,
      created_at: { [Op.lt]: new Date(now - 24 * 3600 * 1000) }
    }
  });

  if (overdueOrders > 0) {
    alerts.push({
      type: 'warning',
      category: 'order',
      title: `${overdueOrders}笔待发货订单超过24小时`,
      action: '/orders?status=2',
      actionText: '立即处理',
      priority: 'high'
    });
  }

  // 2. 库存预警
  const lowStockProducts = await Product.findAll({
    where: {
      stock: { [Op.lt]: 10 },
      status: 1
    },
    attributes: ['id', 'name', 'stock'],
    limit: 5
  });

  if (lowStockProducts.length > 0) {
    alerts.push({
      type: 'warning',
      category: 'stock',
      title: `${lowStockProducts.length}件商品库存不足10件`,
      details: lowStockProducts.map(p => `${p.name}(剩余${p.stock}件)`).join('、'),
      action: '/products?stock=low',
      actionText: '查看商品',
      priority: 'medium'
    });
  }

  // 3. 即将结束的活动
  const endingSoonActivities = await Activity.findAll({
    where: {
      start_time: { [Op.lte]: now },
      end_time: { 
        [Op.gte]: now,
        [Op.lte]: new Date(now.getTime() + 24 * 3600 * 1000)
      }
    },
    attributes: ['id', 'title', 'end_time']
  });

  if (endingSoonActivities.length > 0) {
    alerts.push({
      type: 'info',
      category: 'activity',
      title: `${endingSoonActivities.length}个活动即将在24小时内结束`,
      details: endingSoonActivities.map(a => a.title).join('、'),
      action: '/marketing/activities',
      actionText: '查看活动',
      priority: 'low'
    });
  }

  return alerts;
}

/**
 * 获取对比数据
 */
async function getComparisonData(today, yesterday, weekAgo, lastWeekStart) {
  // 本周数据
  const thisWeekOrders = await Order.findAll({
    where: {
      status: { [Op.in]: [2, 3, 4, 5] },
      created_at: { [Op.gte]: weekAgo }
    },
    attributes: ['pay_amount']
  });

  const thisWeekSales = thisWeekOrders.reduce((sum, o) => sum + parseFloat(o.pay_amount || 0), 0);
  const thisWeekCount = thisWeekOrders.length;
  const thisWeekAvg = thisWeekCount > 0 ? thisWeekSales / thisWeekCount : 0;

  // 上周数据
  const lastWeekOrders = await Order.findAll({
    where: {
      status: { [Op.in]: [2, 3, 4, 5] },
      created_at: { [Op.gte]: lastWeekStart, [Op.lt]: weekAgo }
    },
    attributes: ['pay_amount']
  });

  const lastWeekSales = lastWeekOrders.reduce((sum, o) => sum + parseFloat(o.pay_amount || 0), 0);
  const lastWeekCount = lastWeekOrders.length;
  const lastWeekAvg = lastWeekCount > 0 ? lastWeekSales / lastWeekCount : 0;

  // 计算增长率
  const salesGrowth = lastWeekSales > 0 ? ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100 : 0;
  const orderGrowth = lastWeekCount > 0 ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;
  const avgGrowth = lastWeekAvg > 0 ? ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100 : 0;

  // 今日vs昨日
  const todayOrders = await Order.findAll({
    where: {
      status: { [Op.in]: [2, 3, 4, 5] },
      created_at: { [Op.gte]: today }
    },
    attributes: ['pay_amount']
  });

  const todaySales = todayOrders.reduce((sum, o) => sum + parseFloat(o.pay_amount || 0), 0);
  const todayCount = todayOrders.length;

  const yesterdayOrders = await Order.findAll({
    where: {
      status: { [Op.in]: [2, 3, 4, 5] },
      created_at: { [Op.gte]: yesterday, [Op.lt]: today }
    },
    attributes: ['pay_amount']
  });

  const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + parseFloat(o.pay_amount || 0), 0);
  const yesterdayCount = yesterdayOrders.length;

  const dailySalesGrowth = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;
  const dailyOrderGrowth = yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : 0;

  return {
    weekly: {
      sales: {
        current: thisWeekSales,
        previous: lastWeekSales,
        growth: salesGrowth
      },
      orders: {
        current: thisWeekCount,
        previous: lastWeekCount,
        growth: orderGrowth
      },
      avgPrice: {
        current: thisWeekAvg,
        previous: lastWeekAvg,
        growth: avgGrowth
      }
    },
    daily: {
      sales: {
        today: todaySales,
        yesterday: yesterdaySales,
        growth: dailySalesGrowth
      },
      orders: {
        today: todayCount,
        yesterday: yesterdayCount,
        growth: dailyOrderGrowth
      }
    }
  };
}

/**
 * 分析趋势并给出建议
 */
function analyzeTrend(comparison) {
  const { weekly } = comparison;
  const suggestions = [];
  let overall = 'positive';

  // 销售额趋势
  if (weekly.sales.growth > 10) {
    suggestions.push({
      type: 'success',
      text: `本周销售额增长${weekly.sales.growth.toFixed(1)}%，表现优秀！建议保持当前策略并加大推广力度。`
    });
  } else if (weekly.sales.growth > 0) {
    suggestions.push({
      type: 'info',
      text: `本周销售额稳步增长${weekly.sales.growth.toFixed(1)}%，建议继续优化商品和营销策略。`
    });
  } else if (weekly.sales.growth > -10) {
    suggestions.push({
      type: 'warning',
      text: `本周销售额小幅下降${Math.abs(weekly.sales.growth).toFixed(1)}%，建议启动促销活动刺激销售。`
    });
    overall = 'warning';
  } else {
    suggestions.push({
      type: 'danger',
      text: `本周销售额下降${Math.abs(weekly.sales.growth).toFixed(1)}%，建议紧急调整策略，加大营销投入。`
    });
    overall = 'negative';
  }

  // 客单价趋势
  if (weekly.avgPrice.growth > 5) {
    suggestions.push({
      type: 'success',
      text: `客单价提升${weekly.avgPrice.growth.toFixed(1)}%，用户购买力增强，可考虑推广高价值商品。`
    });
  } else if (weekly.avgPrice.growth < -5) {
    suggestions.push({
      type: 'warning',
      text: `客单价下降${Math.abs(weekly.avgPrice.growth).toFixed(1)}%，建议通过满减、组合优惠等方式提升客单价。`
    });
  }

  // 订单量趋势
  if (weekly.orders.growth > 10) {
    suggestions.push({
      type: 'success',
      text: `订单量增长${weekly.orders.growth.toFixed(1)}%，用户活跃度提升，建议增加商品曝光。`
    });
  }

  return {
    overall,
    suggestions
  };
}

/**
 * 获取商品分析矩阵（波士顿矩阵）
 * GET /admin/analytics/product-matrix
 */
router.get('/product-matrix', async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date(weekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);

    // 获取所有商品的销售数据
    const products = await Product.findAll({
      where: { status: 1 },
      attributes: ['id', 'name', 'price', 'stock', 'sales']
    });

    // 获取订单商品数据
    const orderItems = await OrderItem.findAll({
      attributes: ['product_id', 'quantity'],
      include: [{
        model: Order,
        where: {
          status: { [Op.in]: [2, 3, 4, 5] },
          created_at: { [Op.gte]: twoWeeksAgo }
        },
        attributes: ['created_at'],
        required: true
      }]
    });

    // 按商品ID分组统计销量
    const salesMap = {};
    orderItems.forEach(item => {
      const productId = item.product_id;
      const orderDate = new Date(item.Order.created_at);
      
      if (!salesMap[productId]) {
        salesMap[productId] = { thisWeek: 0, lastWeek: 0 };
      }
      
      if (orderDate >= weekAgo) {
        salesMap[productId].thisWeek += item.quantity;
      } else if (orderDate >= twoWeeksAgo) {
        salesMap[productId].lastWeek += item.quantity;
      }
    });

    // 计算每个商品的指标
    const matrix = {
      star: [],      // 明星商品：高增长+高销量
      cash: [],      // 现金牛：低增长+高销量
      potential: [], // 潜力商品：高增长+低销量
      dog: []        // 滞销品：低增长+低销量
    };

    products.forEach(product => {
      const data = product.toJSON();
      const sales = salesMap[data.id] || { thisWeek: 0, lastWeek: 0 };
      
      const thisWeekSales = sales.thisWeek;
      const lastWeekSales = sales.lastWeek;
      
      // 计算增长率
      const growth = lastWeekSales > 0 ? ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100 : 0;
      
      const productData = {
        id: data.id,
        name: data.name,
        price: data.price,
        stock: data.stock,
        thisWeekSales,
        lastWeekSales,
        growth,
        totalSales: data.sales
      };

      // 分类（增长率>20%为高增长，本周销量>10为高销量）
      const isHighGrowth = growth > 20;
      const isHighSales = thisWeekSales > 10;

      if (isHighGrowth && isHighSales) {
        matrix.star.push(productData);
      } else if (!isHighGrowth && isHighSales) {
        matrix.cash.push(productData);
      } else if (isHighGrowth && !isHighSales) {
        matrix.potential.push(productData);
      } else {
        matrix.dog.push(productData);
      }
    });

    // 排序并限制数量
    matrix.star.sort((a, b) => b.growth - a.growth).splice(10);
    matrix.cash.sort((a, b) => b.thisWeekSales - a.thisWeekSales).splice(10);
    matrix.potential.sort((a, b) => b.growth - a.growth).splice(10);
    matrix.dog.sort((a, b) => a.thisWeekSales - b.thisWeekSales).splice(10);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        matrix,
        summary: {
          starCount: matrix.star.length,
          cashCount: matrix.cash.length,
          potentialCount: matrix.potential.length,
          dogCount: matrix.dog.length
        }
      }
    });
  } catch (error) {
    console.error('获取商品矩阵失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
});

module.exports = router;