// pages/api/send-order-email.js
// 訂單信已改由 Medusa 後端 (Resend) 寄送，此端點保留相容性但不再呼叫 WooCommerce。
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.status(410).json({
    status: "gone",
    message:
      "訂單通知信已改由 Medusa 後端寄送，前端無需再呼叫此 API。",
  });
}
