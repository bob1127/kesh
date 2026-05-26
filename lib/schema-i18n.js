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
  return {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: SCHEMA_PHONE_INTL,
    email: "contact@kesh-de1.com",
    areaServed: "TW",
    availableLanguage:
      locale === "en"
        ? ["English", "Chinese", "Korean"]
        : locale === "ko"
          ? ["Korean", "Chinese", "English"]
          : ["Chinese", "English", "Korean"],
  };
}

export { getBusinessPostalAddress, getOgLocale };
