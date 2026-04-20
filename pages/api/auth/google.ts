import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/auth/callback`;

  console.log('====== 🔵 開始執行 Google 登入流程 ======');
  console.log('1. 準備回呼網址:', redirectUri);

  try {
    // 1. 跟 Google 交換 Token
    const tokenParams = new URLSearchParams({
      code: code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const googleRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    });

    const tokenData = await googleRes.json();
    
    // 🔍 [除錯] 檢查 Google 是否報錯
    if (!tokenData.id_token) {
      console.error('🔴 [Google API 錯誤] 交換 Token 失敗:', tokenData);
      throw new Error(`Google API 錯誤: ${tokenData.error_description || '無法取得 id_token'}`);
    }

    // 2. 解析 JWT 拿到 Email 和 姓名
    const payloadBase64 = tokenData.id_token.split('.')[1];
    const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const userInfo = JSON.parse(decodedPayload);

    console.log('2. 成功取得 Google 使用者:', userInfo.email);

    if (!userInfo.email) return res.status(400).json({ error: 'Google 未提供 Email' });

    // 3. 產生專屬密碼 (使用 Google sub ID)
    const generatedPassword = crypto
      .createHmac('sha256', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'kesh_secret')
      .update(`GOOGLE_${userInfo.sub}`)
      .digest('hex')
      .substring(0, 16) + "Aa1!"; 

    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';
    
    let medusaToken = '';

    console.log(`3. 準備與 Medusa 連線 (${BACKEND_URL})`);

    // ==========================================
    // 執行與 LINE 完全相同的 Medusa V2 登入/註冊邏輯
    // ==========================================
    
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
       console.log('🟡 一般登入失敗，啟動 Medusa V2 兩段式自動註冊流程...');

       // 步驟 A: 註冊 Auth Identity
       console.log('-> 步驟 A: 註冊 Auth Identity...');
       const authRegisterRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': API_KEY },
         body: JSON.stringify({ email: userInfo.email, password: generatedPassword })
       });

       if (!authRegisterRes.ok) {
         const errorData = await authRegisterRes.text();
         console.error('🔴 [Medusa V2 註冊 Auth 錯誤]', errorData);
         throw new Error(`Medusa Auth 註冊失敗: ${errorData}`);
       }

       const authData = JSON.parse(await authRegisterRes.text() || '{}');
       // 注意：為了避免 text() 被讀取兩次報錯，改用這種安全的寫法
       const registerToken = authData.token || (await authRegisterRes.clone().json()).token;

       // 步驟 B: 建立 Customer 實體
       console.log('-> 步驟 B: 建立 Customer 檔案...');
       const customerRes = await fetch(`${BACKEND_URL}/store/customers`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json', 
           'x-publishable-api-key': API_KEY,
           'Authorization': `Bearer ${registerToken}` 
         },
         body: JSON.stringify({
           email: userInfo.email,
           first_name: userInfo.given_name || userInfo.name || 'Google User',
           last_name: userInfo.family_name || ' '
         })
       });

       if (!customerRes.ok) {
         const errorData = await customerRes.text();
         console.error('🔴 [Medusa V2 建立 Customer 錯誤]', errorData);
         throw new Error(`Medusa Customer 建立失敗: ${errorData}`);
       }

       console.log('🟢 註冊成功！準備重新登入取得最終 Token...');

       // 步驟 C: 最終登入
       const finalLoginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': API_KEY },
          body: JSON.stringify({ email: userInfo.email, password: generatedPassword })
       });
       
       if (!finalLoginRes.ok) {
         const loginError = await finalLoginRes.text();
         console.error('🔴 [Medusa 最終登入錯誤]', loginError);
         throw new Error('Medusa 最終自動登入失敗');
       }
       
       const finalLoginData = await finalLoginRes.json();
       medusaToken = finalLoginData.token;
    }

    console.log('====== 🔵 Google 登入流程完美結束 ======');
    return res.status(200).json({
      token: medusaToken,
      name: userInfo.name,
      picture: userInfo.picture
    });

  } catch (error: any) {
    console.log('\n====== 🔴 發生重大錯誤 ======');
    console.log(error);
    console.log('==============================\n');
    return res.status(500).json({ error: error.message || 'Google 登入處理失敗' });
  }
}