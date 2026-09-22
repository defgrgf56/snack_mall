import { ref, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'meteor_shower_enabled'

// 全局单例状态
const enabled = ref(localStorage.getItem(STORAGE_KEY) !== 'false') // 默认开启

export function useMeteorShower() {
  const toggle = () => {
    enabled.value = !enabled.value
    localStorage.setItem(STORAGE_KEY, enabled.value)
  }

  return {
    enabled,
    toggle
  }
}