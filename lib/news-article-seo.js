/**
 * News / Journal article SEO + JSON-LD (@graph)
 * Merges Medusa admin structured_data with storefront enrichment.
 */

import { getBusinessPostalAddress } from "./sitelinks-seo";

const SITE_URL = "https://www.kesh-de1.com";

/** 請依 Google 商家實際評分更新（勿虛構） */
export const BRAND_AGGREGATE_RATING = {
  ratingValue: "4.9",
  reviewCount: "120",
  bestRating: "5",
  worstRating: "1",
};

export function stripHtml(html = "") {
  return String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function getArticlePath(locale, slug) {
  const prefix = locale === "zh-TW" ? "" : `/${locale}`;
  return `${prefix}/news/${slug}`;
}

export function getArticleUrl(siteUrl, locale, slug) {
  const base = (siteUrl || SITE_URL).replace(/\/$/, "");
  return `${base}${getArticlePath(locale, slug)}`;
}

export function getOgLocale(locale) {
  if (locale === "en") return "en_US";
  if (locale === "ko") return "ko_KR";
  return "zh_TW";
}

const PLACEHOLDER_MAP = (post, siteUrl, locale) => {
  const postUrl = getArticleUrl(siteUrl || SITE_URL, locale || "zh-TW", post.slug);
  return {
    "%seo_title%": post.seo_title || post.title || "",
    "%seo_description%":
      post.seo_description || stripHtml(post.excerpt) || "",
    "%keywords%": post.seo_keywords || "",
    "%thumbnail%": post.image || "",
    "%date_published%": post.raw_created_at || "",
    "%date_modified%": post.raw_updated_at || "",
    "%article_url%": postUrl,
  };
};

export function extractProductSlugsFromHtml(html = "") {
  const slugs = new Set();
  const re = /\/product\/([a-zA-Z0-9_-]+)/gi;
  let m;
  while ((m = re.exec(html)) !== null) slugs.add(m[1]);
  return [...slugs];
}

function replacePlaceholdersInValue(val, map) {
  if (typeof val === "string") {
    let out = val;
    Object.entries(map).forEach(([k, v]) => {
      out = out.split(k).join(v);
    });
    return out;
  }
  if (Array.isArray(val)) return val.map((v) => replacePlaceholdersInValue(v, map));
  if (val && typeof val === "object") {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [k, replacePlaceholdersInValue(v, map)]),
    );
  }
  return val;
}

export function parseBackendGraph(raw, post, locale = "zh-TW", siteUrl = SITE_URL) {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    const map = PLACEHOLDER_MAP(post, siteUrl, locale);
    const nodes = parsed["@graph"]
      ? parsed["@graph"]
      : parsed["@type"]
        ? [parsed]
        : [];
    return nodes.map((node) => replacePlaceholdersInValue(node, map));
  } catch {
    return [];
  }
}

function organizationNode(siteUrl, locale, siteName, siteDescription) {
  const id = `${siteUrl}/#organization`;
  return {
    "@type": "Organization",
    "@id": id,
    name: siteName,
    alternateName: "KÉSH de¹ 凱仕國際精品",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/images/logo/KESH Logo.png`,
      width: 512,
      height: 512,
    },
    image: `${siteUrl}/default-og-image.jpg`,
    description: siteDescription,
    telephone: "+886-938-535-870",
    address: getBusinessPostalAddress(locale),
    sameAs: [
      "https://www.instagram.com/hello.cieman",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ...BRAND_AGGREGATE_RATING,
    },
  };
}

function storeNode(siteUrl, locale, siteName, siteDescription) {
  return {
    "@type": ["Store", "LocalBusiness"],
    "@id": `${siteUrl}/#store`,
    name: siteName,
    url: siteUrl,
    image: `${siteUrl}/default-og-image.jpg`,
    telephone: "0938-535-870",
    priceRange: "$$-$$$$",
    description: siteDescription,
    address: getBusinessPostalAddress(locale),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "13:00",
        closes: "20:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ...BRAND_AGGREGATE_RATING,
    },
  };
}

