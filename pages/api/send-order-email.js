// pages/api/send-order-email.js
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { getTransporter } from "../../lib/mailer";
import {
  buildOrderCreatedEmail,
  buildPaymentSuccessEmail,
} from "../../lib/orderEmailTemplates";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { orderId, type, transactionId } = req.body || {};

    const WC_SITE_URL = process.env.WC_SITE_URL;
    const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
    const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

    if (!WC_SITE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return res.status(500).json({ message: "Woo env missing" });
    }
    if (!SITE_URL) return res.status(500).json({ message: "NEXT_PUBLIC_SITE_URL missing" });

    if (!orderId || !type) return res.status(400).json({ message: "Missing orderId/type" });

    const api = new WooCommerceRestApi({
      url: WC_SITE_URL,
      consumerKey: WC_CONSUMER_KEY,
      consumerSecret: WC_CONSUMER_SECRET,
      version: "wc/v3",
    });

    const wooRes = await api.get(`orders/${encodeURIComponent(String(orderId))}`);
    const order = wooRes.data;

    const toEmail = order?.billing?.email;
    if (!toEmail) return res.status(400).json({ message: "Order billing email missing" });

    // ✅ 防重複寄信（用 meta 記錄）
    const meta = Array.isArray(order.meta_data) ? order.meta_data : [];
    const hasMeta = (k) => meta.some((m) => m?.key === k && String(m?.value) === "1");

    let metaKey = "";
    if (type === "ORDER_CREATED") metaKey = "_email_order_created_sent";
    if (type === "PAYMENT_SUCCESS") metaKey = "_email_payment_success_sent";
    if (!metaKey) return res.status(400).json({ message: "Unknown type" });

    if (hasMeta(metaKey)) {
      return res.status(200).json({ status: "skipped", message: "Email already sent" });
    }

    // 組信
    const tpl =
      type === "ORDER_CREATED"
        ? buildOrderCreatedEmail({ order, siteUrl: SITE_URL })
        : buildPaymentSuccessEmail({ order, siteUrl: SITE_URL, transactionId });

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `KÉSH de¹ <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: tpl.subject,
      html: tpl.html,
    });

    // 寄完寫回 meta，避免重寄
    await api.put(`orders/${encodeURIComponent(String(orderId))}`, {
      meta_data: [{ key: metaKey, value: "1" }],
    });

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("send-order-email error:", err);
    return res.status(500).json({ message: err?.message || "Server error" });
  }
}
