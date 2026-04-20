import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  
  // 動態取得目前的網址 (支援 localhost 測試與 Vercel 正式機)
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/auth/line/callback`;

  console.log('====== 🟢 開始執行 LINE 登入流程 ======');

  try {
    // 【動作一】跟 LINE 交換 Token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '',
      client_secret: process.env.LINE_CHANNEL_SECRET || '',
    });

    const lineRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    const tokenData = await lineRes.json();
    
    if (!tokenData.id_token) {
      console.error('🔴 [LINE API 錯誤]', tokenData);
      throw new Error('無法取得 LINE id_token');
    }

    // 【動作二】解析 JWT 拿出 Email 和 姓名
    const payloadBase64 = tokenData.id_token.split('.')[1];
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const userInfo = JSON.parse(decodedPayload);

    console.log('1. 成功取得 LINE 使用者:', userInfo.email);

    if (!userInfo.email) {
      return res.status(400).json({ error: 'LINE 未提供 Email，請確認 LINE 後台設定' });
    }

    // 【動作三】產生這支帳號專屬的密碼
    const generatedPassword = crypto
      .createHmac('sha256', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'kesh_secret')
      .update(`LINE_${userInfo.sub}`)
      .digest('hex')
      .substring(0, 16) + "Aa1!"; 

    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';
    
    let medusaToken = '';

    console.log(`2. 嘗試登入 Medusa...`);

    // 1. 先嘗試登入 Medusa (使用 V2 登入路徑)
    const loginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': API_KEY },
      body: JSON.stringify({ email: userInfo.email, password: generatedPassword })
    });

    if (loginRes.ok) {
       console.log('🟢 登入成功！(舊會員)');
       const loginData = await loginRes.json();
       medusaToken = loginData.token;
    } else {
       console.log('🟡 找不到此用戶，啟動 Medusa V2 兩段式自動註冊流程...');
       
       // ==========================================
       // 🔥 Medusa V2 專屬註冊流程
       // ==========================================

       // 步驟 A: 註冊 Auth Identity (取得註冊用 Token)
       console.log('-> 步驟 A: 註冊 Auth Identity...');
       const authRegisterRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': API_KEY },
         body: JSON.stringify({ email: userInfo.email, password: generatedPassword })
       });

       if (!authRegisterRes.ok) {
         const errorData = await authRegisterRes.text();
         console.error('🔴 [Medusa V2 註冊 Auth 錯誤]', errorData);
         throw new Error('Medusa Auth 註冊失敗');
       }

       const authData = await authRegisterRes.json();
       const registerToken = authData.token; // 🎯 拿到通行證了！

       // 步驟 B: 建立 Customer 實體 (夾帶通行證闖關)
       console.log('-> 步驟 B: 建立 Customer 檔案...');
       const customerRes = await fetch(`${BACKEND_URL}/store/customers`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json', 
           'x-publishable-api-key': API_KEY,
           'Authorization': `Bearer ${registerToken}` // 🎯 破解 Unauthorized 的靈魂關鍵
         },
         body: JSON.stringify({
           email: userInfo.email,
           first_name: userInfo.name,
           last_name: ' ' // LINE 只有一個名字
         })
       });

       if (!customerRes.ok) {
         const errorData = await customerRes.text();
         console.error('🔴 [Medusa V2 建立 Customer 錯誤]', errorData);
         throw new Error('Medusa Customer 建立失敗');
       }

       console.log('🟢 註冊成功！準備重新登入取得最終 Token...');

       // 步驟 C: 註冊完畢，再次登入確保拿到完全綁定的 Token
       const finalLoginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': API_KEY },
          body: JSON.stringify({ email: userInfo.email, password: generatedPassword })
       });
       
       if (!finalLoginRes.ok) {
         throw new Error('Medusa 最終自動登入失敗');
       }

       const finalLoginData = await finalLoginRes.json();
       medusaToken = finalLoginData.token;
    }

    console.log('====== 🟢 LINE 登入流程完美結束 ======');

    // 【動作四】大功告成！將資料傳回前端
    return res.status(200).json({
      token: medusaToken,
      name: userInfo.name,
      picture: userInfo.picture
    });

  } catch (error: any) {
    console.log('\n====== 🔴 發生重大錯誤 ======');
    console.log(error);
    console.log('==============================\n');
    return res.status(500).json({ error: error.message || 'LINE 登入處理失敗' });
  }
}