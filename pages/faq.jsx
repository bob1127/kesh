"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// --- 單個問題組件 ---
const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0 group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-5 px-2 hover:bg-gray-50 transition-colors text-left"
      >
        <span
          className={`font-medium text-[15px] pr-4 transition-colors duration-300 ${isOpen ? "text-[#ef4628]" : "text-gray-800 group-hover:text-gray-600"}`}
        >
          {question}
        </span>
        <span
          className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#ef4628]" : ""}`}
        >
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* 🔥 透過 dangerouslySetInnerHTML 渲染包含 Tailwind 的 HTML 結構 */}
            <div
              className="pb-8 px-2 pl-4 text-sm text-gray-600 leading-7 tracking-wide"
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 主頁面組件 ---
export default function FAQPage() {
  const { t } = useTranslation("common");

  // 從多語系檔案取得資料
  const seo = t("faq.seo", { returnObjects: true });
  const ui = t("faq.ui", { returnObjects: true });
  const schemaItems = t("faq.schema", { returnObjects: true });
  const faqSections = t("faq.sections", { returnObjects: true });

  // 動態生成 SEO Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: schemaItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KÉSH de¹ 凱仕國際精品",
    url: "https://www.kesh-de1.com",
    logo: "https://www.kesh-de1.com/images/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+886-4-xxxx-xxxx", // ⚠️ 記得修改為您的實際電話
      contactType: "customer service",
      areaServed: ["TW"],
      availableLanguage: ["Chinese", "English", "Korean"],
    },
  };

  return (
    <>
      <Head>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.kesh-de1.com/faq" />
        <meta
          property="og:image"
          content="https://www.kesh-de1.com/images/og-faq.jpg"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </Head>

      <div className="min-h-screen bg-white pt-[60px] md:pt-[100px] pb-20 font-sans">
        {/* 頂部標題區域 */}
        <div className="bg-gray-50 py-16 px-6 mb-12">
          <div className="max-w-[800px] mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-black mb-4 font-serif">
              {ui.title}
            </h1>
            <p className="text-[#ef4628] font-bold text-xs md:text-sm tracking-[0.25em] uppercase mb-8">
              {ui.subtitle}
            </p>
            <div className="h-[2px] w-[50px] bg-black mx-auto mb-8"></div>

            <div className="text-gray-600 text-sm md:text-[15px] leading-8 tracking-wide space-y-4">
              <p>{ui.intro1}</p>
              <p>{ui.intro2}</p>
              <p className="font-medium text-black">{ui.intro3}</p>
            </div>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="max-w-[900px] mx-auto px-4 md:px-8">
          {faqSections &&
            faqSections.map((section, index) => (
              <div key={index} className="mb-16">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-black border-l-4 border-[#ef4628] pl-4 uppercase tracking-wider inline-block">
                    {section.category}
                  </h2>
                  {section.description && (
                    <p className="mt-3 text-sm text-gray-500 pl-5 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-lg">
                  {section.items.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      question={item.q}
                      answer={item.a}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* 底部結語 */}
        <div className="max-w-[800px] mx-auto px-6 py-16 text-center border-t border-gray-100 mt-8">
          <h3 className="text-2xl font-bold mb-6 tracking-widest font-serif">
            {ui.footer_title}
          </h3>
          <p className="text-gray-500 text-sm leading-8 mb-10 tracking-wide">
            {ui.footer_desc1}
            <br />
            {ui.footer_desc2}
            <br className="hidden md:block" />
            {ui.footer_desc3}
            <br />
            {ui.footer_desc4}
            <br />
            <br />
            {ui.footer_desc5}
            <br />
            {ui.footer_desc6}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/contact"
              className="px-10 py-3 bg-black text-white text-sm font-bold tracking-widest hover:bg-[#ef4628] transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              {ui.btn_contact}
            </Link>
            <Link
              href="/shop"
              className="px-10 py-3 border border-black text-black text-sm font-bold tracking-widest hover:bg-gray-50 transition-colors duration-300"
            >
              {ui.btn_shop}
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-400 tracking-[0.2em] uppercase">
              {ui.slogan}
            </p>
            <p className="text-xs text-gray-300 tracking-wider">
              {ui.brand_name}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// --- SSG 注入翻譯 ---
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "zh-TW", ["common"])),
    },
  };
}
