import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { t } = useTranslation("common");

  // 取得翻譯好的各區塊資料
  const pageInfo = t("privacy.page", { returnObjects: true });
  const sections = t("privacy.sections", { returnObjects: true });
  const contactBlock = t("privacy.contact_section", { returnObjects: true });

  // 替換為您的實際聯絡資訊
  const CONTACT_INFO = {
    email: "contact@kesh-de1.com",
    phone: "+886 901-055-624", // ⚠️ 請確認這是否為真實電話
    companyName: "KESH LUXURY CO., LTD",
    siteName: "KÉSH de¹ 凱仕國際精品",
  };

  // 根據當前語系顯示對應的日期格式
  const localeMap = {
    "zh-TW": "zh-TW",
    en: "en-US",
    ko: "ko-KR",
  };
  const currentLocale = localeMap[router.locale] || "zh-TW";
  const currentDate = new Date().toLocaleDateString(currentLocale);

  return (
    <>
      <Head>
        <title>{pageInfo.seo_title}</title>
        <meta name="description" content={pageInfo.seo_desc} />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-gray-800 font-sans mt-16">
        {/* 頁面標題 */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wide">
            {pageInfo.title}
          </h1>
          <p className="text-gray-500 text-sm">
            {pageInfo.last_updated} {currentDate}
          </p>
        </div>

        {/* 政策內容 */}
        <div className="space-y-8 leading-relaxed">
          {sections &&
            sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl font-bold mb-3 border-l-4 border-black pl-3">
                  {section.title}
                </h2>
                {/* 透過 HTML 注入渲染段落與清單 */}
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: section.content_html }}
                />
              </section>
            ))}

          {/* 聯絡我們 */}
          <section className="bg-gray-50 p-6 rounded-lg mt-8">
            <h2 className="text-xl font-bold mb-3">{contactBlock.title}</h2>
            <p className="mb-4 text-gray-700">{contactBlock.desc}</p>
            <div className="space-y-2 text-gray-800">
              <p>
                <strong>{contactBlock.company_label}</strong>{" "}
                {CONTACT_INFO.companyName}
              </p>
              <p>
                <strong>{contactBlock.email_label}</strong>{" "}
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {CONTACT_INFO.email}
                </a>
              </p>
              <p>
                <strong>{contactBlock.phone_label}</strong> {CONTACT_INFO.phone}
              </p>
            </div>
          </section>
        </div>
      </div>
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
