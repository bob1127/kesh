"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { getCorrectAmount } from "@/lib/price";
import { moveTestProductsToEnd } from "@/lib/product-sort";
import { tFallback } from "@/lib/t-fallback";
import {
  getLocalizedMetadataTitle,
  getNumberLocale,
} from "@/lib/localized-metadata";
import {
  MEDUSA_BACKEND_URL,
  getMedusaStoreHeaders,
} from "@/lib/medusa-store";

export default function ProductGridShowcase() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const locale = router.locale || "zh-TW";

  const targetCurrency =
    locale === "en" ? "usd" : locale === "ko" ? "krw" : "twd";
  const symbol =
    targetCurrency === "usd" ? "$ " : targetCurrency === "krw" ? "₩ " : "NT$ ";
  const numberLocale = getNumberLocale(locale);

  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const limit = 8;
  const containerRef = useRef(null);
  const isReady = useRef(false);

  const formatPrice = useCallback(
    (amount) =>
      `${symbol}${Math.round(amount).toLocaleString(numberLocale)}`,
    [symbol, numberLocale],
  );

  const localizeTitle = useCallback(
    (metadata, defaultTitle) =>
      getLocalizedMetadataTitle(metadata, defaultTitle, locale),
    [locale],
  );

  // ==========================================
  // 🔍 1. 抓取分類
  // ==========================================
  useEffect(() => {
    const fetchValidCollections = async () => {
      const headers = getMedusaStoreHeaders();

      try {
        const prodRes = await fetch(
          `${MEDUSA_BACKEND_URL}/store/products?limit=250&fields=id,collection_id`,
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
          `${MEDUSA_BACKEND_URL}/store/collections?limit=250`,
          { headers },
        );
        if (!colRes.ok) return;
        const colData = await colRes.json();

        const validCollections = (colData.collections || [])
          .filter((col) => activeCollectionIds.has(col.id))
          .map((col) => ({
            id: col.id,
            title: localizeTitle(col.metadata, col.title),
          }));

        setCollections([
          {
            id: "all",
            title: tFallback(t, "showcase.view_all", "全部商品"),
          },
          ...validCollections,
        ]);
      } catch (error) {
        console.error("載入分類失敗:", error);
      }
    };

    fetchValidCollections();
  }, [locale, t, localizeTitle]);

  // ==========================================
  // 🛍️ 2. 抓取商品
  // ==========================================
  const fetchProducts = async (
    currentOffset,
    tabId,
    isLoadMore = false,
    customFetchLimit = limit,
  ) => {
    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setIsLoading(true);

      let targetUrl = `${MEDUSA_BACKEND_URL}/store/products?limit=${customFetchLimit}&offset=${currentOffset}&order=-created_at&fields=id,title,handle,thumbnail,metadata,*variants,*variants.prices`;
      if (tabId !== "all") {
        targetUrl += `&collection_id[]=${tabId}`;
      }

      const res = await fetch(targetUrl, {
        headers: getMedusaStoreHeaders(),
      });

      if (!res.ok) throw new Error("API 請求失敗");
      const data = await res.json();

      const formattedProducts = (data.products || []).map((p) => {
        const variantPrices = p.variants?.[0]?.prices || [];
        const priceObj =
          variantPrices.find(
            (pr) => pr.currency_code?.toLowerCase() === targetCurrency,
          ) || variantPrices[0];

        const amount = priceObj
          ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
          : 0;

        return {
          id: p.id,
          title: localizeTitle(p.metadata, p.title),
          slug: p.handle,
          handle: p.handle,
          price: formatPrice(amount),
          image: p.thumbnail || "/images/placeholder.jpg",
          metadata: p.metadata || {},
        };
      });

      const sortedProducts = moveTestProductsToEnd(formattedProducts);

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...sortedProducts]);
      } else {
        setProducts(sortedProducts);
      }

      setHasMore(data.count > currentOffset + customFetchLimit);
      setOffset(currentOffset + customFetchLimit);
    } catch (error) {
      console.error("載入商品失敗:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // ==========================================
  // 🧠 3. 智慧狀態還原
  // ==========================================
  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const currentPath = router.asPath.split("?")[0];
    const savedState = sessionStorage.getItem(`kesh_grid_state_${currentPath}`);

    let initTab = "all";
    let initOffset = limit;

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

    fetchProducts(0, initTab, false, initOffset).then(() => {
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
            setTimeout(tryScroll, 50);
          }
        };
        tryScroll();
      }
    });

    isReady.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath, locale]);

  // ==========================================
  // 💾 4. 自動存檔
  // ==========================================
  useEffect(() => {
    if (!isReady.current || typeof window === "undefined") return;
    const currentPath = router.asPath.split("?")[0];
    sessionStorage.setItem(
      `kesh_grid_state_${currentPath}`,
      JSON.stringify({ activeTab, offset }),
    );
  }, [activeTab, offset, router.asPath]);

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

  // ==========================================
  // 🖱️ 5. 切換分類 Tab
  // ==========================================
  const handleTabClick = (tabId) => {
    if (activeTab === tabId) return;
    setActiveTab(tabId);
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
          this.targets().forEach((target) => target.classList.add("animated"));
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
              {tFallback(t, "showcase.title", "CURATION")}
              <span className="text-[11px] lg:text-[13px] font-bold mt-2 tracking-normal uppercase">
                {tFallback(t, "showcase.sub_title", "(STYLE)")}
              </span>
            </h2>
            <p className="text-sm md:text-base font-bold tracking-[0.2em] uppercase">
              {tFallback(t, "showcase.tag", "for MODERN ELEGANCE")}
            </p>
          </div>
          <p className="text-[12px] md:text-[14px] text-gray-700 leading-[2.5] tracking-[0.15em] whitespace-pre-line max-w-3xl mb-12">
            {tFallback(
              t,
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
            {tFallback(t, "showcase.loading", "LOADING...")}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mb-16 pt-8 items-stretch">
              {products.map((product) => (
                <Link
                  href={`/product/${product.slug}`}
                  key={product.id}
                  locale={locale}
                  className="group product-card opacity-0 translate-y-8 flex h-full flex-col items-center text-center"
                >
                  <div className="relative w-full aspect-[4/5] shrink-0 bg-gray-50 overflow-hidden mb-4">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      unoptimized={true}
                    />
                  </div>

                  <div className="flex w-full flex-1 flex-col items-center">
                    <h3 className="mb-3 w-full flex-1 px-2 text-[13px] font-bold leading-relaxed tracking-wider text-gray-900 line-clamp-4 md:text-[13px] 2xl:text-[14px]">
                      {product.title}
                    </h3>
                    <span className="mb-4 inline-block shrink-0 border-b border-gray-400 pb-1 text-[12px] font-bold tracking-[0.15em] text-gray-800">
                      {product.price}
                    </span>

                    <div className="mt-auto w-full shrink-0 bg-black py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300 group-hover:bg-gray-800 md:text-[11px]">
                      {tFallback(t, "showcase.buy_now", "BUY NOW")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => fetchProducts(offset, activeTab, true)}
                  disabled={isLoadingMore}
                  className="px-12 py-4 border border-black text-black text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore
                    ? tFallback(t, "showcase.loading", "LOADING...")
                    : tFallback(t, "showcase.discover_more", "DISCOVER MORE")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400 text-sm tracking-widest uppercase">
            {tFallback(t, "showcase.no_products", "該分類下目前沒有產品")}
          </div>
        )}
      </div>
    </section>
  );
}
