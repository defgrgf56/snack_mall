// API 诊断脚本
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let adminToken = '';

// 测试结果
const results = {
  passed: [],
  failed: [],
  total: 0
};

async function testEndpoint(name, method, url, data = null, requiresAuth = true) {
  results.total++;
  
  try {
    const headers = {};
    if (requiresAuth && adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.data.code === 200 || response.data.code === 401) {
      results.passed.push({ name, status: 'OK', code: response.data.code });
      console.log(`✓ ${name}: ${response.data.code} - ${response.data.message}`);
      return true;
    } else {
      results.failed.push({ name, error: response.data.message, code: response.data.code });
      console.log(`✗ ${name}: ${response.data.code} - ${response.data.message}`);
      return false;
    }
  } catch (error) {
    results.failed.push({ name, error: error.message });
    console.log(`✗ ${name}: ERROR - ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log('========================================');
  console.log('后台管理系统 API 诊断');
  console.log('========================================\n');
  
  // 1. 测试管理员登录
  console.log('1. 测试管理员登录');
  console.log('----------------------------------------');
  try {
    const response = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.code === 200) {
      adminToken = response.data.data.token;
      results.passed.push({ name: '管理员登录', status: 'OK' });
      console.log(`✓ 管理员登录成功，Token: ${adminToken.substring(0, 20)}...`);
    } else {
      results.failed.push({ name: '管理员登录', error: response.data.message });
      console.log(`✗ 管理员登录失败: ${response.data.message}`);
      console.log('\n无法继续测试，请先检查登录功能\n');
      return;
    }
  } catch (error) {
    results.failed.push({ name: '管理员登录', error: error.message });
    console.log(`✗ 管理员登录错误: ${error.message}`);
    console.log('\n无法继续测试\n');
    return;
  }
  
  console.log('\n');
  
  // 2. 测试数据看板API
  console.log('2. 测试数据看板 API');
  console.log('----------------------------------------');
  await testEndpoint('获取统计数据', 'GET', '/admin/statistics');
  await testEndpoint('获取销售趋势', 'GET', '/admin/sales-trend');
  await testEndpoint('获取热销商品', 'GET', '/admin/hot-products');
  console.log('\n');
  
  // 3. 测试商品管理API
  console.log('3. 测试商品管理 API');
  console.log('----------------------------------------');
  await testEndpoint('获取商品列表', 'GET', '/admin/products?page=1&pageSize=10');
  await testEndpoint('获取分类列表', 'GET', '/admin/categories');
  console.log('\n');
  
  // 4. 测试订单管理API
  console.log('4. 测试订单管理 API');
  console.log('----------------------------------------');
  await testEndpoint('获取订单列表', 'GET', '/admin/orders?page=1&pageSize=10');
  console.log('\n');
  
  // 5. 测试用户管理API
  console.log('5. 测试用户管理 API');
  console.log('----------------------------------------');
  await testEndpoint('获取用户列表', 'GET', '/admin/users?page=1&pageSize=10');
  console.log('\n');
  
  // 6. 测试营销管理API
  console.log('6. 测试营销管理 API');
  console.log('----------------------------------------');
  await testEndpoint('获取优惠券列表', 'GET', '/admin/coupons?page=1&pageSize=10');
  await testEndpoint('获取轮播图列表', 'GET', '/admin/banners');
  await testEndpoint('获取活动列表', 'GET', '/admin/activities?page=1&pageSize=10');
  await testEndpoint('获取秒杀列表', 'GET', '/admin/seckills?page=1&pageSize=10');
  console.log('\n');
  
  // 7. 测试管理员管理API
  console.log('7. 测试管理员管理 API');
  console.log('----------------------------------------');
  await testEndpoint('获取管理员列表', 'GET', '/admin/list?page=1&pageSize=10');
  console.log('\n');
  
  // 汇总
  console.log('========================================');
  console.log('诊断汇总');
  console.log('========================================');
  console.log(`总计: ${results.total} 个端点`);
  console.log(`通过: ${results.passed.length} 个`);
  console.log(`失败: ${results.failed.length} 个`);
  console.log('');
  
  if (results.failed.length > 0) {
    console.log('失败的端点:');
    results.failed.forEach(item => {
      console.log(`  - ${item.name}: ${item.error || 'Unknown error'} (Code: ${item.code || 'N/A'})`);
    });
  }
  
  console.log('\n');
}

// 运行诊断
runDiagnostics().catch(console.error);