/**
 * Resolve absolute, non-placeholder image URLs for JSON-LD / Open Graph.
 */
import { SITE_URL } from "./sitelinks-seo";

export const SITE_LOGO_PATH = "/images/logo/KESH Logo.png";
export const SITE_HERO_PATH =
  "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_12.jpg";

const PLACEHOLDER_PATTERN =
  /placeholder\.jpg|default-og-image\.jpg|default\.png/i;

export function toAbsoluteImageUrl(url, siteUrl = SITE_URL) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const base = (siteUrl || SITE_URL).replace(/\/$/, "");
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

export function isPlaceholderImage(url) {
  if (!url) return true;
  return PLACEHOLDER_PATTERN.test(String(url));
}

export function resolveSchemaImage({
  candidates = [],
  siteUrl = SITE_URL,
  fallback = SITE_HERO_PATH,
} = {}) {
  for (const candidate of candidates) {
    const absolute = toAbsoluteImageUrl(candidate, siteUrl);
    if (absolute && !isPlaceholderImage(absolute)) return absolute;
  }
  return toAbsoluteImageUrl(fallback, siteUrl);
}

export function resolveSchemaImages({
  candidates = [],
  siteUrl = SITE_URL,
  fallback = SITE_HERO_PATH,
} = {}) {
  const urls = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const absolute = toAbsoluteImageUrl(candidate, siteUrl);
    if (absolute && !isPlaceholderImage(absolute) && !seen.has(absolute)) {
      seen.add(absolute);
      urls.push(absolute);
    }
  }

  if (urls.length === 0) {
    const fb = resolveSchemaImage({ candidates: [], siteUrl, fallback });
    if (fb) urls.push(fb);
  }

  return urls;
}

export function getSiteLogoUrl(siteUrl = SITE_URL) {
  return toAbsoluteImageUrl(SITE_LOGO_PATH, siteUrl);
}

export function getSiteHeroUrl(siteUrl = SITE_URL) {
  return toAbsoluteImageUrl(SITE_HERO_PATH, siteUrl);
}

export function buildSchemaImageObject(
  url,
  siteUrl = SITE_URL,
  { width = 1200, height = 630 } = {},
) {
  const absolute = resolveSchemaImage({ candidates: [url], siteUrl });
  if (!absolute) return undefined;
  return {
    "@type": "ImageObject",
    url: absolute,
    width,
    height,
  };
}

/** Pages that define their own JSON-LD — skip global Layout Store schema. */
export function pathnameHasDedicatedJsonLd(pathname) {
  if (!pathname) return false;
  if (pathname === "/") return true;
  if (pathname.startsWith("/product/")) return true;
  if (pathname === "/category" || pathname.startsWith("/category/")) return true;
  if (pathname === "/news" || pathname.startsWith("/news/")) return true;
  if (pathname.startsWith("/brand/")) return true;
  if (
    [
      "/about",
      "/contact",
      "/faq",
      "/services",
      "/service",
      "/shipping",
      "/authenticity",
      "/privacy",
    ].includes(pathname)
  ) {
    return true;
  }
  return false;
}
