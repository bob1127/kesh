/**
 * Shared Product + Offer JSON-LD for category / brand listing pages.
 * Matches fields required by Google Merchant listings.
 */
import { getLocalizedUrl } from "./sitelinks-seo";
import { buildProductSeoDescription } from "./product-seo";
import {
  resolveSchemaImages,
  getSiteHeroUrl,
} from "./schema-images";

export function getPriceValidUntil() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
}

export function getOfferCurrency(locale) {
  if (locale === "en") return "USD";
  if (locale === "ko") return "KRW";
  return "TWD";
}

export function buildMerchantOfferSchema({
  url,
  price,
  currency,
  sellerName,
  inStock = true,
}) {
  return {
    "@type": "Offer",
    url,
    priceCurrency: currency,
    price,
    priceValidUntil: getPriceValidUntil(),
    itemCondition: "https://schema.org/UsedCondition",
    availability: inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    seller: {
      "@type": "Organization",
      name: sellerName,
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: 0,
        currency,
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "TW",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 2,
          unitCode: "d",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 3,
          unitCode: "d",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "TW",
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnInStore",
      returnFees: "https://schema.org/FreeReturn",
    },
  };
}

export function buildListingProductSchema({
  product,
  locale = "zh-TW",
  siteUrl,
  sellerName,
  metaLang,
  fallbackImage,
}) {
  const currentLocale = locale || "zh-TW";
  const currency = getOfferCurrency(currentLocale);
  const productUrl = getLocalizedUrl(
    siteUrl,
    currentLocale,
    `/product/${product.slug}`,
  );
  const name = product.metadata?.[`title_${metaLang}`] || product.title || "";
  const brandName = product.brand || "KÉSH de¹";
  const condition = product.status || product.metadata?.rank || "";
  const subtitle =
    product.subtitle ||
    product.metadata?.[`subtitle_${metaLang}`] ||
    product.metadata?.subtitle ||
    "";
  const description = buildProductSeoDescription({
    brand: brandName,
    title: name,
    condition,
    subtitle,
    description: product.description || product.shortDesc || "",
    locale: currentLocale,
    customDesc: "",
  });
  const sku = String(product.sku || product.id || product.slug || "");
  const productImages = resolveSchemaImages({
    candidates: [product.image, product.thumbnail, ...(product.images || [])],
    siteUrl,
    fallback: fallbackImage || getSiteHeroUrl(siteUrl),
  });
  const primaryImage = productImages[0];

  return {
    "@type": "Product",
    name,
    url: productUrl,
    image: productImages.length === 1 ? primaryImage : productImages,
    description,
    sku,
    mpn: sku,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: buildMerchantOfferSchema({
      url: productUrl,
      price: product.rawPrice,
      currency,
      sellerName,
      inStock: product.inStock !== false,
    }),
  };
}

export function buildProductItemListSchema({
  products = [],
  locale,
  siteUrl,
  sellerName,
  metaLang,
  fallbackImage,
  limit = 12,
}) {
  return (products || []).slice(0, limit).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: buildListingProductSchema({
      product,
      locale,
      siteUrl,
      sellerName,
      metaLang,
      fallbackImage,
    }),
  }));
}
