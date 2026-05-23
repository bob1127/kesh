/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.kesh-de1.com",

  // This generates public/sitemap.xml for static pages at build time.
  // At runtime, pages/sitemap.xml.js overrides it with a dynamic version
  // that also includes all products and categories fetched from the backend.
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  // Exclude internal/auth pages from the sitemap
  exclude: [
    "/login",
    "/register",
    "/member",
    "/cart",
    "/checkout",
    "/order-lookup",
    "/reset-password",
    "/note",
    "/gallery",
    "/products copy",
    "/api/*",
  ],

  // Transform each URL to have correct locale paths:
  // zh-TW (default locale) → no prefix  /news
  // en                      → /en/news
  // ko                      → /ko/news
  transform: async (config, path) => {
    // next-sitemap may generate /zh-TW/... paths for the default locale —
    // strip that prefix so it matches actual Next.js routing.
    const cleanPath = path.replace(/^\/zh-TW(\/|$)/, "/").replace(/\/$/, "") || "";

    return {
      loc: `https://www.kesh-de1.com${cleanPath}`,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        { href: `https://www.kesh-de1.com${cleanPath}`,        hreflang: "zh-TW"    },
        { href: `https://www.kesh-de1.com/en${cleanPath}`,     hreflang: "en"       },
        { href: `https://www.kesh-de1.com/ko${cleanPath}`,     hreflang: "ko"       },
        { href: `https://www.kesh-de1.com${cleanPath}`,        hreflang: "x-default" },
      ],
    };
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/login", "/register", "/member", "/cart", "/checkout"],
      },
    ],
    additionalSitemaps: [
      // The dynamic sitemap (includes all products + categories with hreflang)
      "https://www.kesh-de1.com/sitemap.xml",
    ],
  },
};
