import {
  MEDUSA_BACKEND_URL,
  MEDUSA_PUBLISHABLE_KEY,
  getMedusaStoreHeaders,
} from "@/lib/medusa-store";
import { getCorrectAmount } from "@/lib/price";
import { getLocalizedMetadataTitle } from "@/lib/localized-metadata";

export function getMedusaServerHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (MEDUSA_PUBLISHABLE_KEY) {
    headers["x-publishable-api-key"] = MEDUSA_PUBLISHABLE_KEY;
  }
  return headers;
}

/**
 * 從 Medusa 抓最新商品，格式化成輪播／精選區塊用的結構。
 */
export async function fetchMedusaFeaturedProducts({
  limit = 10,
  locale = "zh-TW",
  collectionHandle = null,
} = {}) {
  const headers = getMedusaServerHeaders();
  const currency =
    locale === "en" ? "usd" : locale === "ko" ? "krw" : "twd";
  const symbol =
    currency === "usd" ? "$ " : currency === "krw" ? "₩ " : "NT$ ";

  let collectionId = null;
  if (collectionHandle) {
    const colRes = await fetch(
      `${MEDUSA_BACKEND_URL}/store/collections?limit=100`,
      { headers },
    );
    if (colRes.ok) {
      const colData = await colRes.json();
      const match = (colData.collections || []).find(
        (c) =>
          String(c.handle || "").toLowerCase() ===
          String(collectionHandle).toLowerCase(),
      );
      collectionId = match?.id || null;
    }
  }

  let url = `${MEDUSA_BACKEND_URL}/store/products?limit=${limit}&order=-created_at&fields=id,title,handle,thumbnail,metadata,*variants,*variants.prices,*collection`;
  if (collectionId) {
    url += `&collection_id[]=${collectionId}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Medusa products fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.products || []).map((p) => {
    const prices = p.variants?.[0]?.prices || [];
    const priceObj =
      prices.find((pr) => pr.currency_code?.toLowerCase() === currency) ||
      prices[0];
    const amount = priceObj
      ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
      : 0;
    const title = getLocalizedMetadataTitle(
      p.metadata,
      p.title,
      locale,
    );

    return {
      id: p.id,
      slug: p.handle,
      handle: p.handle,
      title,
      titleEn: p.metadata?.title_en || p.title,
      titleZh: title,
      price: amount
        ? `${symbol}${Math.round(amount).toLocaleString()}`
        : "",
      rawPrice: amount,
      image: p.thumbnail || "/images/placeholder.jpg",
      shortDesc:
        p.metadata?.condition_zh ||
        p.metadata?.seo_description ||
        "",
      metadata: p.metadata || {},
    };
  });
}

/** Client-side helper re-export for convenience */
export { MEDUSA_BACKEND_URL, getMedusaStoreHeaders };
