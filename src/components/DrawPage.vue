<template>
  <div class="draw-wrapper">

    <!-- 右側轉盤 -->
    <div class="wheel-area">
      <canvas ref="canvas" class="wheel-canvas"/>
    </div>

    <canvas ref="fireworkCanvas" class="firework-canvas"></canvas>

    <!-- 彈窗 + 粒子煙火 Canvas 疊在裡面 -->
    <transition name="fade">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h3>🎉 恭喜中獎！</h3>
          <p>{{ modalMessage }}</p>
          <button @click="closeModal">確定</button>
        </div>
      </div>
    </transition>

    <!-- 左側選單 -->
    <div class="control-panel">
      <h2>抽獎轉盤</h2>
      <div class="selector-box">
        <label>選擇使用者：</label>
        <select v-model="store.currentUser">
          <option v-for="u in store.users" :key="u.廠商" :value="u">
            {{ u.廠商 }} (剩 {{ u.抽獎次數 }} 次)
          </option>
        </select>
      </div>
      <button @click="spinWheel">開始抽獎</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLotteryStore } from '@/stores/lotteryStore'

const store = useLotteryStore()
const canvas = ref(null)
const fireworkCanvas = ref(null)
const showModal = ref(false)
const modalMessage = ref('')
const MAX_PRIZE_NAME = "10萬元"

let ctx
let radius = 0

function closeModal() {
  showModal.value = false
  stopFirework()
}

function handleKeydown(e) {
  if (e.code === 'Space') {
    e.preventDefault()
    if (showModal.value) {
      closeModal()
    } else if (!store.spinning) {
      spinWheel()
    }
  }
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  updateCanvasSize()
  drawWheel()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updateCanvasSize)
})

function updateCanvasSize() {
  const size = Math.min(window.innerWidth * 0.9, 500)
  canvas.value.width = size
  canvas.value.height = size
  radius = size / 2 - 10
  drawWheel()
}

function drawWheel() {
  if (!ctx || !store.prizes.length) return

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  ctx.save()
  ctx.translate(canvas.value.width / 2, canvas.value.height / 2)
  ctx.rotate(store.angle)

  const angleStep = (2 * Math.PI) / store.prizes.length
  let startAngle = 0
  store._angleRanges = []

  store.prizes.forEach((p, i) => {
    const angle = angleStep

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius, startAngle, startAngle + angle)
    ctx.fillStyle = store.colors[i % store.colors.length]
    ctx.fill()
    ctx.stroke()

    ctx.save()
    ctx.rotate(startAngle + angle / 2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'white'

    const fontSize = radius * 0.15; 
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillText(p.獎項名稱, radius * 0.45, 0);
    ctx.restore()

    store._angleRanges.push({ name: p.獎項名稱, start: startAngle, end: startAngle + angle })
    startAngle += angle
  })

  ctx.restore()

  // 指針
  ctx.beginPath()
  ctx.moveTo(canvas.value.width / 2, 20)
  ctx.lineTo(canvas.value.width / 2 - 10, -20)
  ctx.lineTo(canvas.value.width / 2 + 10, -20)
  ctx.closePath()
  ctx.fillStyle = 'red'
  ctx.fill()
}

function spinWheel() {
  if (store.spinning) return

  if (!store.currentUser) {
    alert("❗請先選擇使用者")
    return
  }

  if (store.currentUser.抽獎次數 <= 0) {
    alert(`❗${store.currentUser.廠商} 已無剩餘抽獎次數`)
    return
  }

  const validPrizes = store.prizes.filter(p => p.數量 > 0)
  if (!validPrizes.length) {
    alert("🎉 所有獎項已抽完，活動結束！")
    return
  }

  const totalQuantity = validPrizes.reduce((sum, p) => sum + p.數量, 0)
  let rand = Math.random() * totalQuantity
  let selectedPrize = null
  for (const p of validPrizes) {
    rand -= p.數量
    if (rand <= 0) {
      selectedPrize = p
      break
    }
  }

  const angleInfo = store._angleRanges.find(a => a.name === selectedPrize.獎項名稱)
  if (!angleInfo) return

  const midAngle = (angleInfo.start + angleInfo.end) / 2
  const targetAngle = 3 * Math.PI / 2 - midAngle
  const fullSpins = Math.floor(Math.random() * 6) + 10
  const finalRotation = fullSpins * 2 * Math.PI + targetAngle
  const startAngle = store.angle % (2 * Math.PI)
  const total = finalRotation - startAngle
  const startTime = Date.now()
  const duration = 4000

  store.spinning = true

  function animate() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    store.angle = startAngle + total * ease
    drawWheel()
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      store.angle %= 2 * Math.PI
      store.updatePrize(selectedPrize.獎項名稱)
      store.recordDraw(selectedPrize.獎項名稱)
      modalMessage.value = `🎉 ${store.currentUser.廠商} 抽中：${selectedPrize.獎項名稱}`
      showModal.value = true

      if (selectedPrize.獎項名稱 === MAX_PRIZE_NAME) {
        startFirework()
      } else{
        stopFirework()
      }

      store.spinning = false
    }
  }

  animate()
}

// 粒子煙火 - 加強終極版
let particles = []
let fwCtx
let fwAnimating = false

function startFirework() {
  const fwCanvas = fireworkCanvas.value
  if (!fwCanvas) return

  // 用視窗尺寸：更穩定
  fwCanvas.width = window.innerWidth
  fwCanvas.height = window.innerHeight

  fwCtx = fwCanvas.getContext('2d')
  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height)
  particles = []

  const cx = fwCanvas.width / 2
  const cy = fwCanvas.height / 2

  // 左右兩邊共 200 顆
  for (let side of [-1, 1]) {
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * 2 * Math.PI
      const speed = Math.random() * 10 + 4
      particles.push({
        x: cx + side * 100,
        y: cy,
        angle: angle,
        speed: speed,
        radius: Math.random() * 4 + 2, 
        alpha: 1,
        color: `hsl(${Math.random() * 360}, 100%, 60%)` 
      })
    }
  }

  fwAnimating = true
  animateFirework()
}

function animateFirework() {
  if (!fwAnimating || !fwCtx) return

  const fwCanvas = fireworkCanvas.value

  // 拖尾效果
  fwCtx.fillStyle = "rgba(0, 0, 0, 0.2)"
  fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height)

  particles.forEach(p => {
    p.x += Math.cos(p.angle) * p.speed
    p.y += Math.sin(p.angle) * p.speed
    p.speed *= 0.96 
    p.alpha -= 0.008
  })

  particles = particles.filter(p => p.alpha > 0.02)

  particles.forEach(p => {
    fwCtx.beginPath()
    fwCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI)
    fwCtx.fillStyle = `hsla(${Math.random() * 360}, 100%, 60%, ${p.alpha})`
    fwCtx.fill()
  })

  if (particles.length) {
    requestAnimationFrame(animateFirework)
  } else {
    fwAnimating = false
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height)
  }
}

function stopFirework() {
  // 標記動畫結束，下次重新 startFirework 時會重新開始
  fwAnimating = false
  particles = []

  const fwCanvas = fireworkCanvas.value
  if (fwCanvas && fwCtx) {
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height)
  }
}
</script>
