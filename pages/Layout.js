// components/Layout.js
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "@/components/Navbar/Navbar.jsx"; 
import Banner from "@/components/banner";
import Footer from "@/components/ui/footer.jsx";
import Head from "next/head";
import CartSidebar from "@/components/CartSidebar"; 
import { ReactLenis } from "@studio-freight/react-lenis";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const { t } = useTranslation("common");
  const { locale, asPath } = useRouter();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  const siteUrl = "https://www.kesh-de1.com";
  const siteTitle = t("layout.site_title");
  const siteName = t("layout.site_name");
  const siteDescription = t("layout.site_description");
  const keywords = t("layout.keywords");
  const siteImage = `${siteUrl}/default-og-image.jpg`;
  const storePhone = "0938-535-870";
  const defaultLocale = "zh-TW";
  const isEn = locale === "en";
  const isKo = locale === "ko";
  const ogLocale = isEn ? "en_US" : isKo ? "ko_KR" : "zh_TW";

  // zh-TW (default) has no URL prefix; en and ko have /en/ and /ko/
  const getLocalizedUrl = (loc, path) => {
    const cleanPath = path === "/" ? "" : path;
    if (loc === defaultLocale) return `${siteUrl}${cleanPath}`;
    return `${siteUrl}/${loc}${cleanPath}`;
  };

  const canonicalUrl = getLocalizedUrl(locale, asPath);
  const locales = ["zh-TW", "en", "ko"];

  // Navigation items in the correct locale — gives Google explicit signal for sitelinks
  const navItems = isEn
    ? [
        { name: "All Luxury Goods", url: `${siteUrl}/en/category` },
        { name: "Brand Boutique", url: `${siteUrl}/en/category/all` },
        { name: "Authenticity Guarantee", url: `${siteUrl}/en/authenticity` },
        { name: "Global Shipping", url: `${siteUrl}/en/shipping` },
        { name: "News", url: `${siteUrl}/en/news` },
        { name: "Contact Us", url: `${siteUrl}/en/contact` },
        { name: "About KÉSH de¹", url: `${siteUrl}/en/about` },
        { name: "FAQ", url: `${siteUrl}/en/faq` },
      ]
    : isKo
    ? [
        { name: "전체 명품", url: `${siteUrl}/ko/category` },
        { name: "브랜드관", url: `${siteUrl}/ko/category/all` },
        { name: "정품 보증", url: `${siteUrl}/ko/authenticity` },
        { name: "전 세계 배송", url: `${siteUrl}/ko/shipping` },
        { name: "최신 소식", url: `${siteUrl}/ko/news` },
        { name: "문의하기", url: `${siteUrl}/ko/contact` },
        { name: "KÉSH de¹ 소개", url: `${siteUrl}/ko/about` },
        { name: "자주 묻는 질문", url: `${siteUrl}/ko/faq` },
      ]
    : [
        { name: "全部精品商品", url: `${siteUrl}/category` },
        { name: "品牌館", url: `${siteUrl}/category/all` },
        { name: "正品保證", url: `${siteUrl}/authenticity` },
        { name: "全球配送", url: `${siteUrl}/shipping` },
        { name: "最新消息", url: `${siteUrl}/news` },
        { name: "聯繫凱仕", url: `${siteUrl}/contact` },
        { name: "關於凱仕", url: `${siteUrl}/about` },
        { name: "常見問題", url: `${siteUrl}/faq` },
      ];

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteName,
    url: siteUrl,
    image: siteImage,
    telephone: storePhone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "No. 428, Zhongqing Rd. Sec. 1",
      addressLocality: "North District, Taichung",
      addressRegion: "Taichung",
      postalCode: "404",
      addressCountry: "TW",
    },
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
    itemListElement: navItems.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      url: item.url,
    })),
  };

  return (
    <>
     <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="KÉSH de¹ Boutique" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="canonical" href={canonicalUrl} />

        {/* hreflang: zh-TW (default) has no URL prefix; en/ko have /en/ /ko/ */}
        {locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={getLocalizedUrl(loc, asPath)}
          />
        ))}
        {/* x-default points to the default locale (zh-TW = root) */}
        <link rel="alternate" hrefLang="x-default" href={getLocalizedUrl(defaultLocale, asPath)} />

        <meta property="og:locale" content={ogLocale} key="oglocale" />
        {locales
          .filter((loc) => loc !== locale)
          .map((loc) => (
            <meta
              key={loc}
              property="og:locale:alternate"
              content={loc === "zh-TW" ? "zh_TW" : loc === "en" ? "en_US" : "ko_KR"}
            />
          ))}
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:title" content={siteTitle} key="ogtitle" />
        <meta property="og:description" content={siteDescription} key="ogdesc" />
        <meta property="og:url" content={canonicalUrl} key="ogurl" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={siteImage} key="ogimage" />
        <meta property="og:image:secure_url" content={siteImage} key="ogimagesecure" />

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content={siteTitle} key="twtitle" />
        <meta name="twitter:description" content={siteDescription} key="twdesc" />
        <meta name="twitter:image" content={siteImage} key="twimage" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navJsonLd) }}
        />
      </Head>

      <Navbar />
      <CartSidebar />

      <ReactLenis root>
        <div className="flex flex-col justify-between">
           <main>
             {children}
           </main>
           <div>
             <Banner />
             <Footer />
           </div>
        </div>
      </ReactLenis>
    </>
  );
}