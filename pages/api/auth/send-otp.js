import nodemailer from "nodemailer";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "請提供信箱" });

  try {
    // 1. 產生 6 位數隨機驗證碼
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 分鐘後過期

    // 2. 產生加密簽章 (防偽造) - OTP_SECRET 請設定在 .env 裡，這裡給個預設值防呆
    const secret = process.env.OTP_SECRET || "kesh_super_secret_key_2026";
    const data = `${email}.${otp}.${expires}`;
    const hash = crypto.createHmac("sha256", secret).update(data).digest("hex");

    // 3. 設定寄信伺服器 (這裡以 Gmail 為例，正式上線建議用 SendGrid 或 Resend)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // 請在 .env 中設定您的 Gmail 帳號與 Google 應用程式密碼
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASS || "your-app-password",
      },
    });

    // 4. 精品風 Email HTML 模板設計
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; text-align: center; color: #000;">
        <h1 style="font-size: 24px; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 40px; font-weight: 300;">KÉSH de¹</h1>
        <div style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 40px 0; margin-bottom: 40px;">
          <p style="font-size: 13px; color: #666; letter-spacing: 1px; margin-bottom: 10px;">HELLO,</p>
          <p style="font-size: 13px; color: #666; letter-spacing: 1px; line-height: 1.8; margin-bottom: 30px;">
            感謝您註冊 KÉSH de¹ 會員。<br/>請使用下方的專屬驗證碼完成您的註冊手續。
          </p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #000; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #999; margin-top: 30px;">(此驗證碼將於 10 分鐘後失效)</p>
        </div>
        <p style="font-size: 10px; color: #ccc; letter-spacing: 1px;">If you didn't request this code, you can safely ignore this email.</p>
        <p style="font-size: 10px; color: #ccc; letter-spacing: 1px; margin-top: 10px;">© ${new Date().getFullYear()} KÉSH de¹. All rights reserved.</p>
      </div>
    `;

    // 5. 寄出信件
    await transporter.sendMail({
      from: `"KÉSH de¹" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "[KÉSH de¹] 您的會員註冊驗證碼",
      html: emailHtml,
    });

    // 6. 回傳加密包給前端 (不包含明文 OTP)
    res.status(200).json({ hash, expires });
  } catch (error) {
    console.error("寄信失敗:", error);
    res.status(500).json({ error: "發送驗證碼失敗，請檢查信箱設定" });
  }
}