"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
// 🔥 1. 引入翻譯 Hook
import { useTranslation } from "next-i18next";

export default function Footer() {
  // 🔥 2. 啟用翻譯 Hook
  const { t } = useTranslation("common");

  // --- 修改重點：修正陣列結構，並加入服務條款連結 ---
  const footerLinks = {
    explore: [
      { name: t("footer.links.about") || "About 關於我們", href: "/about" },
      { name: t("footer.links.news") || "News 最新消息", href: "/news" },
      { name: t("footer.links.shop") || "Shop 所有商品", href: "/category" },
      // 寄賣服務或其他連結 (保留您原本預留的位置)
      {
        name: t("footer.links.services") || "Services 服務流程",
        href: "/services",
      },
    ],
    info: [
      {
        name: t("footer.links.authenticity") || "Authenticity 正品保證",
        href: "/authenticity",
      },
      {
        name: t("footer.links.shipping") || "Shipping 全球配送",
        href: "/shipping",
      },
      { name: t("footer.links.faq") || "FAQ 常見問題", href: "/faq" },
      {
        name: t("footer.links.contact") || "Contact 聯絡我們",
        href: "/contact",
      },
      {
        name: t("footer.links.privacy") || "Privacy Policy 隱私權政策",
        href: "/privacy",
      },
      // 🔥 新增：服務條款與政策 (放在隱私權下方)
      {
        name: t("footer.links.terms") || "Terms of Service 服務條款",
        href: "/service",
      },
    ],
  };

  return (
    <footer className="relative bg-[#111111] pt-[150px] pb-10 text-[#f7f7f6] overflow-hidden">
      {/* --- 頂部波浪造型 SVG --- */}
      <div className="absolute top-[-1px] left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[100px] md:h-[150px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C400,150 800,-50 1200,0 L1200,100 L0,100 Z"
            fill="#111111"
          />
        </svg>
      </div>

      <div className="container max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        {/* --- 主要內容區 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 border-b border-white/10 pb-20">
          {/* 1. 左側：品牌資訊 + Slogan */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Image
              src="/images/logo/KESH-Logo-white.png"
              alt="KÉSH de¹ Logo"
              width={140}
              height={50}
              className="max-w-[140px] h-auto object-contain"
              priority // Logo 建議加上 priority
            />
            <div className="text-gray-400 text-sm leading-loose font-light tracking-wide mt-6">
              <p className="italic mb-2 opacity-80">
                {t("footer.slogan_1") || "A Value of Priority."} <br />
                {t("footer.slogan_2") || "A Beginning of Dreams."}
              </p>
              <p className="text-xs mt-4 opacity-60">
                {t("footer.slogan_3") ||
                  "Professional Authentication & Worldwide Shipping."}
              </p>
            </div>
          </div>

          {/* 2. 中間：連結列表 */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            {/* Column A: Explore */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-6 uppercase">
                {t("footer.explore_title") || "Explore"}
              </h3>
              <ul className="flex flex-col gap-4">
                {footerLinks.explore.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-300 tracking-wide"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column B: Info / Support */}
            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-6 uppercase">
                {t("footer.support_title") || "Support"}
              </h3>
              <ul className="flex flex-col gap-4">
                {footerLinks.info.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-300 tracking-wide"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. 右側：Contact Us */}
          <div className="lg:col-span-3">
            <div className="bg-[#1f1f1f] p-8 md:p-10 rounded-sm h-full flex flex-col justify-center items-start">
              <p className="text-2xl md:text-3xl font-serif mb-2 text-white">
                {t("footer.contact_us") || "Contact Us"}
              </p>
              <p className="text-xs text-gray-400 mb-8 tracking-widest leading-relaxed">
                {t("footer.contact_desc_1") || "若有任何商品諮詢或寄賣需求，"}
                <br />
                {t("footer.contact_desc_2") || "歡迎隨時聯繫我們。"}
              </p>

              <Link
                href="/contact"
                className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium tracking-tighter text-black bg-white rounded-full transition duration-300 ease-out hover:bg-gray-200"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-white opacity-0 group-hover:opacity-100"></span>
                <span className="relative text-xs font-bold tracking-widest uppercase">
                  {t("footer.get_in_touch") || "Get in Touch"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* --- 底部版權區 --- */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p className="tracking-wide">
            © {new Date().getFullYear()}{" "}
            {t("footer.rights") || "KÉSH de¹ Boutique. All rights reserved."}
          </p>

          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            {/* 底部小選單也補上 Terms */}
            <Link
              href="/service"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
            <span className="w-[1px] h-3 bg-gray-700"></span>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <span className="w-[1px] h-3 bg-gray-700 hidden md:block"></span>
            <p className="w-full md:w-auto text-center mt-2 md:mt-0">
              {t("footer.designed_by") || "Designed by"}{" "}
              <a
                href="https://www.jeek-webdesign.com.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-4 transition-colors"
              >
                {t("footer.geek_design") || "極客網頁設計"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
