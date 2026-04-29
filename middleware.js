import { NextResponse } from 'next/server';

// 略過靜態檔案的正規表達式
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req) {
  // 1. 略過系統檔案、圖片與 API 路由，避免浪費效能
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  // 2. 尊重訪客：如果他手動切換過語系 (有 Cookie)，就不要再干涉他
  if (req.cookies.has('NEXT_LOCALE')) {
    return NextResponse.next();
  }

  // 3. 抓取 Vercel 專屬的 IP 國家代碼 (x-vercel-ip-country)
  const country = req.geo?.country || req.headers.get('x-vercel-ip-country');

  // 如果是在你的電腦本機開發 (Localhost 抓不到國家)，直接放行
  if (!country) return NextResponse.next();

  // 4. 智能分流邏輯
  const chineseRegions = ['TW', 'CN', 'HK', 'MO', 'SG', 'MY'];
  let targetLocale = 'en'; // 預設全世界為英文

  if (chineseRegions.includes(country)) {
    targetLocale = 'zh-TW'; // 這裡請對應你 next-i18next.config.js 裡的繁中代碼
  } else if (country === 'KR') {
    targetLocale = 'ko';
  }

 // 5. 無縫跳轉與設定
  // 如果訪客進來的網址語系，不是我們配對出的目標語系，就幫他換車道
  if (req.nextUrl.locale !== targetLocale) {
    const url = req.nextUrl.clone();
    
    // 🔥 優化這裡：直接告訴 Next.js 目標語系，它會自動幫你處理好網址的拼湊！
    url.locale = targetLocale;
    
    const response = NextResponse.redirect(url);
    
    // 貼上 NEXT_LOCALE 標籤，告訴系統「他已經被分類過了」
    response.cookies.set('NEXT_LOCALE', targetLocale, { path: '/', maxAge: 31536000 }); // 記住一年
    
    return response;
  }
  return NextResponse.next();
}