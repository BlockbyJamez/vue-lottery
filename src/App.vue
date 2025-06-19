<template>
  <div>
    <!-- ✅ 漢堡按鈕 (僅 RWD 用) -->
    <button class="hamburger" @click="toggleNav">☰</button>

    <!-- ✅ 遮罩：點擊關閉選單 -->
    <div v-if="navOpen" class="overlay" @click="closeNav"></div>

    <!-- ✅ 導覽列 -->
    <nav class="nav" :class="{ show: navOpen }">
      <router-link to="/upload" @click="closeNav">匯入資料</router-link>
      <router-link to="/draw" @click="closeNav">抽獎系統</router-link>
      <router-link to="/records" @click="closeNav">中獎紀錄</router-link>
    </nav>

    <!-- ✅ 主要頁面 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 狀態：選單開關
const navOpen = ref(false)

// 切換選單
function toggleNav() {
  navOpen.value = !navOpen.value
}

// 關閉選單
function closeNav() {
  navOpen.value = false
}
</script>
