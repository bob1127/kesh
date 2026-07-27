// pages/api/order-lookup.js — 優先查 Medusa，找不到再 fallback WooCommerce（舊單）
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

function wcStatusLabel(status) {
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

async function lookupMedusa(orderId, email) {
  const backend = (
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    ""
  ).replace(/\/$/, "");
  const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  if (!backend || !pubKey) return null;

  const res = await fetch(`${backend}/store/order-lookup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": pubKey,
    },
    body: JSON.stringify({ orderId, email }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.order || null;
}

async function lookupWoo(orderId, email) {
  const WC_SITE_URL = process.env.WC_SITE_URL;
  const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
  const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

  if (!WC_SITE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) return null;

  const api = new WooCommerceRestApi({
    url: WC_SITE_URL,
    consumerKey: WC_CONSUMER_KEY,
    consumerSecret: WC_CONSUMER_SECRET,
    version: "wc/v3",
  });

  const wooRes = await api.get(`orders/${encodeURIComponent(orderId)}`);
  const order = wooRes.data;
  const billingEmail = String(order?.billing?.email || "").toLowerCase();
  if (!billingEmail || billingEmail !== email) return null;

  return {
    id: order.id,
    status: order.status,
    status_label: wcStatusLabel(order.status),
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
    atm: null,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { orderId, email } = req.body || {};
    const id = String(orderId || "").trim();
    const mail = String(email || "")
      .trim()
      .toLowerCase();

    if (!id || !mail) {
      return res.status(400).json({ message: "請輸入訂單編號與下單 Email" });
    }

    const medusaOrder = await lookupMedusa(id, mail);
    if (medusaOrder) {
      return res.status(200).json({ order: medusaOrder });
    }

    try {
      const wooOrder = await lookupWoo(id, mail);
      if (wooOrder) {
        return res.status(200).json({ order: wooOrder });
      }
    } catch {
      /* Woo 查不到則統一 404 */
    }

    return res.status(404).json({ message: "查無此訂單" });
  } catch (err) {
    console.error("[order-lookup]", err);
    return res.status(404).json({ message: "查無此訂單" });
  }
}
