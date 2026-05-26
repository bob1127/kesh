/**
 * Homepage + global sitelinks signals for Google SERP.
 * Sitelinks are chosen by Google; we provide navigation structure + rich JSON-LD.
 */

import { BRAND_AGGREGATE_RATING } from "./news-article-seo";

export const SITE_URL = "https://www.kesh-de1.com";
const DEFAULT_LOCALE = "zh-TW";
const LOCALES = ["zh-TW", "en", "ko"];

export function getLocalizedPath(locale, path = "") {
  const clean = path === "/" ? "" : path;
  if (locale === DEFAULT_LOCALE) return clean || "/";
  return `/${locale}${clean}`;
}

export function getLocalizedUrl(siteUrl, locale, path = "") {
  const base = siteUrl.replace(/\/$/, "");
  const p = getLocalizedPath(locale, path);
  return p === "/" ? base : `${base}${p}`;
}

export function getOgLocale(locale) {
  if (locale === "en") return "en_US";
  if (locale === "ko") return "ko_KR";
  return "zh_TW";
}

/** 依語系回傳 PostalAddress（繁中主站用中文地址） */
export function getBusinessPostalAddress(locale) {
  if (locale === "zh-TW") {
    return {
      "@type": "PostalAddress",
      streetAddress: "台中市北區中清路一段428號",
      addressLocality: "台中市北區",
      addressRegion: "台中市",
      postalCode: "404",
      addressCountry: "TW",
    };
  }
  if (locale === "ko") {
    return {
      "@type": "PostalAddress",
      streetAddress: "No. 428, Zhongqing Rd. Sec. 1",
      addressLocality: "타이중시 북구",
      addressRegion: "타이중시",
      postalCode: "404",
      addressCountry: "TW",
    };
  }
  return {
    "@type": "PostalAddress",
    streetAddress: "No. 428, Zhongqing Rd. Sec. 1",
    addressLocality: "North District, Taichung",
    addressRegion: "Taichung City",
    postalCode: "404",
    addressCountry: "TW",
  };
}

export const DEFAULT_SITE_NAME = "KÉSH de¹ 凱仕國際精品";
export const DEFAULT_SITE_DESCRIPTION =
  "KÉSH de¹ 凱仕國際精品位於台中，提供全新、近全新與精選二手精品販售、代尋、收購、寄售與專業鑑定服務。";

/** 首頁 sitelinks 候選頁（名稱 + 說明，對應 Google 子連結摘要） */
export function getSitelinkPages(locale) {
  if (locale === "en") {
    return [
      {
        path: "/category",
        name: "All Luxury Goods",
        description:
          "Browse authenticated pre-owned Hermès, Chanel, Louis Vuitton, Dior and more.",
      },
      {
        path: "/category/all",
        name: "Brand Boutique",
        description: "Shop by brand — curated luxury collections at KÉSH de¹.",
      },
      {
        path: "/services",
        name: "Luxury Services",
        description:
          "Sourcing, buy-in, consignment, authentication and worldwide shipping.",
      },
      {
        path: "/authenticity",
        name: "Authenticity Guarantee",
        description: "Professional authentication and 100% genuine luxury guarantee.",
      },
      {
        path: "/shipping",
        name: "Global Shipping",
        description: "Worldwide delivery and secure packaging for every order.",
      },
      {
        path: "/news",
        name: "Journal & News",
        description: "Brand stories, care guides and the latest from KÉSH de¹.",
      },
      {
        path: "/contact",
        name: "Contact Us",
        description: "Visit our Taichung boutique or reach our team online.",
      },
      {
        path: "/about",
        name: "About KÉSH de¹",
        description: "Our story, vision and commitment to trusted luxury resale.",
      },
      {
        path: "/faq",
        name: "FAQ",
        description: "Shopping, authentication, shipping and payment questions answered.",
      },
    ];
  }

  if (locale === "ko") {
    return [
      {
        path: "/category",
        name: "전체 명품",
        description: "에르메스, 샤넬, 루이비통, 디올 등 정품 인증 중고 명품.",
      },
      {
        path: "/category/all",
        name: "브랜드관",
        description: "브랜드별 큐레이션 컬렉션을 만나보세요.",
      },
      {
        path: "/services",
        name: "명품 서비스",
        description: "구매 대행, 매입, 위탁, 감정 및 배송 서비스.",
      },
      {
        path: "/authenticity",
        name: "정품 보증",
        description: "전문 감정과 100% 정품 보장 서비스.",
      },
      {
        path: "/shipping",
        name: "전 세계 배송",
        description: "안전 포장과 국제 배송 안내.",
      },
      {
        path: "/news",
        name: "저널 · 소식",
        description: "브랜드 스토리와 케어 가이드, 최신 소식.",
      },
      {
        path: "/contact",
        name: "문의하기",
        description: "대만 타이중 매장 및 온라인 문의.",
      },
      {
        path: "/about",
        name: "KÉSH de¹ 소개",
        description: "브랜드 스토리와 비전.",
      },
      {
        path: "/faq",
        name: "자주 묻는 질문",
        description: "쇼핑, 배송, 결제, 감정 관련 FAQ.",
      },
    ];
  }

  return [
    {
      path: "/category",
      name: "全部精品商品",
      description: "Hermès、Chanel、Louis Vuitton、Dior 等正品二手精品一覧。",
    },
      {
        path: "/category/all",
        name: "品牌館",
        description: "依品牌瀏覽精選二手名牌包與配件。",
      },
      {
        path: "/services",
        name: "精品服務",
        description: "代尋、收購、寄售代售、鑑定與全球配送。",
      },
      {
        path: "/authenticity",
        name: "正品保證",
      description: "專業鑑定流程與 100% 正品承諾。",
    },
    {
      path: "/shipping",
      name: "全球配送",
      description: "宅配、順豐與國際配送說明。",
    },
    {
      path: "/news",
      name: "最新消息",
      description: "品牌專欄、保養知識與活動資訊。",
    },
    {
      path: "/contact",
      name: "聯繫凱仕",
      description: "台中展店地址、電話與線上諮詢。",
    },
    {
      path: "/about",
      name: "關於凱仕",
      description: "KÉSH de¹ 品牌故事與經營理念。",
    },
    {
      path: "/faq",
      name: "常見問題",
      description: "購物、鑑定、配送與付款 FAQ。",
    },
  ];
}

