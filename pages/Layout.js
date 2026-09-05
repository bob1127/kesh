// components/Layout.js
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "@/components/Navbar/Navbar.jsx"; 
import Banner from "@/components/banner";
import Footer from "@/components/ui/footer.jsx";
import Head from "next/head";
import CartSidebar from "@/components/CartSidebar"; 
import FixedSocialBar from "@/components/FixedSocialBar";
import SmoothScroll from "@/components/SmoothScroll";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import {
  SITE_URL,
  DEFAULT_LOCALE,
  getLocalizedUrl,
  getSitelinkPages,
  getBusinessPostalAddress,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_DESCRIPTION,
} from "@/lib/sitelinks-seo";
import { tFallback } from "@/lib/t-fallback";
import { getOpeningHoursSpecification } from "@/lib/schema-i18n";
import {
  pathnameHasDedicatedJsonLd,
  getSiteHeroUrl,
} from "@/lib/schema-images";
import { NOTO_SERIF_TC_CSS, isChineseLocale, getHtmlLang } from "@/lib/fonts";

export default function Layout({ children }) {
  const { t } = useTranslation("common");
  const { locale, asPath, pathname } = useRouter();
  const isHomePage = pathname === "/";

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = getHtmlLang(locale);
  }, [locale]);

  const isZh = isChineseLocale(locale);

  const siteUrl = SITE_URL;
  const siteTitle = tFallback(t, "layout.site_title", DEFAULT_SITE_NAME);
  const siteName = tFallback(t, "layout.site_name", DEFAULT_SITE_NAME);
  const siteDescription = tFallback(
    t,
    "layout.site_description",
    DEFAULT_SITE_DESCRIPTION,
  );
  const siteImage = getSiteHeroUrl(siteUrl);
  const skipGlobalJsonLd = pathnameHasDedicatedJsonLd(pathname);
  const storePhone = "0938-535-870";
  const defaultLocale = DEFAULT_LOCALE;
  const isEn = locale === "en";
  const isKo = locale === "ko";
  const ogLocale = isEn ? "en_US" : isKo ? "ko_KR" : "zh_TW";

  const canonicalUrl = getLocalizedUrl(siteUrl, locale, asPath);
  const locales = ["zh-TW", "en", "ko"];

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteName,
    url: siteUrl,
    image: siteImage,
    telephone: storePhone,
    address: getBusinessPostalAddress(locale),
    openingHoursSpecification: getOpeningHoursSpecification(),
    sameAs: [
      "https://www.instagram.com/hello.cieman",
    ],
    priceRange: "$$-$$$$",
    description: siteDescription,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: "KÉSH de¹ 凱仕國際精品",
    url: siteUrl,
    inLanguage: isEn ? "en" : isKo ? "ko" : "zh-TW",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // Explicit site navigation — helps Google identify important pages for sitelinks
  const navJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: isEn ? "Main Navigation" : isKo ? "메인 내비게이션" : "主要選單",
    itemListElement: getSitelinkPages(locale).map((page, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: page.name,
      description: page.description,
      url: getLocalizedUrl(siteUrl, locale, page.path),
    })),
  };

  return (
    <>
     <Head>
        {isZh && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin=""
            />
            <link href={NOTO_SERIF_TC_CSS} rel="stylesheet" />
          </>
        )}

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {!isHomePage && (
          <>
            {/* 各頁面自行設定 title / description，避免 layout.site_title 覆蓋 */}
            <meta name="author" content="KÉSH de¹ Boutique" />
            {/* key 與各頁專屬 SEO Head 對齊，避免與 product/news 的 canonical 重複 */}
            <link rel="canonical" href={canonicalUrl} key="canonical" />

            {locales.map((loc) => (
              <link
                key={`hreflang-${loc}`}
                rel="alternate"
                hrefLang={loc}
                href={getLocalizedUrl(siteUrl, loc, asPath)}
              />
            ))}
            <link
              rel="alternate"
              hrefLang="x-default"
              href={getLocalizedUrl(siteUrl, defaultLocale, asPath)}
              key="hreflang-default"
            />

            <meta property="og:locale" content={ogLocale} key="oglocale" />
            {locales
              .filter((loc) => loc !== locale)
              .map((loc) => (
                <meta
                  key={loc}
                  property="og:locale:alternate"
                  content={
                    loc === "zh-TW"
                      ? "zh_TW"
                      : loc === "en"
                        ? "en_US"
                        : "ko_KR"
                  }
                />
              ))}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:url" content={canonicalUrl} key="ogurl" />
            {!skipGlobalJsonLd && (
              <meta property="og:image" content={siteImage} key="ogimage" />
            )}
            {!skipGlobalJsonLd && (
              <meta
                property="og:image:secure_url"
                content={siteImage}
                key="ogimagesecure"
              />
            )}

            {!skipGlobalJsonLd && (
              <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(websiteJsonLd),
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(navJsonLd) }}
            />
              </>
            )}
          </>
        )}
      </Head>

      <Navbar />
      <CartSidebar />
      <FixedSocialBar />

      <SmoothScroll>
        <div className="flex flex-col justify-between">
          <main>{children}</main>
          <div>
            <Banner />
            <Footer />
          </div>
        </div>
      </SmoothScroll>
    </>
  );
}