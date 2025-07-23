# 🎉 Vue Lottery

這是一個使用 **Vue 3 + Vite** 打造的前端抽獎系統，已部署在 **GitHub Pages**，歡迎試用！

---

## 🔗 線上體驗 Demo

📱 手機掃碼快速體驗：

<img src="./public/lottery-qrcode.png" width="180" />

---

## 📁 測試資料

本專案提供兩份範例檔案，方便進行抽獎測試：

- [📄 Vendor.xlsx](https://github.com/BlockbyJamez/vue-lottery/blob/main/lottery%20data%20sample/Vendor.xlsx)
- [📄 Award.xlsx](https://github.com/BlockbyJamez/vue-lottery/blob/main/lottery%20data%20sample/Award.xlsx)

> 📌 注意：以上檔案位於 `main` 分支中。

---

## ⚙️ 使用技術

- [Vue 3](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [gh-pages](https://www.npmjs.com/package/gh-pages)

---

## 📂 專案結構

```plaintext
vue-lottery/
 ├─ .vscode/
 ├─ dist/
 ├─ lottery data sample/      ← 存放 Vendor.xlsx 和 Award.xlsx
 ├─ node_modules/
 ├─ public/
 │   └─ lottery-qrcode.png
 ├─ src/
 │   ├─ assets/
 │   │   └─ style.css
 │   ├─ components/
 │   │   ├─ DrawPage.vue
 │   │   ├─ DrawRecords.vue
 │   │   └─ UploadExcel.vue
 │   ├─ router/
 │   │   └─ index.js
 │   └─ stores/
 │       └─ lotteryStore.js
 ├─ App.vue
 ├─ main.js
 ├─ .gitignore
 ├─ index.html
 ├─ npm run.bat
 ├─ package-lock.json
 ├─ package.json
 ├─ README.md
 └─ vite.config.js
```
