// pages/search.jsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function SearchResults({ products, keyword }) {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{keyword} - 搜尋結果 | KÉSH de¹</title>
      </Head>

      <main className="min-h-screen bg-white pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          {/* 頁面標題 */}
          <div className="mb-12 border-b border-gray-200 pb-6">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-2">
              {t("search_page.title") || "Search Results"}
            </h1>
            <p className="text-gray-500 text-sm">
              {t("search_page.showing_results_for")}{" "}
              <span className="font-bold text-black">"{keyword}"</span>
            </p>
          </div>

          {/* 搜尋結果網格 */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => (
                <Link
                  href={`/product/${product.slug}`}
                  key={product.id}
                  className="group block"
                >
                  <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden mb-4">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      unoptimized={true}
                    />
                  </div>
                  <div className="flex flex-col items-start space-y-1">
                    <span className="text-[11px] md:text-[12px] text-gray-500 uppercase tracking-[0.15em] font-medium">
                      {product.price}
                    </span>
                    <h3 className="text-[14px] md:text-[15px] text-gray-900 font-normal tracking-wide leading-relaxed group-hover:text-gray-600 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // 找不到商品時的畫面
            <div className="text-center py-32">
              <h2 className="text-xl text-gray-500 mb-4">
                {t("search_page.no_results")} "{keyword}"
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                {t("search_page.try_again")}
              </p>
              <Link
                href="/category"
                className="inline-block border border-black text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                {t("mega.view_all")}
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// 🔥 伺服器端搜尋 WooCommerce 商品
export async function getServerSideProps({ query, locale }) {
  const keyword = query.q || "";
  const currentLang = locale || "zh-TW";

  // 如果沒有關鍵字，直接回傳空陣列
  if (!keyword.trim()) {
    return {
      props: {
        products: [],
        keyword: "",
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  }

  const WC_URL = process.env.WC_SITE_URL;
  const CK = process.env.WC_CONSUMER_KEY;
  const CS = process.env.WC_CONSUMER_SECRET;

  if (!WC_URL || !CK || !CS) {
    return {
      props: {
        products: [],
        keyword,
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  }

  const https = require("https");
  const agent = new https.Agent({ rejectUnauthorized: false });
  const auth = Buffer.from(`${CK}:${CS}`).toString("base64");
  const headers = {
    "User-Agent": "Mozilla/5.0 (Next.js)",
    Authorization: `Basic ${auth}`,
  };

  try {
    // 💡 提示：使用 WooCommerce API 的 `search` 參數來抓取商品。
    // 如果你的多語系外掛支援 lang 參數，可以在網址後方加上 &lang=${currentLang}
    const wpLang = currentLang === "zh-TW" ? "zh" : currentLang;
    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?search=${encodeURIComponent(keyword)}&status=publish&lang=${wpLang}`,
      { agent, headers },
    );

    if (!res.ok) throw new Error("Search fetch failed");

    const data = await res.json();

    const formattedProducts = data.map((p) => {
      let imageUrl = "/images/placeholder.jpg";
      if (p.images && p.images.length > 0) {
        let src = p.images[0].src;
        if (src.startsWith("http://")) src = src.replace("http://", "https://");
        imageUrl = src;
      }
      return {
        id: p.id,
        slug: p.slug,
        title: p.name,
        price: `NT$ ${parseInt(p.price || 0).toLocaleString()}`,
        image: imageUrl,
      };
    });

    return {
      props: {
        products: formattedProducts,
        keyword,
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  } catch (error) {
    console.error("Search Error:", error);
    return {
      props: {
        products: [],
        keyword,
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  }
}
