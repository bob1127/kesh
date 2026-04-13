// pages/api/order-lookup.js
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

function statusLabel(status) {
const map = {
  pending: "待付款",
  processing: "處理中",
  "on-hold": "保留中",
  completed: "已完成",
  cancelled: "已取消",
  refunded: "已退款",
  failed: "付款失敗",
};

  return map[status] || status;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { orderId, email } = req.body || {};
    const id = String(orderId || "").trim();
    const mail = String(email || "").trim().toLowerCase();

    if (!id || !mail) {
      return res.status(400).json({ message: "請輸入訂單編號與下單 Email" });
    }

    const WC_SITE_URL = process.env.WC_SITE_URL;
    const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
    const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

    if (!WC_SITE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
      return res.status(500).json({ message: "WooCommerce 環境變數缺失" });
    }

    const api = new WooCommerceRestApi({
      url: WC_SITE_URL,
      consumerKey: WC_CONSUMER_KEY,
      consumerSecret: WC_CONSUMER_SECRET,
      version: "wc/v3",
    });

    // 直接用 ID 取單
    const wooRes = await api.get(`orders/${encodeURIComponent(id)}`);
    const order = wooRes.data;

    const billingEmail = String(order?.billing?.email || "").toLowerCase();

    // ✅ 核心驗證：ID + Email
    if (!billingEmail || billingEmail !== mail) {
      // 不要告訴攻擊者是 ID 不對還是 Email 不對
      return res.status(404).json({ message: "查無此訂單" });
    }

    // ✅ 安全回傳：不回傳完整地址/電話等敏感資料
    const safe = {
      id: order.id,
      status: order.status,
      status_label: statusLabel(order.status),
      date_created: String(order.date_created || "").slice(0, 10),
      payment_method_title: order.payment_method_title || "",
      total: order.total || "0",
      items: (order.line_items || []).map((it) => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        total: it.total,
      })),
      shipping_name:
        [order.shipping?.first_name, order.shipping?.last_name]
          .filter(Boolean)
          .join(" ") ||
        [order.billing?.first_name, order.billing?.last_name]
          .filter(Boolean)
          .join(" ") ||
        "",
      shipping_city: order.shipping?.city || order.billing?.city || "",
    };

    return res.status(200).json({ order: safe });
  } catch (err) {
    // Woo 查不到會丟錯，統一回 404
    return res.status(404).json({ message: "查無此訂單" });
  }
}
