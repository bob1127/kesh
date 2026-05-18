// pages/sitemap.xml.js
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://kesh-backend-production.up.railway.app";
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const SITE_URL = "https://www.kesh-de1.com";

// 🚀 負責把所有資料組裝成標準的 Google 搜尋引擎 XML 格式
function generateSiteMap({ products, categories, collections }) {
  const locales = ["zh-TW", "en", "ko"];
  const staticPages = ["", "/news", "/contact", "/shipping", "/authenticity"];

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages
      .map((page) => {
        return locales
          .map((lang) => {
            const prefix = lang === "zh-TW" ? "/zh-TW" : `/${lang}`;
            return `
      <url>
        <loc>${SITE_URL}${prefix}${page}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`;
          })
          .join("");
      })
      .join("")}

    ${products
      .map((product) => {
        return locales
          .map((lang) => {
            const prefix = lang === "zh-TW" ? "/zh-TW" : `/${lang}`;
            return `
      <url>
        <loc>${SITE_URL}${prefix}/product/${product.handle}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
        <lastmod>${new Date(product.updated_at || product.created_at).toISOString()}</lastmod>
      </url>`;
          })
          .join("");
      })
      .join("")}

    ${[
      ...categories.map((c) => c.handle),
      ...collections.map((c) => c.handle)
    ]
      .map((slug) => {
        return locales
          .map((lang) => {
            const prefix = lang === "zh-TW" ? "/zh-TW" : `/${lang}`;
            return `
      <url>
        <loc>${SITE_URL}${prefix}/category/${slug}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>`;
          })
          .join("");
      })
      .join("")}
  </urlset>
 `;
}

// 🧠 核心魔法：利用 SSR 在使用者或 Googlebot 請求的當下，秒速去後端抓取最新狀態
export async function getServerSideProps({ res }) {
  const headers = API_KEY ? { "x-publishable-api-key": API_KEY } : {};

  try {
    // 同步向 Medusa 發出請求，抓取目前資料庫最高上限 250 筆的最新商品與分類
    const [productsRes, categoriesRes, collectionsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/store/products?limit=250`, { headers }).then((r) => r.json()),
      fetch(`${BACKEND_URL}/store/product-categories?limit=250`, { headers }).then((r) => r.json()),
      fetch(`${BACKEND_URL}/store/collections?limit=250`, { headers }).then((r) => r.json())
    ]);

    const products = productsRes.products || [];
    const categories = categoriesRes.product_categories || [];
    const collections = collectionsRes.collections || [];

    // 生成 XML 字串
    const sitemap = generateSiteMap({ products, categories, collections });

    // 🎯 資安與網路優化設定：告訴瀏覽器這是一支 XML 檔案，並設定快取防抖動
    res.setHeader("Content-Type", "text/xml");
    // 設定快取策略：10分鐘內直接用快取，10分鐘後在背景默默向後端更新 (確保效能與即時性兼具)
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=59");
    
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error("生成動態 Sitemap 失敗:", error);
    res.statusCode = 500;
    res.end();
  }

  return {
    props: {}, // SSR 必備返回
  };
}

export default function Sitemap() {
  // 這個元件完全不需要渲染任何 HTML，因為 getServerSideProps 已經把 XML 吐出去了
  return null;
}