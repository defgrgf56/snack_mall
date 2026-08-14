// check-env.js - 检查环境变量配置
require('dotenv').config();

console.log('\n🔍 检查环境变量配置...\n');

const requiredEnvVars = [
  { key: 'PORT', desc: '服务器端口' },
  { key: 'DB_HOST', desc: '数据库地址' },
  { key: 'DB_PORT', desc: '数据库端口' },
  { key: 'DB_NAME', desc: '数据库名称' },
  { key: 'DB_USER', desc: '数据库用户' },
  { key: 'DB_PASSWORD', desc: '数据库密码' },
  { key: 'WX_APPID', desc: '微信小程序AppID' },
  { key: 'WX_SECRET', desc: '微信小程序AppSecret' },
  { key: 'JWT_SECRET', desc: 'JWT密钥' },
  { key: 'JWT_EXPIRES_IN', desc: 'JWT过期时间' }
];

let allConfigured = true;
let hasWarning = false;

requiredEnvVars.forEach(({ key, desc }) => {
  const value = process.env[key];
  
  if (!value) {
    console.log(`❌ ${key} (${desc}): 未配置`);
    allConfigured = false;
  } else if (value.includes('your_') || value.includes('_here')) {
    console.log(`⚠️  ${key} (${desc}): ${value}`);
    console.log(`   提示: 请替换为实际的配置值`);
    hasWarning = true;
  } else {
    // 敏感信息打码显示
    let displayValue = value;
    if (['WX_SECRET', 'JWT_SECRET', 'DB_PASSWORD'].includes(key)) {
      if (value.length > 8) {
        displayValue = value.substring(0, 4) + '****' + value.substring(value.length - 4);
      } else {
        displayValue = '****';
      }
    }
    console.log(`✅ ${key} (${desc}): ${displayValue}`);
  }
});

console.log('\n' + '='.repeat(60));

if (!allConfigured) {
  console.log('\n❌ 配置不完整！');
  console.log('\n请按照以下步骤配置:');
  console.log('1. 复制 .env.example 为 .env');
  console.log('2. 编辑 .env 文件，填写所有配置项');
  console.log('3. 重新运行本脚本检查\n');
  process.exit(1);
} else if (hasWarning) {
  console.log('\n⚠️  配置有警告！');
  console.log('\n请检查上面标记为 ⚠️  的配置项，确保已替换为实际值');
  console.log('特别注意:');
  console.log('- WX_APPID: 从微信公众平台获取');
  console.log('- WX_SECRET: 从微信公众平台获取');
  console.log('- JWT_SECRET: 使用随机字符串（至少32位）\n');
  process.exit(1);
} else {
  console.log('\n✅ 所有配置项检查通过！');
  console.log('\n配置摘要:');
  console.log(`- 服务器将运行在端口: ${process.env.PORT}`);
  console.log(`- 数据库: ${process.env.DB_NAME}`);
  console.log(`- JWT过期时间: ${process.env.JWT_EXPIRES_IN}`);
  console.log('\n可以启动服务器了: npm run dev\n');
}
