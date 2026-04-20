import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code } = req.body;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/auth/facebook/callback`;

  console.log('====== 🔵 開始執行 Facebook 登入流程 ======');

  try {
    // 1. 跟 Facebook 交換 Access Token (注意 FB 是用 GET)
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}&redirect_uri=${redirectUri}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${code}`;
    
    const fbTokenRes = await fetch(tokenUrl);
    const tokenData = await fbTokenRes.json();
    
    if (!tokenData.access_token) {
      console.error('🔴 [Facebook API 錯誤]', tokenData);
      throw new Error('無法取得 Facebook Access Token');
    }

    // 2. 用 Token 去拿使用者的 Email 和 姓名大頭貼
    const userInfoRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`);
    const userInfo = await userInfoRes.json();

    console.log('2. 成功取得 FB 使用者:', userInfo.email || '未提供Email');

    // 🚨 許多人的 FB 是用手機註冊沒有 Email，必須攔截
    if (!userInfo.email) {
      return res.status(400).json({ error: '您的 Facebook 帳號未綁定 Email，請改用其他方式登入' });
    }

    // 3. 產生這支帳號專屬的密碼
    const generatedPassword = crypto
      .createHmac('sha256', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'kesh_secret')
      .update(`FB_${userInfo.id}`) // 注意 FB 是用 id 不是 sub
      .digest('hex')
      .substring(0, 16) + "Aa1!"; 

    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';
    
    let medusaToken = '';

    console.log(`3. 準備與 Medusa 連線 (${BACKEND_URL})`);

    // ==========================================
    // 執行 Medusa V2 登入/註冊邏輯
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
       const authRegisterRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': API_KEY },
         body: JSON.stringify({ email: userInfo.email, password: generatedPassword })
       });

       if (!authRegisterRes.ok) {
         const errorData = await authRegisterRes.text();
         throw new Error(`Medusa Auth 註冊失敗: ${errorData}`);
       }

       const authData = JSON.parse(await authRegisterRes.text() || '{}');
       const registerToken = authData.token || (await authRegisterRes.clone().json()).token;

       // 解析姓名 (FB 通常只給一個 name，我們把它拆開避免錯誤)
       const nameParts = userInfo.name.split(' ');
       const firstName = nameParts[0] || 'FB User';
       const lastName = nameParts.slice(1).join(' ') || ' ';

       // 步驟 B: 建立 Customer 實體
       const customerRes = await fetch(`${BACKEND_URL}/store/customers`, {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json', 
           'x-publishable-api-key': API_KEY,
           'Authorization': `Bearer ${registerToken}` 
         },
         body: JSON.stringify({
           email: userInfo.email,
           first_name: firstName,
           last_name: lastName
         })
       });

       if (!customerRes.ok) throw new Error('Medusa Customer 建立失敗');

       // 步驟 C: 最終登入
       const finalLoginRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-publishable-api-key': API_KEY },
          body: JSON.stringify({ email: userInfo.email, password: generatedPassword })
       });
       
       if (!finalLoginRes.ok) throw new Error('Medusa 最終自動登入失敗');
       
       const finalLoginData = await finalLoginRes.json();
       medusaToken = finalLoginData.token;
    }

    console.log('====== 🔵 Facebook 登入流程完美結束 ======');
    
    // 處理 FB 大頭貼網址
    const fbPicture = userInfo.picture?.data?.url || '';

    return res.status(200).json({
      token: medusaToken,
      name: userInfo.name,
      picture: fbPicture
    });

  } catch (error: any) {
    console.log('\n====== 🔴 發生重大錯誤 ======');
    console.log(error);
    console.log('==============================\n');
    return res.status(500).json({ error: error.message || 'Facebook 登入處理失敗' });
  }
}