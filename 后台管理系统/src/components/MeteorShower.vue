<template>
  <canvas
    ref="canvasRef"
    class="meteor-shower"
    :style="{ opacity: enabled ? 1 : 0 }"
  />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  enabled: { type: Boolean, default: true },
  // 流星数量上限
  maxMeteors: { type: Number, default: 15 },
  // 星星数量
  starCount: { type: Number, default: 80 },
  // 流星颜色，可选 'random' | 'blue' | 'orange' | 'white'
  color: { type: String, default: 'random' }
})

const canvasRef = ref(null)

// 颜色配置
const COLOR_MAP = {
  blue: ['#60a5fa', '#93c5fd', '#3b82f6'],
  orange: ['#f97316', '#fdba74', '#fb923c'],
  white: ['#f1f5f9', '#e2e8f0', '#cbd5e1'],
  random: ['#60a5fa', '#93c5fd', '#f97316', '#fdba74', '#f1f5f9', '#e2e8f0', '#c4b5fd', '#a78bfa']
}

let ctx = null
let animId = null
let stars = []
let meteors = []
let w = 0
let h = 0

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function pickColor() {
  const palette = COLOR_MAP[props.color] || COLOR_MAP.random
  return palette[Math.floor(Math.random() * palette.length)]
}

// 初始化星星（静态背景点）
function initStars() {
  stars = Array.from({ length: props.starCount }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.3, 1.5),
    alpha: rand(0.2, 0.8),
    // 闪烁速度
    twinkleSpeed: rand(0.005, 0.02),
    twinkleDir: Math.random() > 0.5 ? 1 : -1
  }))
}

function createMeteor() {
  const angle = Math.PI / 4 // 45度角从右上往左下
  const speed = rand(4, 12)
  const length = rand(60, 200)
  const color = pickColor()

  return {
    x: rand(w * 0.3, w * 1.2),
    y: rand(-h * 0.1, h * 0.3),
    vx: -Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length,
    color,
    alpha: 1,
    // 头部大小
    headSize: rand(1.5, 3.5),
    // 拖尾透明度衰减
    fadeSpeed: rand(0.008, 0.02),
    // 是否是大流星（带光晕）20% 概率
    isLarge: Math.random() < 0.2,
    alive: true
  }
}

function drawStars(time) {
  for (const s of stars) {
    // 闪烁
    s.alpha += s.twinkleSpeed * s.twinkleDir
    if (s.alpha > 0.9 || s.alpha < 0.15) {
      s.twinkleDir *= -1
    }

    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`
    ctx.fill()
  }
}

function drawMeteors() {
  for (const m of meteors) {
    if (!m.alive) continue

    // 移动
    m.x += m.vx
    m.y += m.vy
    m.alpha -= m.fadeSpeed

    if (m.alpha <= 0 || m.x < -m.length || m.y > h + m.length) {
      m.alive = false
      continue
    }

    // 尾部坐标
    const tailX = m.x + (m.vx / Math.sqrt(m.vx * m.vx + m.vy * m.vy)) * m.length
    const tailY = m.y + (m.vy / Math.sqrt(m.vx * m.vx + m.vy * m.vy)) * m.length

    // 渐变拖尾
    const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(0.7, `${m.color}${Math.floor(m.alpha * 0.4 * 255).toString(16).padStart(2, '0')}`)
    grad.addColorStop(1, `${m.color}${Math.floor(m.alpha * 255).toString(16).padStart(2, '0')}`)

    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(m.x, m.y)
    ctx.strokeStyle = grad
    ctx.lineWidth = m.isLarge ? 2.5 : 1.5
    ctx.lineCap = 'round'
    ctx.stroke()

    // 头部亮点
    ctx.beginPath()
    ctx.arc(m.x, m.y, m.headSize, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`
    ctx.fill()

    // 大流星光晕
    if (m.isLarge) {
      ctx.beginPath()
      ctx.arc(m.x, m.y, m.headSize * 4, 0, Math.PI * 2)
      const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.headSize * 4)
      glow.addColorStop(0, `${m.color}${Math.floor(m.alpha * 0.3 * 255).toString(16).padStart(2, '0')}`)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fill()
    }
  }
}

// 随时间推移生成新流星
let lastSpawn = 0
function maybeSpawnMeteor(time) {
  if (meteors.filter(m => m.alive).length < props.maxMeteors && time - lastSpawn > rand(200, 800)) {
    meteors.push(createMeteor())
    lastSpawn = time
  }
}

function animate(time) {
  ctx.clearRect(0, 0, w, h)

  drawStars(time)
  maybeSpawnMeteor(time)
  drawMeteors()

  // 清理已消亡的流星
  meteors = meteors.filter(m => m.alive)

  animId = requestAnimationFrame(animate)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  w = canvas.width = parent.clientWidth
  h = canvas.height = parent.clientHeight
  initStars()
}

function start() {
  if (animId) return
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  animId = requestAnimationFrame(animate)
}

function stop() {
  if (animId) {
    cancelAnimationFrame(animId)
    animId = null
  }
}

onMounted(() => {
  if (props.enabled) start()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  stop()
  window.removeEventListener('resize', resize)
})

watch(() => props.enabled, (val) => {
  if (val) start()
  else stop()
})
</script>

<style scoped>
.meteor-shower {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.6s ease;
}
</style>