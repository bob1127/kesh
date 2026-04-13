// pages/api/auth/send-otp.js
import nodemailer from "nodemailer";

// 使用 global 變數來確保在開發模式下，驗證碼不會因為檔案重整而消失
if (!global.otpStore) {
  global.otpStore = new Map();
}
// 匯出這個 store 讓 register.js 也能讀取
export const otpStore = global.otpStore;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;
  
  if (!email) return res.status(400).json({ message: "請輸入電子信箱" });

  // 1. 產生 6 位數驗證碼
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. 存入暫存 (設定 5 分鐘後過期)
  otpStore.set(email, { 
    code: otp, 
    expires: Date.now() + 5 * 60 * 1000 
  });

  console.log(`[Server] 產生驗證碼給 ${email}: ${otp}`);

  // 3. 設定發信器 (務必確認 .env.local 裡的密碼是 16 位數應用程式密碼)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"KÉSH de¹" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "【KÉSH de¹】您的註冊驗證碼",
      html: `
        <div style="padding: 20px; border: 1px solid #ccc;">
          <h2>您的驗證碼是：<span style="color: #ef4628; font-size: 24px;">${otp}</span></h2>
          <p>此驗證碼 5 分鐘內有效。</p>
        </div>
      `,
    });
    
    res.status(200).json({ message: "驗證碼已發送" });
  } catch (error) {
    console.error("發信失敗:", error);
    res.status(500).json({ message: "發信失敗，請檢查 Email 或系統設定" });
  }
}