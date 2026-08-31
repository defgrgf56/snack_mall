// src/stores/user.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  
  // 安全地解析用户信息
  let savedUserInfo = {}
  try {
    const saved = localStorage.getItem('admin_info')
    if (saved && saved !== 'undefined') {
      savedUserInfo = JSON.parse(saved)
    }
  } catch (e) {
    console.error('解析用户信息失败:', e)
  }
  const userInfo = ref(savedUserInfo)

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('admin_token', newToken)
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('admin_info', JSON.stringify(info))
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout
  }
})
