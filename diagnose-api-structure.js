// 诊断后台API数据结构一致性
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 先登录获取token
async function login() {
  try {
    const res = await axios.post(`${BASE_URL}/auth/admin-login`, {
      username: 'admin',
      password: 'admin123'
    });
    return res.data.data.token;
  } catch (error) {
    console.error('登录失败:', error.message);
    process.exit(1);
  }
}

async function checkAPI(name, url, token) {
  try {
    const res = await axios.get(`${BASE_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = res.data;
    console.log(`\n====== ${name} ======`);
    console.log('URL:', url);
    console.log('响应结构:');
    console.log('  code:', data.code);
    console.log('  message:', data.message);
    console.log('  data类型:', typeof data.data);
    
    if (data.data) {
      console.log('  data内容键:', Object.keys(data.data).join(', '));
      
      // 检查list字段
      if (data.data.list) {
        console.log('  ✓ 有 data.list, 长度:', data.data.list.length);
      }
      
      // 检查total字段
      if (data.data.total !== undefined) {
        console.log('  ✓ 有 data.total:', data.data.total);
      }
      
      // 检查pagination字段
      if (data.data.pagination) {
        console.log('  ✓ 有 data.pagination:', JSON.stringify(data.data.pagination));
      }
    }
    
    return { success: true, structure: data };
  } catch (error) {
    console.log(`\n====== ${name} ======`);
    console.log('URL:', url);
    console.log('✗ 请求失败:', error.response?.data?.message || error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('===== 后台API数据结构诊断 =====\n');
  
  const token = await login();
  console.log('✓ 登录成功');
  
  // 检查所有主要API
  const apis = [
    { name: '商品列表', url: '/admin/products?page=1&pageSize=10' },
    { name: '分类列表', url: '/admin/categories' },
    { name: '订单列表', url: '/admin/orders?page=1&pageSize=10' },
    { name: '用户列表', url: '/admin/users?page=1&pageSize=10' },
    { name: '优惠券列表', url: '/admin/coupons?page=1&pageSize=10' },
    { name: '轮播图列表', url: '/admin/banners' },
    { name: '活动列表', url: '/admin/activities?page=1&pageSize=10' },
    { name: '秒杀列表', url: '/admin/seckills?page=1&pageSize=10' },
    { name: '管理员列表', url: '/admin/list?page=1&pageSize=10' },
    { name: '统计数据', url: '/admin/statistics' },
  ];
  
  const results = [];
  for (const api of apis) {
    const result = await checkAPI(api.name, api.url, token);
    results.push({ ...api, ...result });
  }
  
  // 汇总报告
  console.log('\n\n===== 数据结构一致性报告 =====\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`成功: ${successful.length}/${results.length}`);
  console.log(`失败: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n失败的API:');
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }
  
  // 分析数据结构模式
  console.log('\n数据结构模式分析:');
  
  const withDataList = successful.filter(r => r.structure.data?.list);
  const withDataTotal = successful.filter(r => r.structure.data?.total !== undefined);
  const withDataPagination = successful.filter(r => r.structure.data?.pagination);
  
  console.log(`\n使用 data.list 的API (${withDataList.length}个):`);
  withDataList.forEach(r => console.log(`  - ${r.name}`));
  
  console.log(`\n使用 data.total 的API (${withDataTotal.length}个):`);
  withDataTotal.forEach(r => console.log(`  - ${r.name}`));
  
  console.log(`\n使用 data.pagination 的API (${withDataPagination.length}个):`);
  withDataPagination.forEach(r => console.log(`  - ${r.name}`));
  
  console.log('\n建议:');
  if (withDataTotal.length > 0 && withDataPagination.length > 0) {
    console.log('  ⚠️  后端API分页结构不统一！');
    console.log('  建议统一为以下结构之一:');
    console.log('    方案1: { data: { list, total, page, pageSize } }');
    console.log('    方案2: { data: { list, pagination: { total, page, pageSize } } }');
  }
}

main().catch(console.error);