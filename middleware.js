import { NextResponse } from 'next/server';

// 略過靜態檔案的正規表達式
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req) {
  // 1. 略過系統檔案、圖片、API，以及 Apple Pay / 安全驗證路徑（無副檔名）
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    req.nextUrl.pathname.startsWith('/.well-known') ||
    PUBLIC_FILE.test(req.nextUrl.pathname)
  ) {
    return NextResponse.next();
  }

  // 使用者手動開啟 /ko 或 /en（網址已指定語系）→ 尊重網址，不要用 IP 改寫
  const urlLocale = req.nextUrl.locale;
  if (urlLocale === 'ko' || urlLocale === 'en') {
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', urlLocale, {
      path: '/',
      maxAge: 31536000,
    });
    return response;
  }

  // 已有語系 Cookie 時放行（避免與前端語系切換衝突）
  if (req.cookies.has('NEXT_LOCALE')) {
    return NextResponse.next();
  }

  // 繁中主站 (/) 與 zh-TW 路徑：不做 IP 分流，確保 Google 索引到正確語系
  // 語系僅由 URL 決定（/、/en、/ko），避免 Rich Results 把 / 判成英文
  if (req.nextUrl.pathname === "/" || req.nextUrl.locale === "zh-TW") {
    return NextResponse.next();
  }

  // 2. 只有 /en、/ko 前綴以外的非繁中頁面，才依 IP 建議語系（不影響 / 與 zh-TW）
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
