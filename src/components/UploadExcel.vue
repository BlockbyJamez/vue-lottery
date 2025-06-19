<template>
  <div class="upload-box">
    <h2>匯入 Excel</h2>
    <div class="upload-section">
      <label class="upload-label">選擇【廠商抽獎資格】：</label>
      <input type="file" @change="handleUserUpload" accept=".xlsx, .xls" />
    </div>
    <div class="upload-section">
      <label class="upload-label">選擇【獎品清單】：</label>
      <input type="file" @change="handlePrizeUpload" accept=".xlsx, .xls" />
    </div>
    <p v-if="store.users.length">✅ 已匯入 {{ store.users.length }} 位廠商資格</p>
    <p v-if="store.prizes.length">🎁 已匯入 {{ store.prizes.length }} 項獎品</p>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'
import { useLotteryStore } from '@/stores/lotteryStore'

const store = useLotteryStore()

function readExcel(file, callback) {
  const reader = new FileReader()
  reader.onload = e => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    callback(XLSX.utils.sheet_to_json(sheet))
  }
  reader.readAsArrayBuffer(file)
}

function handleUserUpload(e) {
  readExcel(e.target.files[0], data => {
    store.users = data.map(u => ({
      廠商: u['加盟商'] || '未知',
      抽獎次數: Number((u['抽獎籤數'] + '').replace(/[^\d]/g, '')) || 0
    }))
    console.log('✅ 使用者資料：', store.users)
  })
}

function handlePrizeUpload(e) {
  readExcel(e.target.files[0], data => {
    store.prizes = data
      .map(p => ({
        獎項名稱: p['金額'] || '未命名',
        數量: Number((p['名額'] + '').replace(/[^\d]/g, '')) || 0
      }))
      .filter(p => p.數量 > 0)
    console.log('✅ 獎品資料：', store.prizes)

    const step = 360 / store.prizes.length
    store.colors = store.prizes.map((_, i) =>
      `hsl(${(i * step + Math.random() * step) % 360}, 70%, 60%)`
    )
  })
}
</script>
