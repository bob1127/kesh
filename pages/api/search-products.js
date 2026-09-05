// pages/api/search-products.js — Medusa 商品搜尋（autocomplete）
import {
  MEDUSA_BACKEND_URL,
  getMedusaServerHeaders,
} from "@/lib/medusa-products";
import { getCorrectAmount } from "@/lib/price";
import { getLocalizedMetadataTitle } from "@/lib/localized-metadata";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const q = String(req.query.q || "").trim();
  const lang = String(req.query.lang || "zh-TW");

  if (!q) {
    return res.status(200).json({ products: [] });
  }

  try {
    const headers = getMedusaServerHeaders();
    const currency =
      lang === "en" || lang === "en-US" ? "usd" : lang === "ko" ? "krw" : "twd";
    const symbol =
      currency === "usd" ? "$ " : currency === "krw" ? "₩ " : "NT$ ";

    const searchRes = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products?q=${encodeURIComponent(q)}&limit=5&fields=id,title,handle,thumbnail,metadata,*variants,*variants.prices`,
      { headers },
    );

    if (!searchRes.ok) {
      throw new Error("Failed to fetch from Medusa");
    }

    const data = await searchRes.json();
    const products = (data.products || []).map((p) => {
      const prices = p.variants?.[0]?.prices || [];
      const priceObj =
        prices.find((pr) => pr.currency_code?.toLowerCase() === currency) ||
        prices[0];
      const amount = priceObj
        ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
        : 0;

      return {
        id: p.id,
        slug: p.handle,
        name: getLocalizedMetadataTitle(p.metadata, p.title, lang),
        price: amount
          ? `${symbol}${Math.round(amount).toLocaleString()}`
          : "",
        images: p.thumbnail
          ? [{ src: p.thumbnail }]
          : [{ src: "/images/placeholder.jpg" }],
      };
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error("[search-products]", error);
    return res.status(500).json({ message: error.message || "Search failed" });
  }
}
