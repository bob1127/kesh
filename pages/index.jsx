// pages/index.js
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Marquee from "react-marquee-slider";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import CollectionShowcase from "@/components/ProductGridShowcase";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
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
} from "@/lib/sitelinks-seo";
import { tFallback } from "@/lib/t-fallback";
import { getSiteHeroUrl } from "@/lib/schema-images";

export default function Home({ jsonLd: jsonLdFromProps }) {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  const siteTitle = t("home.seo.title");
  const siteDescription = t("home.seo.description");
  const siteName = tFallback(t, "layout.site_name", DEFAULT_SITE_NAME);
  const keywords = t("home.seo.keywords");
  const ogLocale = getOgLocale(locale);
  const canonicalUrl = getLocalizedUrl(SITE_URL, locale, "/");
  const ogImage = getSiteHeroUrl(SITE_URL);

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

      <div className="relative z-10">
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
                {t("home.contact_title")}
              </h1>
              <Link href="/contact">
                <button className="border mt-3 border-stone-300 px-3 py-1 text-[#f0f0f0] bg-[#f83f23] rounded-full hover:bg-white hover:text-[#f83f23] transition-colors">
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

  return {
    props: {
      ...(await serverSideTranslations(currentLang, ["common"])),
      jsonLd: loadHomeJsonLd(currentLang, getSiteHeroUrl(SITE_URL)),
    },
    revalidate: 60,
  };
}
