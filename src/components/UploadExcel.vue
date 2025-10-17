<template>
  <div class="upload-box">
    <h2>匯入抽獎檔案</h2>
    <div class="upload-section">
      <label class="upload-label">匯入廠商:</label>
      <input type="file" @change="handleUserUpload" accept=".xlsx, .xls" />
    </div>
    <div class="upload-section">
      <label class="upload-label">匯入獎品:</label>
      <input type="file" @change="handlePrizeUpload" accept=".xlsx, .xls" />
    </div>
    <p v-if="store.users.length">✅ 已匯入 {{ store.users.length }} 個廠商</p>
    <p v-if="store.prizes.length">🎁 已匯入 {{ store.prizes.length }} 個獎品</p>
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { useLotteryStore } from "@/stores/lotteryStore";

const store = useLotteryStore();

function readExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    callback(XLSX.utils.sheet_to_json(sheet));
  };
  reader.readAsArrayBuffer(file);
}

function handleUserUpload(e) {
  readExcel(e.target.files[0], (data) => {
    store.users = data.map((u) => ({
      vendor: u["Vendor"] || u["加盟商"] || "Unknown",
      drawCount:
        Number(
          (u["Draw Count"] || u["抽獎籤數"] || "")
            .toString()
            .replace(/[^\d]/g, "")
        ) || 0,
    }));
    console.log("✅ Users data:", store.users);
  });
}

function handlePrizeUpload(e) {
  readExcel(e.target.files[0], (data) => {
    store.prizes = data
      .map((p) => ({
        prizeName: p["Prize"] || p["金額"] || "Unnamed",
        quantity:
          Number(
            (p["Quantity"] || p["名額"] || "").toString().replace(/[^\d]/g, "")
          ) || 0,
      }))
      .filter((p) => p.quantity > 0);

    console.log("✅ Prizes data:", store.prizes);

    // Assign colors dynamically
    const step = 360 / store.prizes.length;
    store.colors = store.prizes.map(
      (_, i) => `hsl(${(i * step + Math.random() * step) % 360}, 70%, 60%)`
    );
  });
}
</script>
