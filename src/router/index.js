import { createRouter, createWebHashHistory } from 'vue-router'
import UploadExcel from '@/components/UploadExcel.vue'
import DrawPage from '@/components/DrawPage.vue'
import DrawRecords from '@/components/DrawRecords.vue'

const routes = [
  { path: '/', redirect: '/upload' },
  { path: '/upload', component: UploadExcel },
  { path: '/draw', component: DrawPage },
  { path: '/records', component: DrawRecords }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
