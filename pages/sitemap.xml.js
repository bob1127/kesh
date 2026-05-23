// pages/sitemap.xml.js
//
// ISR-equivalent sitemap via getServerSideProps + Cache-Control headers.
//
// How it works (mirrors ISR behavior):
//   s-maxage=3600          → CDN serves cached sitemap for 1 hour  (= ISR revalidate: 3600)
//   stale-while-revalidate=86400 → CDN serves stale while silently regenerating
//                                  for up to 24 h  (= ISR background regeneration)
//
// Result: sitemap is always fresh within 1 hour of any product/category change,
// without hitting the backend on every Google crawl request.

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://kesh-backend-production.up.railway.app";
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const SITE_URL = "https://www.kesh-de1.com";

const LOCALES = ["zh-TW", "en", "ko"];

// zh-TW (default locale) has NO path prefix; en and ko have /en/ and /ko/
function getLocaleUrl(lang, path = "") {
  if (lang === "zh-TW") return `${SITE_URL}${path}`;
  return `${SITE_URL}/${lang}${path}`;
}

// Build <xhtml:link> hreflang block for all locales of a given path
function hreflangLinks(path) {
  const links = LOCALES.map(
    (lang) =>
      `\n      <xhtml:link rel="alternate" hreflang="${lang}" href="${getLocaleUrl(lang, path)}"/>`
  ).join("");
  return (
    links +
    `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${getLocaleUrl("zh-TW", path)}"/>`
  );
}

// Build a single <url> block for one locale of one path
function urlBlock(lang, path, changefreq, priority, lastmod) {
  return `
  <url>
    <loc>${getLocaleUrl(lang, path)}</loc>${hreflangLinks(path)}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
  </url>`;
}

function generateSiteMap({ products, categories, collections }) {
  const staticPages = [
    { path: "",               changefreq: "daily",   priority: "1.0" },
    { path: "/category",      changefreq: "daily",   priority: "0.9" },
    { path: "/about",         changefreq: "monthly", priority: "0.8" },
    { path: "/news",          changefreq: "daily",   priority: "0.8" },
    { path: "/contact",       changefreq: "monthly", priority: "0.7" },
    { path: "/shipping",      changefreq: "monthly", priority: "0.6" },
    { path: "/authenticity",  changefreq: "monthly", priority: "0.7" },
    { path: "/faq",           changefreq: "monthly", priority: "0.6" },
    { path: "/privacy",       changefreq: "yearly",  priority: "0.3" },
    { path: "/brand/Chanel",       changefreq: "weekly", priority: "0.8" },
    { path: "/brand/Hermes",       changefreq: "weekly", priority: "0.8" },
    { path: "/brand/LouisVuitton", changefreq: "weekly", priority: "0.8" },
    { path: "/brand/Dior",         changefreq: "weekly", priority: "0.8" },
  ];

  const staticBlocks = staticPages.flatMap(({ path, changefreq, priority }) =>
    LOCALES.map((lang) => urlBlock(lang, path, changefreq, priority, null))
  );

  const productBlocks = products.flatMap((product) => {
    const lastmod = new Date(
      product.updated_at || product.created_at
    ).toISOString();
    return LOCALES.map((lang) =>
      urlBlock(lang, `/product/${product.handle}`, "weekly", "0.9", lastmod)
    );
  });

  const categoryHandles = [
    ...categories.map((c) => c.handle),
    ...collections.map((c) => c.handle),
  ];
  const categoryBlocks = categoryHandles.flatMap((slug) =>
    LOCALES.map((lang) =>
      urlBlock(lang, `/category/${slug}`, "daily", "0.7", null)
    )
  );

  const now = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Generated: ${now} | Products: ${products.length} | Categories: ${categoryHandles.length} -->
  ${staticBlocks.join("")}
  ${productBlocks.join("")}
  ${categoryBlocks.join("")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const headers = API_KEY ? { "x-publishable-api-key": API_KEY } : {};

  try {
    const [productsRes, categoriesRes, collectionsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/store/products?limit=500`, { headers }).then((r) =>
        r.json()
      ),
      fetch(`${BACKEND_URL}/store/product-categories?limit=500`, {
        headers,
      }).then((r) => r.json()),
      fetch(`${BACKEND_URL}/store/collections?limit=500`, { headers }).then(
        (r) => r.json()
      ),
    ]);

    const products = productsRes.products || [];
    const categories = categoriesRes.product_categories || [];
    const collections = collectionsRes.collections || [];

    const sitemap = generateSiteMap({ products, categories, collections });

    res.setHeader("Content-Type", "text/xml; charset=UTF-8");

    // ISR-equivalent caching:
    // - s-maxage=3600: CDN serves this cached response for 1 hour (no backend hit)
    // - stale-while-revalidate=86400: after 1 hour, CDN serves stale
    //   while silently fetching a fresh version in the background (24h window)
    // This perfectly mirrors ISR revalidate: 3600 behavior.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error("Sitemap: backend unreachable, serving static-only fallback.", error?.message || error);

    // Backend is down — still serve a complete sitemap for all static pages
    // so Google never gets a 500 error and still indexes the important pages.
    const fallbackSitemap = generateSiteMap({ products: [], categories: [], collections: [] });
    res.setHeader("Content-Type", "text/xml; charset=UTF-8");
    // Short cache so it recovers quickly once the backend comes back
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.write(fallbackSitemap);
    res.end();
  }

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
