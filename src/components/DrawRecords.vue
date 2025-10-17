<template>
  <div class="records-page">
    <div class="box">
      <h2>抽獎</h2>
      <ul>
        <li v-for="log in store.drawLogs" :key="log.time">
          🎉 {{ log.vendor }} 抽中 {{ log.prize }} - {{ log.time }}
        </li>
      </ul>
      <button @click="exportXLSX" :disabled="store.drawLogs.length === 0">
        匯出抽獎紀錄 (.xlsx)
      </button>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { useLotteryStore } from "@/stores/lotteryStore";

const store = useLotteryStore();

function exportXLSX() {
  const data = store.drawLogs.map((log) => ({
    Vendor: log.vendor,
    Prize: log.prize,
    Time: log.time,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Draw Records");
  XLSX.writeFile(wb, "draw_records.xlsx");
}
</script>