function websiteNode(siteUrl, locale, siteName) {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url: siteUrl,
    inLanguage: locale === "en" ? "en" : locale === "ko" ? "ko" : "zh-TW",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

function blogPostingNode({
  post,
  postUrl,
  headline,
  description,
  locale,
  siteUrl,
  siteName,
  articleType = "BlogPosting",
}) {
  const wordCount = stripHtml(post.content).length;
  return {
    "@type": articleType,
    "@id": `${postUrl}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    headline,
    name: headline,
    description,
    image: {
      "@type": "ImageObject",
      url: post.image,
      width: 1200,
      height: 630,
    },
    thumbnailUrl: post.image,
    datePublished: post.raw_created_at,
    dateModified: post.raw_updated_at,
    author: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo/KESH Logo.png`,
      },
    },
    keywords: post.seo_keywords || undefined,
    articleSection:
      locale === "en"
        ? "Luxury Journal"
        : locale === "ko"
          ? "럭셔리 저널"
          : "精品專欄",
    inLanguage: locale === "en" ? "en-US" : locale === "ko" ? "ko-KR" : "zh-TW",
    isAccessibleForFree: true,
    wordCount: wordCount > 0 ? wordCount : undefined,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["article h1", "article .prose h2", "article .prose p"],
    },
  };
}

