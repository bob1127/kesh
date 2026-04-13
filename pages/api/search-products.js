// pages/api/search-products.js
import https from "https";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { q = "", lang = "zh" } = req.query;

  if (!q) {
    return res.status(200).json([]);
  }

  const WC_URL = process.env.WC_SITE_URL;
  const CK = process.env.WC_CONSUMER_KEY;
  const CS = process.env.WC_CONSUMER_SECRET;

  if (!WC_URL || !CK || !CS) {
    return res.status(500).json({ message: "WooCommerce API credentials missing" });
  }

  const agent = new https.Agent({ rejectUnauthorized: false });
  const auth = Buffer.from(`${CK}:${CS}`).toString("base64");
  const headers = {
    "User-Agent": "Mozilla/5.0 (Next.js)",
    Authorization: `Basic ${auth}`,
  };

  try {
    // 呼叫 Woo API，搭配 search 與 lang 參數
    const response = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?search=${encodeURIComponent(q)}&status=publish&per_page=5&lang=${lang}`,
      { agent, headers }
    );

    if (!response.ok) throw new Error("Failed to fetch from WooCommerce");

    const data = await response.json();

    // 整理成前端下拉選單需要的精簡格式
    const formattedProducts = data.map((p) => {
      let imageUrl = "/images/placeholder.jpg";
      if (p.images && p.images.length > 0) {
        let src = p.images[0].src;
        if (src.startsWith("http://")) src = src.replace("http://", "https://");
        imageUrl = src;
      }
      return {
        id: p.id,
        slug: p.slug,
        title: p.name,
        price: `NT$ ${parseInt(p.price || 0).toLocaleString()}`,
        image: imageUrl,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Live Search API Error:", error);
    res.status(500).json([]);
  }
}