// next-i18next.config.js
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'zh-TW', 
    locales: ['zh-TW', 'en', 'ko'],
    // Disable automatic locale detection via Accept-Language header.
    // Locale is determined ONLY by the URL path (/en/..., /ko/..., or / for zh-TW).
    // Without this, Google's crawler (which sends Accept-Language: en) would be
    // redirected from /ko to /en, causing all structured data to appear in English.
    localeDetection: false,
  },
  // 🔥 關鍵修正：確保 Vercel 環境能正確找到翻譯檔的路徑
  localePath: typeof window === 'undefined'
    ? path.resolve('./public/locales')
    : '/locales',
};