"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// 🔥 引入全站統一的價格計算工具
import { getCorrectAmount } from "@/lib/price";

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
  const isReady = useRef(false); // 用於防止初始雙重抓取

  // ==========================================
  // 🔍 1. 抓取分類 (高效能版)
  // ==========================================
  useEffect(() => {
    const fetchValidCollections = async () => {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
        "https://kesh-backend-production.up.railway.app";
      const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
      const headers = API_KEY ? { "x-publishable-api-key": API_KEY } : {};

      try {
        const prodRes = await fetch(
          `${BACKEND_URL}/store/products?limit=250&fields=id,collection_id`,
          { headers },
        );
        if (!prodRes.ok) return;
        const prodData = await prodRes.json();

        const activeCollectionIds = new Set(
          (prodData.products || [])
            .filter((p) => p.collection_id)
            .map((p) => p.collection_id),
        );

        const colRes = await fetch(
          `${BACKEND_URL}/store/collections?limit=250`,
          { headers },
        );
        if (!colRes.ok) return;
        const colData = await colRes.json();

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
  }, [metaLang, t]);

  // ==========================================
  // 🛍️ 2. 抓取商品 (支援自訂數量，用於還原狀態)
  // ==========================================
  const fetchProducts = async (
    currentOffset,
    tabId,
    isLoadMore = false,
    customFetchLimit = limit,
  ) => {
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      "https://kesh-backend-production.up.railway.app";
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      let targetUrl = `${BACKEND_URL}/store/products?limit=${customFetchLimit}&offset=${currentOffset}&order=-created_at&fields=id,title,handle,thumbnail,metadata,*variants,*variants.prices`;
      if (tabId !== "all") {
        targetUrl += `&collection_id[]=${tabId}`;
      }

      const res = await fetch(targetUrl, {
        headers: API_KEY ? { "x-publishable-api-key": API_KEY } : {},
      });

      if (!res.ok) throw new Error("API 請求失敗");
      const data = await res.json();

      const formattedProducts = (data.products || []).map((p) => {
        const variantPrices = p.variants?.[0]?.prices || [];
        let priceObj =
          variantPrices.find(
            (pr) => pr.currency_code?.toLowerCase() === targetCurrency,
          ) || variantPrices[0];

        // 🔥 套用我們剛寫好的全站價格統一邏輯
        let amount = priceObj
          ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
          : 0;

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

      setHasMore(data.count > currentOffset + customFetchLimit);
      setOffset(currentOffset + customFetchLimit); // 紀錄當前總共載入了多少商品
    } catch (error) {
      console.error("載入商品失敗:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // ==========================================
  // 🧠 3. 智慧狀態還原 (返回上一頁時執行)
  // ==========================================
  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;

    // 關閉瀏覽器原生的捲動還原，由我們手動接管
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const currentPath = router.asPath.split("?")[0];
    const savedState = sessionStorage.getItem(`kesh_grid_state_${currentPath}`);

    let initTab = "all";
    let initOffset = limit;

    // 如果有存檔，就把之前存的 Tab 和已載入的數量抓出來
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.activeTab) initTab = parsed.activeTab;
        if (parsed.offset) initOffset = parsed.offset;
      } catch (e) {
        console.error("Failed to parse saved grid state", e);
      }
    }

    setActiveTab(initTab);

    // 一次性把之前載入的所有商品抓回來 (例如之前載了 24 個，這次就直接抓 24 個)
    fetchProducts(0, initTab, false, initOffset).then(() => {
      // 資料抓完後，智慧捲動回先前的 Y 軸位置
      const savedScroll = sessionStorage.getItem(
        `kesh_grid_scroll_${currentPath}`,
      );
      if (savedScroll) {
        const targetY = parseInt(savedScroll, 10);
        let attempts = 0;
        const tryScroll = () => {
          if (document.body.scrollHeight >= targetY || attempts > 20) {
            window.scrollTo({ top: targetY, behavior: "instant" });
          } else {
            attempts++;
            setTimeout(tryScroll, 50); // 每 50ms 嘗試一次，等待圖片撐開高度
          }
        };
        tryScroll();
      }
    });

    isReady.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath]);

  // ==========================================
  // 💾 4. 自動存檔機制 (當使用者操作時紀錄)
  // ==========================================
  // 4a. 存檔 Tab 與載入數量
  useEffect(() => {
    if (!isReady.current || typeof window === "undefined") return;
    const currentPath = router.asPath.split("?")[0];
    sessionStorage.setItem(
      `kesh_grid_state_${currentPath}`,
      JSON.stringify({ activeTab, offset }),
    );
  }, [activeTab, offset, router.asPath]);

  // 4b. 存檔捲動位置 (防抖動優化)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const currentPath = router.asPath.split("?")[0];
        sessionStorage.setItem(
          `kesh_grid_scroll_${currentPath}`,
          window.scrollY.toString(),
        );
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router.asPath]);

  // 4c. 當語系或幣別改變時，依照目前的 offset 重新抓取 (但不重置畫面位置)
  const prevLangRef = useRef(metaLang);
  useEffect(() => {
    if (!isReady.current) return;
    if (prevLangRef.current !== metaLang) {
      fetchProducts(0, activeTab, false, offset || limit);
      prevLangRef.current = metaLang;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaLang, targetCurrency]);

  // ==========================================
  // 🖱️ 5. 切換分類 Tab 處理
  // ==========================================
  const handleTabClick = (tabId) => {
    if (activeTab === tabId) return; // 避免重複點擊
    setActiveTab(tabId);
    // 切換分類時，重新從 0 開始抓取預設數量的商品
    fetchProducts(0, tabId, false, limit);
  };

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
                onClick={() => handleTabClick(tab.id)}
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
