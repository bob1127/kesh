// pages/api/categories.js

export default async function handler(req, res) {
  // 🔥 1. 取得前端傳過來的 lang 參數 (例如 'zh', 'en', 'ko')
  const { lang } = req.query;

  const baseUrl = process.env.WC_SITE_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (!baseUrl || !key || !secret) {
    return res.status(500).json({
      error: "WooCommerce env variables are not set",
    });
  }

  try {
    // 建議使用 v3 版本較穩定，並加上 hide_empty=false
    let url =
      `${baseUrl}/wp-json/wc/v3/products/categories` +
      `?per_page=100&hide_empty=false&orderby=name&order=asc` +
      `&consumer_key=${encodeURIComponent(key)}` +
      `&consumer_secret=${encodeURIComponent(secret)}`;

    // 🔥 2. 如果前端有傳 lang，就把它加進 WooCommerce 的請求中！
    if (lang) {
      url += `&lang=${lang}`;
    }

    const wcRes = await fetch(url);
    const text = await wcRes.text();

    let allCategories = [];
    try {
      allCategories = JSON.parse(text);
    } catch (e) {
      console.error("解析 WooCommerce 回應失敗：", text);
      return res.status(500).json({
        error: "failed to parse WooCommerce response",
      });
    }

    if (!wcRes.ok || !Array.isArray(allCategories)) {
      console.error("WooCommerce API error:", wcRes.status, text);
      return res.status(500).json({
        error: "failed to fetch product categories from WooCommerce",
      });
    }

    console.log(`成功抓取 ${lang || '預設'} 語言的全部分類數量:`, allCategories.length);

    // 🔥 3. 我們不需要在後端篩選父子分類了，直接把該語言的「所有分類」回傳給前端
    // 前端的 Navbar (SlideTabsExample) 會自己透過 includes('brand') 去抓出對應的子分類
    return res.status(200).json(allCategories);
    
  } catch (error) {
    console.error("Unhandled WooCommerce API error:", error);
    return res.status(500).json({
      error: "unexpected error while fetching categories",
      detail: String(error),
    });
  }
}