chcp 65001 >nul

@echo off
cd /d "C:\Users\danny\桌面\vue-lottery"
echo  切換到專案資料夾完成

echo  開始安裝依賴（npm install）...
call npm install

echo  啟動 Vite 開發伺服器...
call npm run dev

pause
