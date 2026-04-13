import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, otp, hash, expires } = req.body;

  if (Date.now() > expires) {
    return res.status(400).json({ error: "驗證碼已過期，請重新發送" });
  }

  const secret = process.env.OTP_SECRET || "kesh_super_secret_key_2026";
  const data = `${email}.${otp}.${expires}`;
  const computedHash = crypto.createHmac("sha256", secret).update(data).digest("hex");

  if (computedHash === hash) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ error: "驗證碼錯誤" });
  }
}