/**
 * @param {{ locale: string, siteUrl?: string, siteName: string, siteDescription: string, homeTitle: string, homeDescription: string, keywords?: string }} opts
 */
export function buildHomePageJsonLd({
  locale,
  siteUrl = SITE_URL,
  siteName,
  siteDescription,
  homeTitle,
  homeDescription,
  keywords = "",
}) {
  const base = siteUrl.replace(/\/$/, "");
  const homeUrl = getLocalizedUrl(base, locale, "/");
  const sitelinks = getSitelinkPages(locale).map((page) => ({
    ...page,
    url: getLocalizedUrl(base, locale, page.path),
  }));

  const organizationId = `${base}/#organization`;
  const websiteId = `${base}/#website`;
  const webpageId = `${homeUrl}#webpage`;

  const postalAddress = getBusinessPostalAddress(locale);

  const navigationElements = sitelinks.map((item, idx) => ({
    "@type": "SiteNavigationElement",
    "@id": `${item.url}#navigation`,
    position: idx + 1,
    name: item.name,
    description: item.description,
    url: item.url,
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        alternateName: ["KÉSH de¹", "凱仕國際精品", "KESH de1"],
        url: base,
        logo: {
          "@type": "ImageObject",
          url: `${base}/images/logo/KESH Logo.png`,
          width: 512,
          height: 512,
        },
        image: `${base}/default-og-image.jpg`,
        description: siteDescription,
        telephone: "+886-938-535-870",
        address: postalAddress,
        sameAs: ["https://www.instagram.com/hello.cieman"],
        aggregateRating: {
          "@type": "AggregateRating",
          ...BRAND_AGGREGATE_RATING,
        },
      },
      {
        "@type": ["Store", "LocalBusiness"],
        "@id": `${base}/#store`,
        name: siteName,
        url: base,
        image: `${base}/default-og-image.jpg`,
        telephone: "0938-535-870",
        priceRange: "$$-$$$$",
        description: siteDescription,
        address: postalAddress,
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
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteName,
        alternateName: "KÉSH de¹ 凱仕國際精品",
        url: homeUrl,
        description: siteDescription,
        inLanguage:
          locale === "en" ? "en-US" : locale === "ko" ? "ko-KR" : "zh-TW",
        publisher: { "@id": organizationId },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: homeUrl,
        name: homeTitle,
        description: homeDescription,
        keywords: keywords || undefined,
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
        inLanguage:
          locale === "en" ? "en-US" : locale === "ko" ? "ko-KR" : "zh-TW",
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${base}/images/logo/KESH Logo.png`,
        },
        hasPart: navigationElements,
      },
      {
        "@type": "ItemList",
        "@id": `${homeUrl}#sitelinks`,
        name:
          locale === "en"
            ? "Main site sections"
            : locale === "ko"
              ? "주요 메뉴"
              : "網站主要頁面",
        itemListElement: sitelinks.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.name,
          description: item.description,
          url: item.url,
        })),
      },
      ...navigationElements,
    ],
  };
}

export { LOCALES, DEFAULT_LOCALE };
