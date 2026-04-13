import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// 動畫設定
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const imageReveal = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Authenticity() {
  const { t } = useTranslation("common");

  const pageTitle = t("authenticity.seo_title");
  const pageDesc = t("authenticity.seo_desc");

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDesc,
    publisher: {
      "@type": "Organization",
      name: "KÉSH de¹ 凱仕國際精品",
    },
  };

  return (
    <ReactLenis root>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      <div className="bg-white min-h-screen text-gray-900 pb-24">
        {/* ================= 1. Hero 圖片標題區塊 ================= */}
        <div className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden pt-20">
          <Image
            src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2000&auto=format&fit=crop"
            alt="Authenticity Verification"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative z-10 text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-serif font-medium mb-4 text-white tracking-widest uppercase drop-shadow-lg"
            >
              {t("authenticity.page_title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-200 font-light tracking-widest uppercase text-xs md:text-sm drop-shadow-md"
            >
              {t("authenticity.page_subtitle")}
            </motion.p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-10 relative z-20">
          {/* ================= 2. 核心承諾 (向上浮動的卡片設計) ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white p-8 md:p-16 mb-20 md:mb-32 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] -mt-16 relative rounded-sm"
          >
            <h3 className="text-2xl md:text-3xl font-serif mb-8 text-center text-black">
              {t("authenticity.commitment_title")}
            </h3>
            <p className="text-gray-600 leading-loose text-justify md:text-center text-sm md:text-base font-light max-w-3xl mx-auto mb-10">
              {t("authenticity.commitment_desc1")}
              <span className="font-bold text-black mx-1">
                {t("authenticity.commitment_highlight")}
              </span>
              {t("authenticity.commitment_desc2")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-6 py-2.5 bg-[#ef4628] text-white text-xs font-bold tracking-widest uppercase rounded-sm">
                {t("authenticity.badge_tech")}
              </span>
              <span className="px-6 py-2.5 border border-black text-black text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors rounded-sm">
                {t("authenticity.badge_human")}
              </span>
            </div>
          </motion.div>

          {/* ================= 3. 詳細服務條款 ================= */}
          <div className="space-y-24 md:space-y-32">
            {/* 區塊 A: 鑑定流程 (圖文 Grid) */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="grid md:grid-cols-12 gap-10 md:gap-16 items-start"
            >
              {/* 左側文字 */}
              <div className="md:col-span-7 space-y-10">
                <h2 className="text-3xl font-serif flex items-center mb-8">
                  <span className="text-[#ef4628] text-4xl mr-4 font-light">
                    01
                  </span>
                  {t("authenticity.process_title")}
                </h2>

                <div className="space-y-8">
                  <div className="flex flex-col pb-6 border-b border-gray-100 relative group">
                    <span className="absolute -left-4 top-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-[#ef4628] font-bold">
                      ›
                    </span>
                    <h4 className="text-lg font-bold text-black mb-3 font-serif">
                      {t("authenticity.process_1_title")}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-light">
                      {t("authenticity.process_1_desc")}
                    </p>
                  </div>
                  <div className="flex flex-col pb-6 border-b border-gray-100 relative group">
                    <span className="absolute -left-4 top-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-[#ef4628] font-bold">
                      ›
                    </span>
                    <h4 className="text-lg font-bold text-black mb-3 font-serif">
                      {t("authenticity.process_2_title")}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-light">
                      {t("authenticity.process_2_desc")}
                    </p>
                  </div>
                  <div className="flex flex-col relative group">
                    <span className="absolute -left-4 top-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-[#ef4628] font-bold">
                      ›
                    </span>
                    <h4 className="text-lg font-bold text-black mb-3 font-serif">
                      {t("authenticity.process_3_title")}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-light">
                      {t("authenticity.process_3_desc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* 右側圖片 */}
              <motion.div
                variants={imageReveal}
                className="md:col-span-5 relative w-full h-[500px] overflow-hidden rounded-sm bg-gray-50"
              >
                <Image
                  src="https://images.unsplash.com/photo-1599643478514-4a820c56a8e8?q=80&w=800&auto=format&fit=crop"
                  alt="Authentication Process"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </motion.section>

            {/* 區塊 B: 保養服務 (黑底滿版區塊內嵌圖文) */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="bg-[#1A1A1A] text-[#F6F1EB] rounded-sm overflow-hidden flex flex-col md:flex-row items-stretch">
                {/* 左側圖片 */}
                <div className="w-full md:w-1/2 relative h-[300px] md:h-auto min-h-[400px]">
                  <Image
                    src="https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop"
                    alt="Leather Care"
                    fill
                    className="object-cover opacity-80 mix-blend-luminosity"
                  />
                </div>

                {/* 右側文字 */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                  <h2 className="text-3xl font-serif mb-8 flex items-center">
                    <span className="text-[#ef4628] text-4xl mr-4 font-light">
                      02
                    </span>
                    {t("authenticity.care_title")}
                  </h2>
                  <h4 className="text-xl font-medium mb-5 tracking-wide">
                    {t("authenticity.care_subtitle")}
                  </h4>
                  <p className="leading-loose font-light opacity-90 mb-8 text-sm text-justify">
                    {t("authenticity.care_desc1")}
                    <span className="text-[#ef4628] font-medium mx-1">
                      {t("authenticity.care_highlight")}
                    </span>
                    {t("authenticity.care_desc2")}
                  </p>
                  <ul className="text-sm space-y-4 font-light opacity-80 list-none">
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-[#ef4628] rounded-full mr-3"></span>
                      {t("authenticity.care_list_1")}
                    </li>
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-[#ef4628] rounded-full mr-3"></span>
                      {t("authenticity.care_list_2")}
                    </li>
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-[#ef4628] rounded-full mr-3"></span>
                      {t("authenticity.care_list_3")}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>
          </div>

          {/* ================= 4. 底部聯繫 CTA ================= */}
          <div className="mt-24 pt-16 border-t border-gray-200 text-center mb-10">
            <h3 className="text-2xl font-serif mb-4">Have Questions?</h3>
            <p className="text-gray-500 text-sm mb-8 font-light tracking-wide max-w-lg mx-auto leading-relaxed">
              {t("authenticity.contact_desc")}
            </p>
            <Link
              href="/contact"
              className="inline-block border-b-2 border-black pb-1 text-sm font-bold tracking-widest uppercase hover:text-[#ef4628] hover:border-[#ef4628] transition-colors"
            >
              {t("authenticity.contact_btn")}
            </Link>
          </div>
        </div>
      </div>
    </ReactLenis>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "zh-TW", ["common"])),
    },
  };
}
