<template>
  <div class="records-page">
    <div class="box">
      <h2>中獎紀錄</h2>
      <ul>
        <li v-for="log in store.drawLogs" :key="log.時間">
          🎉 {{ log.廠商 }} 抽中 {{ log.獎項 }} - {{ log.時間 }}
        </li>
      </ul>
      <button @click="exportXLSX" :disabled="store.drawLogs.length === 0">
        匯出中獎紀錄 (.xlsx)
      </button>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'
import { useLotteryStore } from '@/stores/lotteryStore'

const store = useLotteryStore()

function exportXLSX() {
  const data = store.drawLogs.map(log => ({
    廠商: log.廠商,
    獎項: log.獎項,
    時間: log.時間
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '中獎紀錄')
  XLSX.writeFile(wb, 'draw_records.xlsx')
}
</script>
