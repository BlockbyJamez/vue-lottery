import { defineStore } from 'pinia'

export const useLotteryStore = defineStore('lottery', {
  state: () => ({
    users: [], // { 廠商, 抽獎次數 }
    prizes: [], // { 獎項名稱, 數量 }
    drawLogs: [], // { vendor, prize, time }
    currentUser: null,
    colors: [],
    angle: 0,
    spinning: false
  }),
  actions: {
    updatePrize(prizeName) {
      const prize = this.prizes.find(p => p.獎項名稱 === prizeName)
      if (prize && prize.數量 > 0) prize.數量--
    },
    recordDraw(prizeName) {
      if (this.currentUser && this.currentUser.抽獎次數 > 0) {
        this.drawLogs.push({
          廠商: this.currentUser.廠商,
          獎項: prizeName,
          時間: new Date().toLocaleString()
        })
        this.currentUser.抽獎次數--
      }
    }
  }
})
