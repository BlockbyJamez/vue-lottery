import { defineStore } from "pinia";

export const useLotteryStore = defineStore("lottery", {
  state: () => ({
    users: [], // { vendor, drawCount }
    prizes: [], // { prizeName, quantity }
    drawLogs: [], // { vendor, prize, time }
    currentUser: null,
    colors: [],
    angle: 0,
    spinning: false,
  }),
  actions: {
    updatePrize(prizeName) {
      const prize = this.prizes.find((p) => p.prizeName === prizeName);
      if (prize && prize.quantity > 0) prize.quantity--;
    },
    recordDraw(prizeName) {
      if (this.currentUser && this.currentUser.drawCount > 0) {
        this.drawLogs.push({
          vendor: this.currentUser.vendor,
          prize: prizeName,
          time: new Date().toLocaleString(),
        });
        this.currentUser.drawCount--;
      }
    },
  },
});
