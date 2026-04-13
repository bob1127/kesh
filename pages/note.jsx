"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function ShoppingGuide() {
  const { t } = useTranslation("common");

  // 取得翻譯好的各區塊資料
  const pageInfo = t("shopping_guide.page", { returnObjects: true });
  const sections = t("shopping_guide.sections", { returnObjects: true });

  const [activeSection, setActiveSection] = useState("shopping-notes");

  // 點擊滾動功能
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // 扣除 header 高度
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  // 監聽滾動以更新目前 Active 的項目
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // 偏移量

      if (!sections || sections.length === 0) return;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <>
      <Head>
        <title>{pageInfo.seo_title}</title>
      </Head>

      <ReactLenis root>
        <div className="bg-white min-h-screen pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* 左側：黏性目錄 (Sticky Sidebar) */}
            <aside className="md:col-span-3 md:sticky md:top-32 md:h-[calc(100vh-8rem)] hidden md:block">
              <h1 className="text-2xl font-serif font-medium mb-2">
                {pageInfo.title}
              </h1>
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-8">
                {pageInfo.subtitle_desktop}
              </p>

              <nav className="space-y-4 border-l border-gray-100">
                {sections &&
                  sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`block text-left pl-4 py-1 text-sm transition-all duration-300 border-l-2 -ml-[2px] ${
                        activeSection === section.id
                          ? "border-black text-black font-medium"
                          : "border-transparent text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <span className="block">{section.title}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-60">
                        {section.enTitle}
                      </span>
                    </button>
                  ))}
              </nav>
            </aside>

            {/* 手機版標題 (只在小螢幕出現) */}
            <div className="md:hidden mb-8">
              <h1 className="text-3xl font-serif text-center mb-2">
                {pageInfo.title}
              </h1>
              <p className="text-center text-xs text-gray-400 tracking-widest uppercase">
                {pageInfo.subtitle_mobile}
              </p>
            </div>

            {/* 右側：內容區塊 */}
            <main className="md:col-span-9 space-y-20 md:pl-10">
              {sections &&
                sections.map((section, index) => (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="scroll-mt-32 border-b border-gray-100 pb-16 last:border-0"
                  >
                    <div className="flex items-baseline mb-6">
                      <span className="text-xs font-bold text-gray-300 mr-4">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <h2 className="text-2xl font-serif text-gray-900">
                        {section.title}
                      </h2>
                    </div>

                    <div className="text-gray-600 font-light leading-loose text-justify pl-8 md:pl-10">
                      {/* 🔥 根據 ID 判斷要用一般 HTML 注入，還是渲染特殊網格排版 */}
                      {section.id === "grading" ? (
                        <div className="space-y-6">
                          <p>{section.intro}</p>
                          <div className="grid gap-4">
                            {section.grades.map((grade) => (
                              <div
                                key={grade.rank}
                                className="flex items-start p-4 bg-gray-50 rounded-sm border border-gray-100"
                              >
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black text-white font-serif text-xl mr-4">
                                  {grade.rank}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 mb-1">
                                    {grade.label}
                                  </h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {grade.desc}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // 一般文字區塊透過 HTML 注入
                        <div
                          dangerouslySetInnerHTML={{
                            __html: section.content_html,
                          }}
                        />
                      )}
                    </div>
                  </motion.section>
                ))}

              {/* 頁尾小語 */}
              <div className="pt-8 text-center">
                <p className="text-sm text-gray-400 italic font-serif">
                  {pageInfo.footer_note}
                </p>
              </div>
            </main>
          </div>
        </div>
      </ReactLenis>
    </>
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
