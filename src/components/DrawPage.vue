<template>
  <div class="draw-wrapper">

    <!-- 右側轉盤區 -->
    <div class="wheel-area">
      <canvas ref="canvas" />
    </div>

    <!-- 彈出視窗 -->
  <transition name="fade">
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>🎉 恭喜中獎！</h3>
        <p>{{ modalMessage }}</p>
        <button @click="closeModal">確定</button>
      </div>
    </div>
  </transition>

        <!-- 左側選單區 -->
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
const showModal = ref(false)
const modalMessage = ref('')

let ctx
let radius = 0

function closeModal() {
  showModal.value = false
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
    ctx.textAlign = 'right'
    ctx.fillStyle = 'white'
    ctx.font = `${radius * 0.08}px Arial`
    ctx.fillText(p.獎項名稱, radius - 20, 10)
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
      store.spinning = false
    }
  }

  animate()
}
</script>
