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
                {t("search_page.no_results") || "找不到符合的商品："} "{keyword}
                "
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                {t("search_page.try_again") ||
                  "請嘗試使用其他關鍵字或英文品牌名稱進行搜尋。"}
              </p>
              <Link
                href="/category"
                className="inline-block border border-black text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                {t("mega.view_all") || "查看全部"}
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// 🔥 伺服器端搜尋：已更新為向 Medusa 獲取資料
export async function getServerSideProps({ query, locale }) {
  // 取得關鍵字，並處理 1+1 這種特殊符號被編碼的問題
  const rawKeyword = query.q || "";
  const keyword = decodeURIComponent(rawKeyword);
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

  // 取得 Medusa 環境變數
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "https://kesh-backend-production.up.railway.app";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["x-publishable-api-key"] = API_KEY;

  try {
    // 💡 呼叫 Medusa API 進行搜尋 (加上 encodeURIComponent 確保特輸符號正確傳遞)
    const targetUrl = `${BACKEND_URL}/store/products?q=${encodeURIComponent(keyword)}&limit=20`;
    console.log("[Search SSR] Fetching from:", targetUrl);

    const res = await fetch(targetUrl, { headers });

    if (!res.ok) {
      throw new Error(`Medusa Search fetch failed with status: ${res.status}`);
    }

    const data = await res.json();

    // 將 Medusa 回傳的資料格式化成前端 UI 需要的格式
    const formattedProducts = (data.products || []).map((p) => {
      const priceObj = p.variants?.[0]?.prices?.[0];
      let amount = priceObj
        ? priceObj.amount > 1000000
          ? priceObj.amount / 100
          : priceObj.amount
        : 0;

      return {
        id: p.id,
        slug: p.handle, // Medusa 的 slug 是 handle
        title: p.title,
        price: `NT$ ${amount.toLocaleString()}`,
        image: p.thumbnail || "/images/placeholder.jpg",
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
