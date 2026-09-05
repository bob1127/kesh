// pages/api/order-lookup.js — Medusa 訂單查詢
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

    const backend = (
      process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      ""
    ).replace(/\/$/, "");
    const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

    if (!backend || !pubKey) {
      return res.status(500).json({ message: "商店設定不完整" });
    }

    const lookupRes = await fetch(`${backend}/store/order-lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": pubKey,
      },
      body: JSON.stringify({ orderId: id, email: mail }),
    });

    if (!lookupRes.ok) {
      return res.status(404).json({ message: "查無此訂單" });
    }

    const data = await lookupRes.json();
    if (!data?.order) {
      return res.status(404).json({ message: "查無此訂單" });
    }

    return res.status(200).json({ order: data.order });
  } catch (err) {
    console.error("[order-lookup]", err);
    return res.status(404).json({ message: "查無此訂單" });
  }
}
