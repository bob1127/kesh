// pages/api/contact.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, service, message } = req.body;

    // 1. 設定寄件伺服器 (Transporter)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, 
      },
    });

    // 2. 設定信件內容
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: 'hello.cieman@gmail.com', // 寄給您自己
      replyTo: email, // 讓您可以直接回覆客戶
      subject: `【官網詢問】來自 ${name} 的新需求 - ${service}`,
      text: `
        姓名: ${name}
        信箱: ${email}
        需求項目: ${service}
        
        訊息內容:
        ${message}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2>來自 KÉSH de¹ 官網的新詢問</h2>
          <p><strong>姓名：</strong> ${name}</p>
          <p><strong>信箱：</strong> ${email}</p>
          <p><strong>需求項目：</strong> ${service}</p>
          <hr />
          <p><strong>訊息內容：</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    // 3. 發送郵件
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Email error:', error);
      return res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}