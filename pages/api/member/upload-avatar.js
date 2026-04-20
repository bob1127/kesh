import { createClient } from '@supabase/supabase-js';

// 關閉 Next.js 預設的 body parser，因為我們要接收較大的圖片 Base64
export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageBase64, fileName, token } = req.body;

  if (!imageBase64 || !token) {
    return res.status(400).json({ error: "資料不完整" });
  }

  // 1. 初始化 Supabase 客戶端 (需要 Service Role Key 來繞過權限上傳)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 2. 將 Base64 轉回二進位檔案 (Buffer)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 產生一個唯一檔名避免衝突
    const uniqueFileName = `user_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '')}`;

    // 3. 上傳到 Supabase Storage 的 avatars 儲存桶
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`public/${uniqueFileName}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw new Error(`Supabase 上傳失敗: ${uploadError.message}`);

    // 4. 取得圖片的公開網址
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(`public/${uniqueFileName}`);

    const newAvatarUrl = publicUrlData.publicUrl;

    // ==========================================
    // 5. 更新 Medusa 顧客資料 (將 URL 存入 metadata)
    // ==========================================
    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

    // 先抓取顧客目前的資料，避免覆蓋掉其他 metadata
    const meRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
      headers: { 'Authorization': `Bearer ${token}`, 'x-publishable-api-key': API_KEY }
    });
    const meData = await meRes.json();
    const currentMetadata = meData.customer?.metadata || {};

    // 更新顧客
    const updateRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
      method: "PUT", // 或是 POST，依據你的 Medusa V2 版本
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-publishable-api-key': API_KEY
      },
      body: JSON.stringify({
        metadata: {
          ...currentMetadata,
          avatar_url: newAvatarUrl // 🔥 存入新大頭貼
        }
      })
    });

    if (!updateRes.ok) throw new Error("無法更新 Medusa 顧客資料");

    res.status(200).json({ url: newAvatarUrl });
  } catch (error) {
    console.error("更換大頭貼流程失敗:", error);
    res.status(500).json({ error: error.message || "伺服器處理失敗" });
  }
}