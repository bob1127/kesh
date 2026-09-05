// pages/api/member/orders.js — Medusa 會員訂單（需 Bearer token）
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const backend = (
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.MEDUSA_BACKEND_URL ||
    ""
  ).replace(/\/$/, "");
  const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  if (!backend || !pubKey) {
    return res.status(500).json({ message: "商店設定不完整" });
  }

  try {
    const fields = [
      "id",
      "display_id",
      "email",
      "currency_code",
      "created_at",
      "payment_status",
      "status",
      "total",
      "subtotal",
      "shipping_total",
      "metadata",
      "*shipping_address",
      "*billing_address",
      "*items",
    ].join(",");

    const ordersRes = await fetch(
      `${backend}/store/orders?limit=50&order=-created_at&fields=${encodeURIComponent(fields)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-publishable-api-key": pubKey,
        },
      },
    );

    if (!ordersRes.ok) {
      return res
        .status(ordersRes.status)
        .json({ message: "無法取得訂單" });
    }

    const data = await ordersRes.json();
    const orders = (data.orders || []).map((order) => {
      const sAddr = order.shipping_address || {};
      const paymentMethod =
        order.metadata?.payment_method === "ATM"
          ? "ATM 轉帳"
          : order.metadata?.payment_method === "APPLE_PAY"
            ? "Apple Pay"
            : order.metadata?.payment_method === "GOOGLE_PAY"
              ? "Google Pay"
              : order.metadata?.payment_method === "SAMSUNG_PAY"
                ? "Samsung Pay"
                : order.metadata?.payment_method === "PAYPAL"
                  ? "PayPal"
                  : "線上刷卡";

      return {
        id: order.display_id || order.id,
        medusa_id: order.id,
        status: order.payment_status || order.status,
        date_created: order.created_at,
        payment_method_title: paymentMethod,
        currency: (order.currency_code || "twd").toUpperCase(),
        total: order.total ?? 0,
        shipping_total: order.shipping_total ?? 0,
        transaction_id: order.metadata?.tappay_rec_trade_id || "",
        line_items: (order.items || []).map((it) => ({
          id: it.id,
          name: it.title || it.product_title || "Item",
          quantity: it.quantity,
          total: it.total ?? it.unit_price ?? 0,
          image: it.thumbnail || null,
        })),
        shipping: {
          first_name: sAddr.first_name || "",
          last_name: sAddr.last_name || "",
          phone: sAddr.phone || "",
          address_1: sAddr.address_1 || "",
          city: sAddr.city || "",
          state: sAddr.province || "",
          postcode: sAddr.postal_code || "",
          country: sAddr.country_code || "",
        },
        billing: {
          first_name: sAddr.first_name || "",
          last_name: sAddr.last_name || "",
          phone: sAddr.phone || "",
          email: order.email || "",
        },
        shipping_lines: [
          {
            method_title:
              order.metadata?.sf_waybill_no
                ? `順豐速運 ${order.metadata.sf_waybill_no}`
                : "宅配到府",
          },
        ],
      };
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Medusa Orders Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
