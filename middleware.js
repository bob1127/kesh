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

  // 💡 關鍵修復：尊重訪客手動操作的 Cookie！
  // 只要系統發現使用者有自己的語系 Cookie，Middleware 就「放行不管」，交給前端去處理。
  // 這樣就能避免伺服器強制把按「上一頁」的訪客轉回舊網址，解決了卡死的無窮迴圈。
  if (req.cookies.has('NEXT_LOCALE')) {
    return NextResponse.next();
  }

  // 2. 只有「第一次來的新訪客」，才進行 IP 國家判斷與自動分流
  const country = req.geo?.country || req.headers.get('x-vercel-ip-country');
  
  // 本機開發時沒有國家資料，直接放行
  if (!country) return NextResponse.next();

  // 3. 智能分流邏輯
  const chineseRegions = ['TW', 'CN', 'HK', 'MO', 'SG', 'MY'];
  let targetLocale = 'en'; // 預設全世界英文

  if (chineseRegions.includes(country)) {
    targetLocale = 'zh-TW';
  } else if (country === 'KR') {
    targetLocale = 'ko';
  }

  // 4. 初次進來，將錯誤的語系導航至正確的國家語系，並寫入 Cookie 標籤
  if (req.nextUrl.locale !== targetLocale) {
    const url = req.nextUrl.clone();
    url.locale = targetLocale;
    const response = NextResponse.redirect(url);
    response.cookies.set('NEXT_LOCALE', targetLocale, { path: '/', maxAge: 31536000 });
    return response;
  }
  
  return NextResponse.next();
}