import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "請提供信箱" });

  try {
    // 1. 產生 6 位數隨機驗證碼
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 分鐘後過期

    // 2. 產生加密簽章 (防偽造，取代舊的記憶體儲存)
    const secret = process.env.OTP_SECRET || "kesh_super_secret_key_2026";
    const data = `${email}.${otp}.${expires}`;
    const hash = crypto.createHmac("sha256", secret).update(data).digest("hex");

    // 3. 設定發信器 (相容 EMAIL_USER 或 GMAIL_USER)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || process.env.GMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.GMAIL_PASS,
      },
    });

    // 4. 精品級註冊 Email 模板
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; text-align: center; color: #333;">
        <h1 style="font-size: 24px; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 40px; font-weight: 300;">KÉSH de¹</h1>
        <div style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 40px 0; margin-bottom: 40px;">
          <p style="font-size: 13px; color: #666; letter-spacing: 1px; margin-bottom: 10px;">帳號註冊驗證 / ACCOUNT VERIFICATION</p>
          <p style="font-size: 13px; color: #666; letter-spacing: 1px; line-height: 1.8; margin-bottom: 30px;">
            歡迎加入 KÉSH de¹。<br>請在註冊頁面輸入下方 6 位數驗證碼以完成信箱驗證。
          </p>
          <div style="background-color: #f8f8f8; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #000;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #999; margin-top: 20px;">驗證碼將於 5 分鐘後失效</p>
        </div>
        <p style="font-size: 10px; color: #999; letter-spacing: 1px; text-transform: uppercase;">© ${new Date().getFullYear()} KÉSH de¹. All rights reserved.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"KÉSH de¹" <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
      to: email,
      subject: "[KÉSH de¹] 您的註冊驗證碼",
      html: emailHtml,
    });

    // 🔥 關鍵點：回傳 hash 和 expires 給前端 register.jsx
    res.status(200).json({ hash, expires });
  } catch (error) {
    console.error("OTP 發送失敗:", error);
    res.status(500).json({ error: "發信失敗，請檢查系統設定與 Google 應用程式密碼" });
  }
}