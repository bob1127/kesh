import React from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import Slider from "../components/HeroSlider/page";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import ParallaxImage from "../components/ParallaxImage";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// --- 子元件：文字區塊動畫設定 ---
const FadeInSection = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function About() {
  const { t } = useTranslation("common");

  // 從多語系檔案取得資料
  const seo = t("about.seo", { returnObjects: true });
  const ui = t("about.ui", { returnObjects: true });
  const corp = t("about.corporate", { returnObjects: true });
  const legal = t("about.legal", { returnObjects: true });
  const sections = t("about.sections", { returnObjects: true });
  const spiritItems = t("about.spirit_items", { returnObjects: true });
  const guaranteeItems = t("about.guarantee_items", { returnObjects: true });

  const siteUrl = "https://www.kesh-de1.com";

  // --- 結構化資料 (JSON-LD) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: corp.name_val,
        url: siteUrl,
        logo: `${siteUrl}/images/logo.png`,
        description: seo.schema_desc,
        foundingLocation: {
          "@type": "Place",
          name: "Taichung, Taiwan",
        },
      },
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}/about#webpage`,
        url: `${siteUrl}/about`,
        name: seo.schema_name,
        description: seo.description,
        mainEntity: {
          "@id": `${siteUrl}#organization`,
        },
      },
    ],
  };

  // 1. Slider 資料 (圖片輪播通常不需多語系，維持靜態)
  const sliderData = [
    {
      id: 1,
      src: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_19.jpg",
      name: "PhotoGraphy",
      year: "2023",
    },
    {
      id: 2,
      src: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_7.jpg",
      name: "EtherShift-Demo",
      year: "2021",
    },
    {
      id: 3,
      src: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_12.jpg",
      name: "EtherShift-Demo",
      year: "2021",
    },
    {
      id: 4,
      src: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_16.jpg",
      name: "EtherShift-Demo",
      year: "2021",
    },
  ];

  return (
    <ReactLenis root>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/about`} />
        <meta
          property="og:image"
          content="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_7.jpg"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="bg-white min-h-screen">
        <Slider slides={sliderData} />

        <main className="relative z-10 bg-[#1A1A1A]">
          {/* Section A: 品牌故事 */}
          <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
              {/* 左側：標題 + 圖片 */}
              <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-32">
                <FadeInSection>
                  <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">
                    {ui.hero_subtitle}
                  </h2>
                  <h1
                    className="text-2xl md:text-3xl lg:text-3xl font-serif font-medium leading-tight text-gray-900 mb-8"
                    dangerouslySetInnerHTML={{ __html: ui.hero_title }}
                  />
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm bg-gray-100">
                    <Image
                      src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_7.jpg"
                      alt="KÉSH de¹ Interior"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                  </div>
                </FadeInSection>
              </div>

              {/* 右側：文字內容 */}
              <div className="lg:col-span-7 flex flex-col gap-10 lg:pt-20 text-gray-600 font-light leading-loose text-justify">
                <FadeInSection delay={0.2}>
                  <p className="text-xl text-[#F6F1EB] font-medium mb-4">
                    {ui.story_title}
                  </p>
                  <p className="mb-4 text-[#F6F1EB]">{ui.story_p1}</p>
                </FadeInSection>

                <FadeInSection delay={0.3}>
                  <p
                    className="text-[#F6F1EB]"
                    dangerouslySetInnerHTML={{ __html: ui.story_p2 }}
                  />
                  <p className="mt-4 text-[#F6F1EB]">{ui.story_p3}</p>
                </FadeInSection>

                <FadeInSection delay={0.4}>
                  <blockquote className="relative border-l-2 border-[#F6F1EB] pl-8 py-2 my-6 italic text-[#F6F1EB] text-lg">
                    <span className="absolute -top-4 left-4 text-4xl text-[#F6F1EB] font-serif">
                      “
                    </span>
                    {ui.story_quote}
                  </blockquote>
                </FadeInSection>

                {/* 公司登記資訊 */}
                <FadeInSection
                  delay={0.45}
                  className="py-6 border-t border-gray-700/50"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    {corp.title}
                  </h3>

                  <div className="text-[16px] text-[#F6F1EB] space-y-4 leading-relaxed">
                    <p dangerouslySetInnerHTML={{ __html: corp.p1 }} />
                    <p dangerouslySetInnerHTML={{ __html: corp.p2 }} />
                  </div>

                  <div className="mt-6 text-[16px] text-[#F6F1EB] space-y-1">
                    <h4 className="font-bold text-white mb-2 text-base">
                      {corp.info_title}
                    </h4>
                    <p>
                      {corp.name_label}{" "}
                      <span className="font-bold text-white">
                        {corp.name_val}
                      </span>
                    </p>
                    <p>
                      {corp.en_name_label}{" "}
                      <span className="font-bold text-white">
                        {corp.en_name_val}
                      </span>
                    </p>
                    <p>
                      {corp.vat_label}{" "}
                      <span className="font-bold text-white">
                        {corp.vat_val}
                      </span>
                    </p>
                    <p>
                      {corp.reg_label}{" "}
                      <span className="font-bold text-white">
                        {corp.reg_val}
                      </span>
                    </p>
                  </div>

                  {/* Legal Notice */}
                  <div className="mt-8 pt-6 border-t border-gray-700/50 text-xs text-gray-400 space-y-6 leading-relaxed">
                    <div>
                      <h4 className="font-bold text-[#F6F1EB] text-[16px] mb-2">
                        {legal.notice_title}
                      </h4>
                      <p
                        className="mb-2"
                        dangerouslySetInnerHTML={{ __html: legal.notice_p1 }}
                      />
                      <p>
                        {legal.notice_p2}{" "}
                        <span className="font-bold text-gray-200">
                          {legal.notice_p2_val}
                        </span>
                      </p>
                      <p>
                        {legal.notice_p3}{" "}
                        <span className="font-bold text-gray-200">
                          {legal.notice_p3_val}
                        </span>
                      </p>
                      <p
                        className="mt-2"
                        dangerouslySetInnerHTML={{ __html: legal.notice_p4 }}
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-[#F6F1EB] text-[16px] mb-2">
                        {legal.auth_title}
                      </h4>
                      <p dangerouslySetInnerHTML={{ __html: legal.auth_p1 }} />
                      <p
                        className="mt-1"
                        dangerouslySetInnerHTML={{ __html: legal.auth_p2 }}
                      />
                      <p
                        className="mt-1"
                        dangerouslySetInnerHTML={{ __html: legal.auth_p3 }}
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-[#F6F1EB] text-[16px] mb-2">
                        {legal.nonaff_title}
                      </h4>
                      <p
                        dangerouslySetInnerHTML={{ __html: legal.nonaff_p1 }}
                      />
                      <p className="mt-1">{legal.nonaff_p2}</p>
                    </div>
                  </div>
                </FadeInSection>

                <Link
                  href="/contact"
                  className="group relative text-stone-400 inline-flex hover:bg-white hover:text-stone-800 duration-500 items-center justify-center mt-4 h-14 w-[14rem] border-white border-1 text-[16px] tracking-widest"
                >
                  {ui.btn_contact}
                </Link>
                <FadeInSection delay={0.5}>
                  <div className="h-[1px] w-20 bg-gray-200 mt-8 mb-4"></div>
                  <p className="text-[16px] text-gray-400 tracking-wider">
                    EST. TAICHUNG
                  </p>
                </FadeInSection>
              </div>
            </div>
          </section>

          {/* 過渡大圖 */}
          <div className="w-full h-screen relative">
            <div className="txt absolute w-[400px] z-50 left-[13%] top-1/2 -translate-y-1/2">
              <img
                src="/images/about/logo_wh.svg"
                alt=""
                className="w-[500px]"
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden will-change-transform">
              <ParallaxImage
                src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_5.jpg"
                alt=""
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* 代購區塊 */}
            <div className="relative w-full min-h-[70vh] lg:h-screen">
              <div className="absolute bg-black/50 w-full h-full z-20 left-0 top-0"></div>
              <div className="relative lg:sticky z-50 pr-4 lg:pr-8 w-full flex justify-end top-[200px] h-auto lg:h-[200px]">
                <div className="mt-5 text-right w-2/3 lg:w-1/2">
                  <h3 className="text-white text-[32px] lg:text-[42px]">
                    {sections.sourcing_en}
                  </h3>
                  <h3 className="text-white text-[20px] lg:text-[28px]">
                    {sections.sourcing_ch}
                  </h3>
                  <p className="text-white text-[14px] leading-relaxed mt-2">
                    {sections.sourcing_desc}
                  </p>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden will-change-transform">
                <ParallaxImage
                  src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_7.jpg"
                  alt=""
                />
              </div>
            </div>

            {/* 鑑定區塊 */}
            <div className="relative w-full min-h-[70vh] lg:h-screen">
              <div className="absolute bg-black/50 w-full h-full z-20 left-0 top-0"></div>
              <div className="relative z-50 lg:sticky pr-4 lg:pr-8 w-full flex justify-end top-[200px] h-auto lg:h-[250px]">
                <div className="mt-5 text-right w-2/3 lg:w-1/2">
                  <h3 className="text-white text-[32px] lg:text-[42px]">
                    {sections.auth_en}
                  </h3>
                  <h3 className="text-white text-[20px] lg:text-[28px]">
                    {sections.auth_ch}
                  </h3>
                  <p
                    className="text-white text-[14px] leading-relaxed mt-2"
                    dangerouslySetInnerHTML={{ __html: sections.auth_desc }}
                  />
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden will-change-transform">
                <ParallaxImage
                  src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_3.jpg"
                  alt=""
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 mt-12 lg:mt-20 gap-10 lg:gap-0">
            {/* 左側圖片群 */}
            <div className="space-y-10">
              <div className="relative w-full overflow-hidden rounded-2xl">
                <div className="relative h-[60vh] min-h-[420px] lg:h-screen">
                  <div className="absolute inset-0 flex justify-center">
                    <div className="w-[94%] h-full overflow-hidden will-change-transform">
                      <ParallaxImage
                        src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_10.jpg"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-10">
                <div className="relative w-full">
                  <div className="relative h-[420px] sm:h-[480px] lg:h-[520px]">
                    <div className="absolute inset-0 flex justify-end sm:pr-6 pr-4">
                      <div className="w-[94%] max-w-[420px] max-h-[420px] overflow-hidden will-change-transform">
                        <ParallaxImage
                          src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_8.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative w-full">
                  <div className="relative h-[420px] sm:h-[480px] lg:h-[520px]">
                    <div className="absolute inset-0 flex justify-center">
                      <div className="w-[94%] max-w-[420px] max-h-[420px] overflow-hidden will-change-transform">
                        <ParallaxImage
                          src="/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_1.jpg"
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側文字 */}
            <div className="relative">
              <div className="flex flex-col justify-end px-4 sm:px-6 lg:pl-10 lg:pr-8 lg:sticky lg:top-[200px] h-auto lg:h-[300px]">
                <h2
                  className="text-[28px] sm:text-[36px] lg:text-[42px] font-light text-[#F6F1EB] leading-snug"
                  dangerouslySetInnerHTML={{ __html: sections.vision_title }}
                />
                <p className="text-[#F6F1EB] mb-5 font-light leading-loose tracking-wider text-[14px] sm:text-[16px] mt-4 sm:mt-5 w-full max-w-prose">
                  {sections.vision_desc}
                </p>

                <Link
                  href="/contact"
                  className="group relative py-5 text-stone-400 inline-flex hover:bg-white hover:text-stone-800 duration-500 items-center justify-center mt-4 h-14 w-[14rem] border-white border-1 text-[16px] tracking-widest"
                >
                  {ui.btn_more}
                </Link>
              </div>
            </div>
          </div>

          {/* Section C: 服務精神 & 三大保證 */}
          <section className="px-6 py-24 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              {/* 左欄：服務精神 */}
              <div>
                <FadeInSection>
                  <h4 className="text-2xl font-serif mb-10 border-b border-gray-200 pb-4">
                    {sections.spirit_en}{" "}
                    <span className="text-[16px] font-sans text-gray-400 ml-2">
                      {sections.spirit_ch}
                    </span>
                  </h4>
                  <ul className="space-y-6">
                    {spiritItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="group flex items-baseline justify-between hover:bg-gray-50 px-4 py-3 -mx-4 rounded transition-colors"
                      >
                        <div>
                          <span className="font-serif text-lg text-[#ef4628] mr-3">
                            {item.en}
                          </span>
                          <span className="text-[16px] text-gray-500">
                            {item.desc}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {item.ch}
                        </span>
                      </li>
                    ))}
                  </ul>
                </FadeInSection>
              </div>

              {/* 右欄：三大保證 */}
              <div>
                <FadeInSection delay={0.2}>
                  <h4 className="text-2xl font-serif mb-10 border-b border-gray-200 pb-4">
                    {sections.guarantee_en}{" "}
                    <span className="text-[16px] font-sans text-gray-400 ml-2">
                      {sections.guarantee_ch}
                    </span>
                  </h4>
                  <div className="grid gap-6">
                    {guaranteeItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-6 rounded-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-end mb-3">
                          <h5 className="text-xl font-medium text-gray-900">
                            {item.title}
                          </h5>
                          <span className="text-xs text-gray-400 tracking-wider uppercase">
                            {item.sub}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[16px] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </FadeInSection>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ReactLenis>
  );
}

// --- SSG: 服務端注入翻譯 ---
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "zh-TW", ["common"])),
    },
  };
}
