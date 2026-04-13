// next-i18next.config.js
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'zh-TW', 
    locales: ['zh-TW', 'en', 'ko'], 
  },
  // 🔥 關鍵修正：確保 Vercel 環境能正確找到翻譯檔的路徑
  localePath: typeof window === 'undefined'
    ? path.resolve('./public/locales')
    : '/locales',
};