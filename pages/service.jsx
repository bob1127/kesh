import React, { useState, useEffect } from "react";
import Head from "next/head";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// 動畫設定
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function TermsOfService() {
  const { t } = useTranslation("common");
  const [activeSection, setActiveSection] = useState("section-1");

  // 從多語系檔案中讀取資料 (使用 returnObjects)
  const seoTitle = t("terms.seo_title");
  const seoDesc = t("terms.seo_desc");
  const pageTag = t("terms.page_tag");
  const pageTitle = t("terms.page_title");
  const pageSubtitle = t("terms.page_subtitle");
  const tocTitle = t("terms.toc_title");
  const sections = t("terms.sections", { returnObjects: true }) || [];

  // 監聽滾動位置，自動更新左側大綱的高亮狀態
  useEffect(() => {
    const handleScroll = () => {
      if (!Array.isArray(sections)) return;
      const sectionElements = sections.map((item) =>
        document.getElementById(item.id),
      );
      const scrollPosition = window.scrollY + 200; // 加入位移緩衝

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // 點擊大綱平滑滾動至對應區塊
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120, // 扣除 Navbar 高度
        behavior: "smooth",
      });
    }
  };

  return (
    <ReactLenis root>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
      </Head>

      <div className="bg-white min-h-screen pt-32 pb-24 text-gray-900">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10">
          {/* ================= 頁首標題 ================= */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-20 border-b border-gray-100 pb-16"
          >
            <span className="text-[#ef4628] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
              {pageTag}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-6 tracking-wide">
              {pageTitle}
            </h1>
            <p className="text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
              {pageSubtitle}
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-16 relative">
            {/* ================= 左側：固定目錄導覽 (Sticky Sidebar) ================= */}
            {Array.isArray(sections) && sections.length > 0 && (
              <div className="hidden lg:block w-[300px] shrink-0">
                <div className="sticky top-32">
                  <h4 className="text-xs font-bold text-gray-400 tracking-[0.2em] uppercase mb-6">
                    {tocTitle}
                  </h4>
                  <ul className="space-y-4 border-l border-gray-200">
                    {sections.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={(e) => scrollToSection(e, item.id)}
                          className={`block pl-5 text-sm transition-all duration-300 border-l-[3px] -ml-[2px] ${
                            activeSection === item.id
                              ? "border-[#ef4628] text-black font-bold"
                              : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                          }`}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ================= 右側：條款內容區塊 ================= */}
            <div className="flex-1 space-y-24">
              {Array.isArray(sections) &&
                sections.map((section) => (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="scroll-mt-32"
                  >
                    {/* 區塊標題 */}
                    <h2 className="text-2xl font-serif mb-8 text-black pb-4 border-b border-gray-100">
                      {section.title}
                    </h2>

                    {/* 區塊前言 (如果有) */}
                    {section.intro && (
                      <p className="text-gray-600 leading-loose mb-8 font-light text-justify">
                        {section.intro}
                      </p>
                    )}

                    {/* 項目列表 (如果有) */}
                    {section.items && section.items.length > 0 && (
                      <div className="space-y-8">
                        {section.items.map((item, idx) => (
                          <div key={idx}>
                            {item.subtitle && (
                              <h4 className="text-base font-medium text-black mb-2 tracking-wide">
                                {item.subtitle}
                              </h4>
                            )}
                            <p className="text-sm text-gray-500 leading-loose font-light text-justify whitespace-pre-wrap">
                              {item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 區塊結語 (如果有) */}
                    {section.outro && (
                      <p className="text-gray-600 leading-loose mt-8 font-light text-justify bg-gray-50 p-4 rounded-sm">
                        {section.outro}
                      </p>
                    )}
                  </motion.section>
                ))}
            </div>
          </div>
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
