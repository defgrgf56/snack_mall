// config/dev.config.js - 开发环境配置

module.exports = {
  // 开发模式：mock（模拟数据） | api（真实接口）
  mode: 'mock',
  
  // API地址配置
  apiBase: {
    // 本地开发
    local: 'http://localhost:3000/api',
    // 测试环境
    test: 'https://test-api.your-domain.com/api',
    // 生产环境
    prod: 'https://api.your-domain.com/api'
  },
  
  // 当前使用的环境
  currentEnv: 'local',
  
  // 是否显示网络错误提示
  showNetworkError: false,
  
  // 是否显示调试日志
  enableDebugLog: true
}
