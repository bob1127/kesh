"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ProductGridShowcase() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const locale = router.locale || "zh-TW";

  // 🌍 語系與幣別引擎
  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const targetCurrency =
    locale === "en" ? "usd" : locale === "ko" ? "krw" : "twd";
  const symbol =
    targetCurrency === "usd" ? "$ " : targetCurrency === "krw" ? "₩ " : "NT$ ";

  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const limit = 8;
  const containerRef = useRef(null);

  // ==========================================
  // 🔍 1. 抓取分類 (高效能版：解決被截斷與 N+1 問題)
  // ==========================================
  useEffect(() => {
    const fetchValidCollections = async () => {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
        "https://kesh-backend-production.up.railway.app";
      const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
      const headers = API_KEY ? { "x-publishable-api-key": API_KEY } : {};

      try {
        // 🔥 優化點 1：先一次性抓取所有商品，提取出「真正有商品」的 collection_id
        const prodRes = await fetch(
          `${BACKEND_URL}/store/products?limit=250&fields=id,collection_id`,
          { headers },
        );
        if (!prodRes.ok) return;
        const prodData = await prodRes.json();

        // 利用 Set 確保 ID 不重複，提升比對效能
        const activeCollectionIds = new Set(
          (prodData.products || [])
            .filter((p) => p.collection_id)
            .map((p) => p.collection_id),
        );

        // 🔥 優化點 2：抓取系列時加上 limit=250，避免預設 10 筆吃掉 CHANEL
        const colRes = await fetch(
          `${BACKEND_URL}/store/collections?limit=250`,
          { headers },
        );
        if (!colRes.ok) return;
        const colData = await colRes.json();

        // 將擁有商品的分類篩選出來
        const validCollections = (colData.collections || [])
          .filter((col) => activeCollectionIds.has(col.id))
          .map((col) => ({
            id: col.id,
            title: col.metadata?.[`title_${metaLang}`] || col.title,
          }));

        setCollections([
          { id: "all", title: t("showcase.view_all", "全部商品") },
          ...validCollections,
        ]);
      } catch (error) {
        console.error("載入分類失敗:", error);
      }
    };

    fetchValidCollections();
  }, [locale, metaLang, t]);

  // ==========================================
  // 🛍️ 2. 抓取商品 (支援多語系內容與智能幣別)
  // ==========================================
  const fetchProducts = async (currentOffset, tabId, isLoadMore = false) => {
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      "https://kesh-backend-production.up.railway.app";
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      // 🔥 關鍵修改：加入 &order=-created_at 讓最新發布的商品排在最前面
      let targetUrl = `${BACKEND_URL}/store/products?limit=${limit}&offset=${currentOffset}&order=-created_at&fields=id,title,handle,thumbnail,metadata,*variants,*variants.prices`;
      if (tabId !== "all") {
        targetUrl += `&collection_id[]=${tabId}`;
      }

      const res = await fetch(targetUrl, {
        headers: API_KEY ? { "x-publishable-api-key": API_KEY } : {},
      });

      if (!res.ok) throw new Error("API 請求失敗");
      const data = await res.json();

      const formattedProducts = (data.products || []).map((p) => {
        // 💰 智能幣別配對
        const variantPrices = p.variants?.[0]?.prices || [];
        let priceObj =
          variantPrices.find(
            (pr) => pr.currency_code?.toLowerCase() === targetCurrency,
          ) || variantPrices[0];
        let amount = priceObj
          ? priceObj.amount > 1000000
            ? priceObj.amount / 100
            : priceObj.amount
          : 0;

        // 🌍 智能商品標題配對 (抓取 metadata)
        const localizedTitle = p.metadata?.[`title_${metaLang}`] || p.title;

        return {
          id: p.id,
          title: localizedTitle,
          slug: p.handle,
          price: `${symbol}${Math.round(amount).toLocaleString()}`,
          image: p.thumbnail || "/images/placeholder.jpg",
        };
      });

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...formattedProducts]);
      } else {
        setProducts(formattedProducts);
      }

      setHasMore(data.count > currentOffset + limit);
      setOffset(currentOffset + limit);
    } catch (error) {
      console.error("載入商品失敗:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(0, activeTab, false);
  }, [activeTab, targetCurrency, metaLang]);

  // ==========================================
  // ✨ GSAP Fade Up 動畫
  // ==========================================
  useGSAP(
    () => {
      gsap.to(".product-card:not(.animated)", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        onComplete: function () {
          this.targets().forEach((t) => t.classList.add("animated"));
        },
      });
    },
    { dependencies: [products], scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="w-full bg-white py-10 px-6 md:px-10 font-sans"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* 標題區塊 */}
        <div className="w-full pb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <h2 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-widest flex items-start justify-center gap-1 mb-2">
              {/* 🔥 全面使用 showcase 獨立前綴 */}
              {t("showcase.title", "CURATION")}
              <span className="text-[11px] lg:text-[13px] font-bold mt-2 tracking-normal uppercase">
                {t("showcase.sub_title", "(STYLE)")}
              </span>
            </h2>
            <p className="text-sm md:text-base font-bold tracking-[0.2em] uppercase">
              {t("showcase.tag", "for MODERN ELEGANCE")}
            </p>
          </div>
          <p className="text-[12px] md:text-[14px] text-gray-700 leading-[2.5] tracking-[0.15em] whitespace-pre-line max-w-3xl mb-12">
            {t(
              "showcase.desc",
              "探索 KÉSH de¹ 為您精心挑選的頂級精品。\n從經典雋永的傳世之作到現代俐落的都會風格，展現獨一無二的奢華品味。",
            )}
          </p>

          {/* Tabs 切換 */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 border-b border-gray-200 pb-4 w-full max-w-3xl">
            {collections.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs md:text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 relative pb-2 
                  ${activeTab === tab.id ? "text-black" : "text-gray-400 hover:text-gray-700"}`}
              >
                {tab.title}
                <span
                  className={`absolute left-0 bottom-[-4px] w-full h-[2px] bg-black transition-transform duration-300 origin-left 
                  ${activeTab === tab.id ? "scale-x-100" : "scale-x-0"}`}
                ></span>
              </button>
            ))}
          </div>
        </div>

        {/* 商品網格區塊 */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-400 text-xs tracking-widest uppercase animate-pulse">
            {t("showcase.loading", "LOADING...")}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mb-16 pt-8">
              {products.map((product) => (
                <Link
                  href={`/product/${product.slug}`}
                  key={product.id}
                  className="group block product-card opacity-0 translate-y-8 flex flex-col items-center text-center"
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

                  <h3 className="text-[13px] md:text-[14px] font-bold text-gray-900 tracking-wider mb-3 line-clamp-1 w-full px-2">
                    {product.title}
                  </h3>
                  <span className="text-[12px] font-bold text-gray-800 tracking-[0.15em] border-b border-gray-400 pb-1 mb-5 inline-block">
                    {product.price}
                  </span>

                  <div className="w-full bg-black text-white text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase py-3 group-hover:bg-gray-800 transition-colors duration-300">
                    {t("showcase.buy_now", "BUY NOW")}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More 按鈕 */}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => fetchProducts(offset, activeTab, true)}
                  disabled={isLoadingMore}
                  className="px-12 py-4 border border-black text-black text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore
                    ? t("showcase.loading", "LOADING...")
                    : t("showcase.discover_more", "DISCOVER MORE")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400 text-sm tracking-widest uppercase">
            {t("showcase.no_products", "該分類下目前沒有產品")}
          </div>
        )}
      </div>
    </section>
  );
}
