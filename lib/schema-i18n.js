/**
 * Shared Schema.org / JSON-LD i18n helpers.
 */
import { tFallback } from "./t-fallback";
import {
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_DESCRIPTION,
  getBusinessPostalAddress,
  getOgLocale,
} from "./sitelinks-seo";

export const SCHEMA_PHONE_INTL = "+886-938-535-870";
export const SCHEMA_PHONE_LOCAL = "0938-535-870";

export function getSchemaBrand(t) {
  return {
    siteName: tFallback(t, "layout.site_name", DEFAULT_SITE_NAME),
    siteDescription: tFallback(
      t,
      "layout.site_description",
      DEFAULT_SITE_DESCRIPTION,
    ),
    ogLocale: tFallback(t, "layout.og_locale", getOgLocale("zh-TW")),
  };
}

export function schemaPublisher(siteUrl, siteName) {
  return {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  };
}

export function getFoundingPlaceName(locale) {
  if (locale === "en") return "Taichung, Taiwan";
  if (locale === "ko") return "대만 타이중";
  return "台灣台中市";
}

export function getSchemaBreadcrumbLabels(t, locale) {
  return {
    home: tFallback(t, "schema.breadcrumb_home", locale === "en" ? "Home" : locale === "ko" ? "홈" : "首頁"),
    news: tFallback(t, "schema.breadcrumb_news", locale === "en" ? "Journal" : locale === "ko" ? "소식" : "最新消息"),
    products: tFallback(
      t,
      "schema.breadcrumb_products",
      locale === "en" ? "Products" : locale === "ko" ? "상품" : "商品",
    ),
  };
}

export function getContactPointSchema(locale) {
  const contactType =
    locale === "en"
      ? "customer service"
      : locale === "ko"
        ? "고객 서비스"
        : "客戶服務";
  const availableLanguage =
    locale === "en"
      ? ["English", "Chinese", "Korean"]
      : locale === "ko"
        ? ["Korean", "Chinese", "English"]
        : ["繁體中文", "英文", "韓文"];

  return {
    "@type": "ContactPoint",
    contactType,
    telephone: SCHEMA_PHONE_INTL,
    email: "contact@kesh-de1.com",
    areaServed: "TW",
    availableLanguage,
  };
}

/** Schema.org 建議 dayOfWeek 使用英文列舉值；hours 為本地營業時間 */
export function getOpeningHoursSpecification() {
  return [
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
  ];
}

export function getOrganizationAlternateNames(locale) {
  if (locale === "en") {
    return ["KÉSH de¹", "KESH de1", "Kesh International Luxury"];
  }
  if (locale === "ko") {
    return ["KÉSH de¹", "케이시 드원", "KESH de1"];
  }
  return ["KÉSH de¹", "凱仕國際精品", "KESH de1"];
}

export function getServiceAreaServed(locale) {
  if (locale === "en") return ["TW", "Global"];
  if (locale === "ko") return ["TW", "전 세계"];
  return ["TW", "全球"];
}

export function getSchemaInLanguage(locale) {
  if (locale === "en") return "en-US";
  if (locale === "ko") return "ko-KR";
  return "zh-TW";
}

export function getWebsiteAlternateName(locale) {
  if (locale === "en") return "KÉSH de¹ Luxury Boutique";
  if (locale === "ko") return "KÉSH de¹ 럭셔리 부티크";
  return "KÉSH de¹ 凱仕國際精品";
}

export { getBusinessPostalAddress, getOgLocale };
