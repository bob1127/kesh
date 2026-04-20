import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otp, hash, expires } = req.body;

  // 1. 檢查資料完整性
  if (!email || !otp || !hash || !expires) {
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

  // 驗證成功，允許前端進行 Medusa 註冊
  res.status(200).json({ success: true });
}