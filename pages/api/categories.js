// pages/api/categories.js — Medusa 商品分類
import {
  MEDUSA_BACKEND_URL,
  getMedusaServerHeaders,
} from "@/lib/medusa-products";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const headers = getMedusaServerHeaders();
    const catRes = await fetch(
      `${MEDUSA_BACKEND_URL}/store/product-categories?limit=100`,
      { headers },
    );

    if (!catRes.ok) {
      return res.status(catRes.status).json({
        error: "failed to fetch product categories from Medusa",
      });
    }

    const data = await catRes.json();
    const categories = (data.product_categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.handle,
      parent: c.parent_category_id || 0,
      count: 0,
      image: c.metadata?.image_url || null,
    }));

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Unhandled Medusa categories error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
