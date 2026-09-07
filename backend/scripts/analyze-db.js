const mysql = require('mysql2/promise');
require('dotenv').config();

async function analyzeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('=== 数据库分析报告 ===\n');
    console.log(`数据库: ${process.env.DB_NAME}\n`);

    // 获取所有表
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`共有 ${tables.length} 张表\n`);

    // 统计每张表的记录数
    console.log('--- 表记录统计 ---');
    for (let table of tables) {
      const tableName = Object.values(table)[0];
      const [countResult] = await connection.query(`SELECT COUNT(*) as cnt FROM ${tableName}`);
      const count = countResult[0].cnt;
      console.log(`${tableName.padEnd(25)} ${count} 条`);
    }

    console.log('\n--- 详细数据分析 ---\n');

    // 分析 users 表
    const [userStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_vip = 1 THEN 1 END) as vip_count,
        SUM(points) as total_points,
        SUM(balance) as total_balance
      FROM users
    `);
    console.log('用户统计:');
    console.log(`  总用户数: ${userStats[0].total}`);
    console.log(`  VIP用户数: ${userStats[0].vip_count}`);
    console.log(`  总积分: ${userStats[0].total_points || 0}`);
    console.log(`  总余额: ${userStats[0].total_balance || 0}`);

    // 分析 products 表
    const [productStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_count,
        SUM(stock) as total_stock,
        SUM(sales) as total_sales,
        AVG(price) as avg_price
      FROM products
    `);
    console.log('\n商品统计:');
    console.log(`  总商品数: ${productStats[0].total}`);
    console.log(`  上架商品: ${productStats[0].active_count}`);
    console.log(`  总库存: ${productStats[0].total_stock || 0}`);
    console.log(`  总销量: ${productStats[0].total_sales || 0}`);
    console.log(`  平均价格: ${parseFloat(productStats[0].avg_price || 0).toFixed(2)}`);

    // 分析 categories 表
    const [categoryStats] = await connection.query(`
      SELECT COUNT(*) as total FROM categories
    `);
    console.log('\n分类统计:');
    console.log(`  总分类数: ${categoryStats[0].total}`);

    // 分析 orders 表
    const [orderStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 1 THEN 1 END) as pending,
        COUNT(CASE WHEN status = 2 THEN 1 END) as paid,
        COUNT(CASE WHEN status = 3 THEN 1 END) as shipped,
        COUNT(CASE WHEN status = 4 THEN 1 END) as completed,
        COUNT(CASE WHEN status = 5 THEN 1 END) as cancelled,
        SUM(total_amount) as total_amount
      FROM orders
    `);
    console.log('\n订单统计:');
    console.log(`  总订单数: ${orderStats[0].total}`);
    console.log(`  待付款: ${orderStats[0].pending}`);
    console.log(`  已付款: ${orderStats[0].paid}`);
    console.log(`  已发货: ${orderStats[0].shipped}`);
    console.log(`  已完成: ${orderStats[0].completed}`);
    console.log(`  已取消: ${orderStats[0].cancelled}`);
    console.log(`  总金额: ${parseFloat(orderStats[0].total_amount || 0).toFixed(2)}`);

    // 分析 coupons 表
    const [couponStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(total_count) as total_count,
        SUM(received_count) as received_count,
        SUM(used_count) as used_count
      FROM coupons
    `);
    console.log('\n优惠券统计:');
    console.log(`  总优惠券种类: ${couponStats[0].total}`);
    console.log(`  总发放量: ${couponStats[0].total_count || 0}`);
    console.log(`  已领取: ${couponStats[0].received_count || 0}`);
    console.log(`  已使用: ${couponStats[0].used_count || 0}`);

    // 分析 banners 表
    const [bannerStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_count
      FROM banners
    `);
    console.log('\n轮播图统计:');
    console.log(`  总轮播图: ${bannerStats[0].total}`);
    console.log(`  启用中: ${bannerStats[0].active_count}`);

    // 分析 activities 表
    const [activityStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 1 THEN 1 END) as active_count
      FROM activities
    `);
    console.log('\n活动统计:');
    console.log(`  总活动数: ${activityStats[0].total}`);
    console.log(`  进行中: ${activityStats[0].active_count}`);

    // 分析 seckills 表
    const [seckillStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(stock) as total_stock,
        SUM(sales) as total_sales
      FROM seckills
    `);
    console.log('\n秒杀活动统计:');
    console.log(`  总秒杀数: ${seckillStats[0].total}`);
    console.log(`  总库存: ${seckillStats[0].total_stock || 0}`);
    console.log(`  总销量: ${seckillStats[0].total_sales || 0}`);

    await connection.end();
  } catch (error) {
    console.error('数据库分析失败:', error.message);
  }
}

analyzeDatabase();