function webPageNode(postUrl, headline, description, post) {
  return {
    "@type": "WebPage",
    "@id": postUrl,
    url: postUrl,
    name: headline,
    description,
    primaryImageOfPage: { "@type": "ImageObject", url: post.image },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

function breadcrumbNode(siteUrl, locale, post, postUrl, labels) {
  const newsUrl =
    locale === "zh-TW" ? `${siteUrl}/news` : `${siteUrl}/${locale}/news`;
  return {
    "@type": "BreadcrumbList",
    "@id": `${postUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: labels.home,
        item: locale === "zh-TW" ? siteUrl : `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: labels.news,
        item: newsUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };
}

function productNode(product, siteUrl, locale) {
  const url =
    locale === "zh-TW"
      ? `${siteUrl}/product/${product.handle}`
      : `${siteUrl}/${locale}/product/${product.handle}`;

  const brand =
    product.metadata?.brand_zh ||
    product.metadata?.brand ||
    product.brand ||
    "";

  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description: stripHtml(product.description || "").slice(0, 300) || undefined,
    image: product.thumbnail || product.image,
    url,
    brand: brand
      ? { "@type": "Brand", name: brand }
      : undefined,
    offers: product.price
      ? {
          "@type": "Offer",
          url,
          priceCurrency: product.currency || "TWD",
          price: product.price,
          availability: "https://schema.org/InStock",
          seller: { "@id": `${siteUrl}/#organization` },
        }
      : undefined,
  };
}

const DEDUPE_TYPES = new Set([
  "Organization",
  "WebSite",
  "Store",
  "LocalBusiness",
  "WebPage",
  "BreadcrumbList",
]);

function mergeGraphs(coreNodes, backendNodes) {
  const graph = [...coreNodes];

  for (const node of backendNodes) {
    const type = node["@type"];
    const types = Array.isArray(type) ? type : [type];

    if (type === "FAQPage") {
      graph.push(node);
      continue;
    }

    if (types.some((t) => ["Article", "BlogPosting", "NewsArticle"].includes(t))) {
      const idx = graph.findIndex((n) => {
        const nt = n["@type"];
        const nts = Array.isArray(nt) ? nt : [nt];
        return nts.some((t) =>
          ["Article", "BlogPosting", "NewsArticle"].includes(t),
        );
      });
      if (idx >= 0) {
        graph[idx] = { ...graph[idx], ...node, "@id": graph[idx]["@id"] };
      } else {
        graph.push(node);
      }
      continue;
    }

    if (types.some((t) => DEDUPE_TYPES.has(t))) continue;

    if (type === "Product") {
      graph.push(node);
      continue;
    }

    graph.push(node);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * @param {object} opts
 * @param {object} opts.post
 * @param {string} opts.locale
 * @param {string} opts.siteUrl
 * @param {{ home: string, news: string, siteName: string, siteDescription: string }} opts.labels
 * @param {Array} opts.relatedProducts
 */
export function buildArticleJsonLd({
  post,
  locale,
  siteUrl = SITE_URL,
  labels,
  relatedProducts = [],
}) {
  const base = siteUrl.replace(/\/$/, "");
  const postUrl = getArticleUrl(base, locale, post.slug);
  const headline = post.seo_title || post.title;
  const description =
    post.seo_description || stripHtml(post.excerpt) || headline;

  const backendNodes = parseBackendGraph(
    post.structured_data,
    post,
    locale,
    base,
  );

  let articleType = "BlogPosting";
  const backendArticle = backendNodes.find((n) => {
    const t = n["@type"];
    const ts = Array.isArray(t) ? t : [t];
    return ts.some((x) =>
      ["Article", "BlogPosting", "NewsArticle"].includes(x),
    );
  });
  if (backendArticle?.["@type"]) {
    articleType = Array.isArray(backendArticle["@type"])
      ? backendArticle["@type"][0]
      : backendArticle["@type"];
  }

  const core = [
    organizationNode(base, locale, labels.siteName, labels.siteDescription),
    storeNode(base, locale, labels.siteName, labels.siteDescription),
    websiteNode(base, locale, labels.siteName),
    webPageNode(postUrl, headline, description, post),
    blogPostingNode({
      post,
      postUrl,
      headline,
      description,
      locale,
      siteUrl: base,
      siteName: labels.siteName,
      articleType,
    }),
    breadcrumbNode(base, locale, post, postUrl, labels),
    ...relatedProducts.map((p) => productNode(p, base, locale)),
  ];

  const graph = mergeGraphs(core, backendNodes);

  if (relatedProducts.length > 0) {
    graph["@graph"].push({
      "@type": "ItemList",
      "@id": `${postUrl}#mentioned-products`,
      name:
        locale === "en"
          ? "Products mentioned in this article"
          : locale === "ko"
            ? "이 글에서 언급된 상품"
            : "本文提及商品",
      itemListElement: relatedProducts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url:
          locale === "zh-TW"
            ? `${base}/product/${p.handle}`
            : `${base}/${locale}/product/${p.handle}`,
        name: p.title,
      })),
    });
  }

  return graph;
}

export async function fetchProductsForArticle(html, backendUrl, headers) {
  const slugs = extractProductSlugsFromHtml(html);
  if (!slugs.length) return [];

  const results = await Promise.all(
    slugs.slice(0, 5).map(async (handle) => {
      try {
        const res = await fetch(
          `${backendUrl}/store/products?handle=${encodeURIComponent(handle)}&fields=id,title,handle,thumbnail,description,metadata,*variants,*variants.prices`,
          { headers },
        );
        const data = await res.json();
        const raw = data.products?.[0];
        if (!raw) return null;

        const variant = raw.variants?.[0];
        const price = variant?.calculated_price?.calculated_amount;
        const currency =
          variant?.calculated_price?.currency_code?.toUpperCase() || "TWD";

        return {
          handle: raw.handle || "",
          title: raw.title || "",
          description: raw.description ?? null,
          thumbnail: raw.thumbnail ?? null,
          image: raw.thumbnail ?? null,
          metadata: raw.metadata || {},
          brand:
            raw.metadata?.brand_zh ||
            raw.metadata?.brand ||
            raw.metadata?.brand_en ||
            null,
          price: price != null ? String(Math.round(price)) : null,
          currency: currency || "TWD",
        };
      } catch {
        return null;
      }
    }),
  );

  return results.filter(Boolean);
}
