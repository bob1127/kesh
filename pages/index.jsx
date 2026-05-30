// pages/index.js
import React, { useRef, useState, useCallback, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-marquee-slider";
import https from "https";
import useEmblaCarousel from "embla-carousel-react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import CollectionShowcase from "@/components/ProductGridShowcase";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import HeroSlider from "../components/Slider/Slider";
import ParallaxImage from "../components/ParallaxImage";
import Gallery from "../components/ImageTextSlider";
import FullSlider from "../components/HeroSlideContact/page";
import Scroll from "../components/Scroll";
import HeroCarousel from "../components/HeroCarousel";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import {
  SITE_URL,
  LOCALES,
  DEFAULT_LOCALE,
  getLocalizedUrl,
  getOgLocale,
  buildHomePageJsonLd,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_DESCRIPTION,
} from "@/lib/sitelinks-seo";
import { tFallback } from "@/lib/t-fallback";
import { getSiteHeroUrl } from "@/lib/schema-images";

export default function Home({ featuredProducts, jsonLd: jsonLdFromProps }) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();
  // --- 1. 頁面滾動特效 ---
  const scrollRef = useRef(null);
  const { scrollY } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });
  const y1 = useTransform(scrollY, [0, 1000], [0, 100]);

  // --- 2. 輪播設定 (調整為更流暢的滑動) ---
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const onSelect = useCallback((api) => {
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // --- 3. 字數限制小工具 (限制 15 字) ---
  const truncateTitle = (str, limit = 15) => {
    if (!str) return "";
    return str.length > limit ? str.substring(0, limit) + "..." : str;
  };

  const siteTitle = t("home.seo.title");
  const siteDescription = t("home.seo.description");
  const siteName = tFallback(t, "layout.site_name", DEFAULT_SITE_NAME);
  const siteDescriptionGlobal = tFallback(
    t,
    "layout.site_description",
    DEFAULT_SITE_DESCRIPTION,
  );
  const keywords = t("home.seo.keywords");
  const ogLocale = getOgLocale(locale);
  const canonicalUrl = getLocalizedUrl(SITE_URL, locale, "/");
  const ogImage =
    featuredProducts?.find((p) => p.image && !p.image.includes("placeholder"))
      ?.image || getSiteHeroUrl(SITE_URL);

  const jsonLd = jsonLdFromProps;

  return (
    <>
      <Head>
        <title key="title">{siteTitle}</title>
        <meta name="description" content={siteDescription} key="description" />
        <meta name="keywords" content={keywords} key="keywords" />
        <meta name="author" content="KÉSH de¹ Boutique" key="author" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          key="robots"
        />
        <link rel="canonical" href={canonicalUrl} key="canonical" />

        {LOCALES.map((loc) => (
          <link
            key={`hreflang-${loc}`}
            rel="alternate"
            hrefLang={loc}
            href={getLocalizedUrl(SITE_URL, loc, "/")}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={getLocalizedUrl(SITE_URL, DEFAULT_LOCALE, "/")}
          key="hreflang-x-default"
        />

        <meta property="og:locale" content={ogLocale} key="oglocale" />
        {LOCALES.filter((loc) => loc !== locale).map((loc) => (
          <meta
            key={`og-alt-${loc}`}
            property="og:locale:alternate"
            content={
              loc === "zh-TW" ? "zh_TW" : loc === "en" ? "en_US" : "ko_KR"
            }
          />
        ))}
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:title" content={siteTitle} key="ogtitle" />
        <meta property="og:description" content={siteDescription} key="ogdesc" />
        <meta property="og:url" content={canonicalUrl} key="ogurl" />
        <meta property="og:site_name" content={siteName} key="ogsitename" />
        <meta property="og:image" content={ogImage} key="ogimage" />
        <meta
          property="og:image:secure_url"
          content={ogImage}
          key="ogimagesecure"
        />

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content={siteTitle} key="twtitle" />
        <meta
          name="twitter:description"
          content={siteDescription}
          key="twdesc"
        />
        <meta name="twitter:image" content={ogImage} key="twimage" />

        {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          key="home-jsonld"
        />
        )}
      </Head>
      <HeroCarousel />
      <CollectionShowcase />
      <ParallaxProvider>
        <section className="flex relative gap-4 ">
          <div className="text absolute left-1/2 -translate-x-1/2 top-[40%] -translate-y-1/2 z-50">
            <div className="flex flex-col justify-center items-center">
              <h3 className="text-xl text-stone-100">
                {t("home.editorial_title")}
              </h3>
              <h3 className="text-xl text-stone-100">
                {t("home.editorial_subtitle")}
              </h3>
            </div>
          </div>
          <Marquee velocity={25}>
            {[
              "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_19.jpg",
              "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_3.jpg",
              "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_2.jpg",
              "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_27.jpg",
              "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_4.jpg",
            ].map((src, index) => (
              <div key={index} className="px-2">
                <Parallax speed={index % 2 === 0 ? 10 : 5}>
                  <img
                    src={src}
                    className="w-[480px] h-[700px] object-cover"
                    alt="Handbag"
                  />
                </Parallax>
              </div>
            ))}
          </Marquee>
        </section>
      </ParallaxProvider>

      {/* =======================================================
          🔥 極簡雜誌風格輪播 (Updated Style)
      ======================================================= */}
      <section className="pt-10 relative container mx-auto px-6 md:px-12">
        {/* 標題與控制按鈕區 */}
        <div className="flex justify-between items-end mb-10 px-2">
          <h2 className="text-2xl md:text-3xl lg:mt-10 font-normal tracking-[0.2em] uppercase text-gray-900">
            Featured Collections
          </h2>
          {/* 極簡箭頭 */}
          <div className="hidden md:flex gap-6">
            <button
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className="text-gray-400 hover:text-black transition-colors disabled:opacity-20"
            >
              <span className="text-2xl">←</span>
            </button>
            <button
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className="text-gray-400 hover:text-black transition-colors disabled:opacity-20"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>
        </div>

        {/* Embla Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-6 md:-ml-8">
            {featuredProducts &&
              featuredProducts.map((slide, index) => (
                <div
                  className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 pl-6 md:pl-8 relative"
                  key={slide.id || index}
                >
                  {/* 🔥 風格修改重點：
                   1. 移除 border, shadow, rounded
                   2. 圖片改為 4:5 比例 (aspect-[4/5])
                   3. 文字靠左 (text-left)
                */}
                  <Link
                    href={`/product/${slide.slug}`}
                    className="group block w-full"
                  >
                    {/* 圖片區域：極簡、無框 */}
                    <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50 mb-5">
                      <img
                        src={slide.image}
                        className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                        alt={slide.titleEn}
                      />
                    </div>

                    {/* 文字區域：極簡排版 */}
                    <div className="flex flex-col items-start space-y-1">
                      {/* 上方小字：價格或系列名 (灰色、全大寫、寬間距) */}
                      <span className="text-[11px] md:text-[12px] text-gray-500 uppercase tracking-[0.15em] font-medium">
                        {slide.price}
                      </span>

                      {/* 主標題：限制 15 字 (黑色、襯線體或乾淨無襯線) */}
                      <h3 className="text-[15px] md:text-[16px] text-gray-900 font-normal tracking-wide leading-relaxed group-hover:text-gray-600 transition-colors">
                        {truncateTitle(slide.titleZh || slide.titleEn, 15)}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </section>
      {/* ======================================================= */}

      <div ref={scrollRef} className="relative z-10">
        <section className="feature  ">
          <Gallery />
        </section>

        <section className="h-full py-5 md:py-20">
          <div className="container flex lg:flex-row flex-col max-w-[1920px] w-full xl:w-[85%] mx-auto">
            <div className="left w-full lg:w-1/2 p-5">
              <h2 className="text-[1.5rem] max-w-[500px] mx-auto text-left font-[400]">
                {t("home.philosophy_title")}
              </h2>
              <Scroll />
            </div>
            <div className="left justify-between flex flex-col w-full lg:w-1/2 md:px-8 px-0 2xl:px-20">
              <div className="txt flex pb-4 flex-col justify-center items-center h-full">
                <p className="text-[1rem] w-[80%] md:w-2/3 leading-relaxed -tracking-tighter">
                  {t("home.philosophy_desc")}
                </p>
                <b className="text-[1.2rem] font-bold mt-6">
                  {t("home.vision_title")}
                </b>
                <p className="text-[1rem] mt-7 w-[80%] md:w-2/3 leading-relaxed -tracking-tighter">
                  {t("home.vision_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="app">
          <section className="overflow-hidden">
            <FullSlider />
          </section>
          <section className="relative w-screen mt-5 h-screen overflow-hidden flex justify-center items-center">
            <div className="w-full h-full absolute top-0 left-0 overflow-hidden">
              <ParallaxImage
                src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_5.jpg"
                alt=""
              />
            </div>
            <div className="relative text-center z-10">
              <h1 className="uppercase text-white text-[3rem] xl:text-[5rem] font-normal tracking-[-1px] leading-none">
                {/* 🔥 替換標題 */}
                {t("home.contact_title")}
              </h1>
              {/* 💡 順便幫你加上 Link 導向，這樣點擊按鈕才會真正前往 contact 頁面 */}
              <Link href="/contact">
                <button className="border mt-3 border-stone-300 px-3 py-1 text-[#f0f0f0] bg-[#f83f23] rounded-full hover:bg-white hover:text-[#f83f23] transition-colors">
                  {/* 🔥 替換按鈕文字 */}
                  {t("home.contact_btn")}
                </button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// --- SSG: 服務端抓取資料 ---
// --- SSG: 服務端抓取資料 ---
function loadHomeJsonLd(currentLang, featuredImage = "") {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(
    process.cwd(),
    "public/locales",
    currentLang,
    "common.json",
  );
  const msgs = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return buildHomePageJsonLd({
    locale: currentLang,
    siteName: msgs.layout?.site_name,
    siteDescription: msgs.layout?.site_description,
    homeTitle: msgs.home?.seo?.title,
    homeDescription: msgs.home?.seo?.description,
    keywords: msgs.home?.seo?.keywords || "",
    featuredImage,
  });
}

export async function getStaticProps({ locale }) {
  const currentLang = locale || "zh-TW";

  // ==========================================
  // 🛠️ 1. Vercel Build 階段多語系除錯區塊
  // ==========================================
  console.log(
    `\n=== 🔍 [Build Debug] 準備處理首頁，當前語系: ${currentLang} ===`,
  );

  const fs = require("fs");
  const path = require("path");
  const localeDir = path.resolve("./public/locales", currentLang);

  console.log(`📂 預期的翻譯檔路徑: ${localeDir}`);

  try {
    if (fs.existsSync(localeDir)) {
      const files = fs.readdirSync(localeDir);
      console.log(`✅ 成功找到資料夾！裡面的檔案包含:`, files);
    } else {
      console.error(
        `❌ 嚴重錯誤：找不到 ${currentLang} 語系的資料夾！(Vercel 沒有正確打包)`,
      );
    }
  } catch (error) {
    console.error(`❌ 讀取資料夾時發生例外錯誤:`, error);
  }
  // ==========================================

  const WC_URL = process.env.WC_SITE_URL;
  const CK = process.env.WC_CONSUMER_KEY;
  const CS = process.env.WC_CONSUMER_SECRET;

  if (!WC_URL || !CK || !CS) {
    console.error("❌ 環境變數缺失！請檢查 Vercel 後台設定。");
    return {
      props: {
        featuredProducts: [],
        jsonLd: loadHomeJsonLd(currentLang),
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  }

  const https = require("https"); // 確保 https 在伺服器端被正確載入
  const agent = new https.Agent({ rejectUnauthorized: false });
  const auth = Buffer.from(`${CK}:${CS}`).toString("base64");
  const headers = {
    "User-Agent": "Mozilla/5.0 (Next.js)",
    Authorization: `Basic ${auth}`,
  };

  try {
    console.log(`🌐 正在向 WooCommerce 請求商品資料...`);
    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?status=publish&per_page=10`,
      { agent, headers },
    );

    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const products = await res.json();
    console.log(`✅ 成功抓取到 ${products.length} 筆商品`);

    const formattedSlides = products.map((p) => {
      let imageUrl = "/images/placeholder.jpg"; // ⚠️ 記得確保 public/images/ 裡面有這張圖
      if (p.images && p.images.length > 0) {
        let src = p.images[0].src;
        if (src.startsWith("http://")) {
          src = src.replace("http://", "https://");
        }
        imageUrl = src;
      }

      const price = `NT$ ${parseInt(p.price || 0).toLocaleString()}`;
      const cleanDesc = (p.short_description || "")
        .replace(/<[^>]+>/g, "")
        .trim();
      const titleZh = cleanDesc || p.name;

      return {
        id: p.id,
        slug: p.slug,
        titleEn: p.name,
        titleZh: titleZh,
        price: price,
        image: imageUrl,
      };
    });

    console.log(`🎉 [Build Debug] ${currentLang} 語系處理完成！\n`);

    const featuredImage =
      formattedSlides.find(
        (p) => p.image && !String(p.image).includes("placeholder"),
      )?.image || "";
    const jsonLd = loadHomeJsonLd(currentLang, featuredImage);

    return {
      props: {
        ...(await serverSideTranslations(currentLang, ["common"])),
        featuredProducts: formattedSlides,
        jsonLd,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("❌ WooCommerce API 抓取失敗:", error.message);
    return {
      props: {
        featuredProducts: [],
        jsonLd: loadHomeJsonLd(currentLang),
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
      revalidate: 60,
    };
  }
}
