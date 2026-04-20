import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otp, hash, expires, newPassword } = req.body;

  // 1. 檢查資料完整性
  if (!email || !otp || !hash || !expires || !newPassword) {
    return res.status(400).json({ error: "資料不完整" });
  }

  // 2. 檢查是否過期
  if (Date.now() > parseInt(expires)) {
    return res.status(400).json({ error: "驗證碼已過期，請重新發送" });
  }

  // 3. 驗證雜湊簽章 (防偽造)
  const secret = process.env.OTP_SECRET || "kesh_super_secret_key_2026";
  const data = `${email}.${otp}.${expires}`;
  const calculatedHash = crypto.createHmac("sha256", secret).update(data).digest("hex");

  if (calculatedHash !== hash) {
    return res.status(400).json({ error: "驗證碼錯誤或無效" });
  }

  // ==========================================
  // 4. 呼叫 Medusa 後端強制修改密碼
  // ==========================================
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const SECRET_API_KEY = process.env.MEDUSA_SECRET_API_KEY; 

    if (!SECRET_API_KEY) {
      // 🚨 如果你還沒在 .env 裡設定管理員金鑰，這裡會擋住。
      // 未來你可以在 Vercel 加入 MEDUSA_SECRET_API_KEY 就能打通這條路。
      return res.status(500).json({ error: "系統未設定管理員金鑰，無法強制修改密碼" });
    }

    // 透過 Admin API 強制更新 Auth Identity 的密碼 (這段是 Medusa V2 的標準做法)
    // 需帶入 Secret_API_Key 作為驗證
    const updateRes = await fetch(`${BACKEND_URL}/admin/auth/identities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SECRET_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        password: newPassword
      }),
    });

    if (!updateRes.ok) {
      const errorData = await updateRes.text();
      console.error("Medusa 密碼更新失敗:", errorData);
      throw new Error("找不到此帳號，或更新密碼失敗");
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("重設密碼流程失敗:", error);
    res.status(500).json({ error: error.message || "系統異常" });
  }
}