import React from "react";
import Head from "next/head";
import Image from "next/image";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// --- 動畫設定 ---
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

export default function Shipping() {
  const { t } = useTranslation("common");

  const pageTitle = t("shipping.seo_title");
  const pageDesc = t("shipping.seo_desc");

  return (
    <ReactLenis root>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
      </Head>

      <div className="bg-white min-h-screen pt-32 pb-24 text-gray-900">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {/* ================= 1. 頁首標題區塊 ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-4 md:mb-6 tracking-wide">
              {t("shipping.title")}
            </h1>
            <p className="text-gray-500 font-light tracking-widest uppercase text-xs md:text-sm">
              {t("shipping.subtitle")}
            </p>
          </motion.div>

          {/* ================= 2. Hero 形象圖 (Delivery01) ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={imageReveal}
            className="relative w-full h-[40vh] md:h-[60vh] mb-20 md:mb-32 overflow-hidden rounded-sm"
          >
            <Image
              src="/images/Delivery01.webp"
              alt="Global Shipping"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </motion.div>

          {/* ================= 3. 承諾與國際政策 (Delivery02 + 文字) ================= */}
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center mb-20 md:mb-32">
            {/* 左側圖片 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={imageReveal}
              className="md:col-span-5 relative w-full h-[50vh] md:h-[600px] overflow-hidden rounded-sm"
            >
              <Image
                src="/images/Delivery02.webp"
                alt="Premium Packaging"
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>

            {/* 右側文字 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="md:col-span-7 space-y-12"
            >
              <div>
                <h3 className="text-xl md:text-2xl font-serif mb-5">
                  {t("shipping.commitment_title")}
                </h3>
                <p className="text-gray-600 leading-loose text-sm md:text-base font-light text-justify">
                  {t("shipping.commitment_desc")}
                </p>
              </div>

              {/* 國際運送說明框 */}
              <div className="bg-gray-50 p-8 md:p-10 rounded-sm border border-gray-100">
                <h3 className="text-lg md:text-xl font-serif mb-4 text-black">
                  {t("shipping.intl_policy_title")}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm font-light">
                  {t("shipping.intl_policy_desc")}
                </p>
              </div>
            </motion.div>
          </div>

          {/* ================= 4. 配送時效 (文字 + Delivery03) ================= */}
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center mb-20 md:mb-32">
            {/* 左側文字 (在手機版時排列在圖片下方，使用 order 控制) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="md:col-span-7 order-2 md:order-1"
            >
              <h4 className="text-2xl md:text-3xl font-serif mb-8 text-black">
                {t("shipping.delivery_time_title")}
              </h4>
              <ul className="space-y-6">
                <li className="flex flex-col p-6 md:p-8  hover:border-gray-300 transition-colors bg-white ">
                  <span className="text-xs text-[#ef4628] font-bold uppercase tracking-widest mb-3">
                    {t("shipping.domestic_label")}
                  </span>
                  <span className="text-lg font-medium text-gray-900 mb-2">
                    {t("shipping.domestic_title")}
                  </span>
                  <span className="text-sm text-gray-500 leading-relaxed font-light">
                    {t("shipping.domestic_desc")}
                  </span>
                </li>
                <li className="flex flex-col p-6 md:p-8  hover:border-gray-300 transition-colors bg-white ">
                  <span className="text-xs text-[#ef4628] font-bold uppercase tracking-widest mb-3">
                    {t("shipping.intl_label")}
                  </span>
                  <span className="text-lg font-medium text-gray-900 mb-2">
                    {t("shipping.intl_title")}
                  </span>
                  <span className="text-sm text-gray-500 leading-relaxed font-light">
                    {t("shipping.intl_desc")}
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* 右側圖片 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={imageReveal}
              className="md:col-span-5 order-1 md:order-2 relative w-full h-[40vh] md:h-[600px] overflow-hidden rounded-sm"
            >
              <Image
                src="/images/Delivery03.webp"
                alt="Logistics Details"
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>
          </div>

          {/* ================= 5. 關稅與保險 (滿版黑底區塊) ================= */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-[#1A1A1A] text-[#F6F1EB] p-10 md:p-16 rounded-sm"
          >
            <div className="grid md:grid-cols-2 gap-12 md:gap-20">
              <div className="relative">
                <div className="w-10 h-[1px] bg-[#F6F1EB] opacity-30 mb-6"></div>
                <h4 className="text-xl font-serif tracking-wide mb-4">
                  {t("shipping.insurance_title")}
                </h4>
                <p className="text-sm font-light opacity-80 leading-loose text-justify">
                  {t("shipping.insurance_desc")}
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-[1px] bg-[#F6F1EB] opacity-30 mb-6"></div>
                <h4 className="text-xl font-serif tracking-wide mb-4">
                  {t("shipping.duties_title")}
                </h4>
                <p className="text-sm font-light opacity-80 leading-loose text-justify">
                  {t("shipping.duties_desc")}
                </p>
              </div>
            </div>
          </motion.section>
        </div>
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
