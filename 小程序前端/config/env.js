// config/env.js - 环境配置

/**
 * 开发配置
 * 修改这里的 DEV_API_URL 来切换开发环境API地址
 */
const DEV_CONFIG = {
  // 选项1: localhost - 开发工具调试用
  LOCAL: 'http://localhost:3000/api',
  
  // 选项2: 局域网IP - 手机真机预览用（改成你的WLAN IP）
  LAN: 'http://192.168.110.212:3000/api',
  
  // 选项3: 内网穿透 - 网络受限时使用（需要启动ngrok等工具）
  TUNNEL: 'https://your-tunnel-url.ngrok.io/api'
}

// 当前使用的开发环境（改这里切换）
const DEV_API_URL = DEV_CONFIG.LOCAL  // ← 手机预览时改成 DEV_CONFIG.LAN

/**
 * 获取 API 基础地址
 */
function getApiBaseUrl() {
  // 开发环境
  if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop') {
    return DEV_API_URL
  }
  
  // 体验版
  if (typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'trial') {
    return 'https://trial-api.example.com/api'
  }
  
  // 生产环境
  return 'https://api.example.com/api'
}

/**
 * 是否开发环境
 */
function isDev() {
  return typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop'
}

module.exports = {
  API_BASE_URL: getApiBaseUrl(),
  IS_DEV: isDev(),
  // 兼容旧的导出方式
  apiConfig: {
    baseUrl: getApiBaseUrl()
  }
}