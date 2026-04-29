"use client";

import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useMemo, useRef, useEffect } from "react";
import Marquee from "react-fast-marquee";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Slider from "../../components/Slider.jsx";
import Carousel from "../../components/EmblaCarousel06/index.jsx";
import { ChevronDown, Search, X, Filter } from "lucide-react";

// --- 🛍️ 商品卡片組件 ---
const ProductCard = ({ product, locale, index }) => {
  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const displayTitle = product.metadata?.[`title_${metaLang}`] || product.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 12) * 0.05 }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="group border-b border-gray-400 md:border-r border-gray-400 last:border-r-0 relative flex flex-col bg-white h-full"
      >
        <div className="relative w-full aspect-[4/5] bg-[#f4f4f4] overflow-hidden">
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
            {product.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-sm font-medium tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <span className="text-[10px] font-bold text-gray-500 border border-gray-400 px-1.5 py-0.5 rounded bg-white/80">
              {product.status}
            </span>
          </div>
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
            style={{
              backgroundImage: `url('${product.image || "/images/placeholder.jpg"}')`,
            }}
          ></div>
        </div>
        <div className="p-5 bg-white mt-auto flex flex-col gap-1">
          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">
            {product.brand}
          </div>
          <h2 className="text-[14px] font-medium text-gray-900 leading-snug tracking-wide group-hover:text-[#ef4628] transition-colors line-clamp-2">
            {displayTitle}
          </h2>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-[15px] font-bold text-black tracking-wide">
              {product.displayPrice}
            </p>
            <span className="text-[10px] text-gray-400 underline decoration-gray-300 underline-offset-2">
              View Detail
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- 🏷️ 強化版 FilterSidebar (Shopify Style) ---
const FilterSidebar = ({
  activeFilter,
  setActiveFilter,
  dynamicBrands,
  dynamicCategories,
  locale,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
}) => {
  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const t = (zh, en, ko) => (locale === "en" ? en : locale === "ko" ? ko : zh);

  const sectionClass = "mb-10";
  const titleClass =
    "text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-4 flex items-center justify-between";

  return (
    <div className="p-6 md:p-8">
      {/* 排序 Sort By */}
      <div className={sectionClass}>
        <h3 className={titleClass}>{t("排序方式", "Sort By", "정렬 기준")}</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full border border-gray-200 p-2 text-xs font-medium outline-none focus:border-black transition-colors"
        >
          <option value="newest">{t("最新發布", "Newest", "최신순")}</option>
          <option value="oldest">
            {t("發布時間：由舊到新", "Oldest", "오래된순")}
          </option>
          <option value="price-high">
            {t("價格：由高到低", "Price: High to Low", "가격: 높은순")}
          </option>
          <option value="price-low">
            {t("價格：由低到高", "Price: Low to High", "가격: 낮은순")}
          </option>
        </select>
      </div>

      {/* 價格區間 Price Range */}
      <div className={sectionClass}>
        <h3 className={titleClass}>
          {t("價格區間", "Price Range", "가격 범위")}
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("最低", "Min", "최소")}
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-black"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder={t("最高", "Max", "최대")}
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-black"
          />
        </div>
      </div>

      {/* 分類 Categories */}
      <div className={sectionClass}>
        <h3 className={titleClass}>
          {t("產品類別", "Categories", "카테고리")}
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              checked={activeFilter.type === "all"}
              onChange={() => setActiveFilter({ type: "all", value: null })}
              className="w-3 h-3 accent-black"
            />
            <span
              className={`text-xs ${activeFilter.type === "all" ? "font-bold" : "text-gray-500"} group-hover:text-black transition-colors`}
            >
              {t("全部商品", "All Products", "전체 상품")}
            </span>
          </label>
          {dynamicCategories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                checked={
                  activeFilter.type === "category" &&
                  activeFilter.value === cat.slug
                }
                onChange={() =>
                  setActiveFilter({ type: "category", value: cat.slug })
                }
                className="w-3 h-3 accent-black"
              />
              <span
                className={`text-xs ${activeFilter.type === "category" && activeFilter.value === cat.slug ? "font-bold" : "text-gray-500"} group-hover:text-black transition-colors`}
              >
                {cat.metadata?.[`name_${metaLang}`] || cat.name} ({cat.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 品牌 Brands */}
      <div className={sectionClass}>
        <h3 className={titleClass}>{t("精選品牌", "Brands", "브랜드")}</h3>
        <div className="grid grid-cols-1 gap-2">
          {dynamicBrands.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                checked={
                  activeFilter.type === "brand" &&
                  activeFilter.value === brand.slug
                }
                onChange={() =>
                  setActiveFilter({ type: "brand", value: brand.slug })
                }
                className="w-3 h-3 accent-black"
              />
              <span
                className={`text-xs ${activeFilter.type === "brand" && activeFilter.value === brand.slug ? "font-bold" : "text-gray-500"} group-hover:text-black transition-colors`}
              >
                {brand.metadata?.[`name_${metaLang}`] || brand.name} (
                {brand.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 重置按鈕 */}
      <button
        onClick={() => {
          setActiveFilter({ type: "all", value: null });
          setPriceRange({ min: "", max: "" });
          setSortBy("newest");
        }}
        className="w-full py-3 text-[10px] font-bold tracking-widest border border-gray-200 hover:bg-black hover:text-white transition-all uppercase"
      >
        {t("清除所有篩選", "Clear Filters", "필터 초기화")}
      </button>
    </div>
  );
};

// --- 🔥 主頁面 ---
export default function CategoryOverview({ products, brands, categories }) {
  const router = useRouter();
  const { locale } = router;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // 篩選與排序 State
  const [activeFilter, setActiveFilter] = useState({
    type: "all",
    value: null,
  });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");

  // 分頁 State
  const [visibleCount, setVisibleCount] = useState(12);

  // 1. 核心篩選邏輯
  const finalProducts = useMemo(() => {
    let list = [...products];

    // 分類與品牌篩選
    if (activeFilter.type === "brand")
      list = list.filter((p) => p.brandSlug === activeFilter.value);
    if (activeFilter.type === "category")
      list = list.filter((p) => p.categorySlug === activeFilter.value);

    // 價格區間篩選
    if (priceRange.min)
      list = list.filter((p) => p.rawPrice >= parseFloat(priceRange.min));
    if (priceRange.max)
      list = list.filter((p) => p.rawPrice <= parseFloat(priceRange.max));

    // 排序邏輯
    list.sort((a, b) => {
      if (sortBy === "price-high") return b.rawPrice - a.rawPrice;
      if (sortBy === "price-low") return a.rawPrice - b.rawPrice;
      if (sortBy === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
    });

    return list;
  }, [products, activeFilter, priceRange, sortBy]);

  // 當篩選條件變動時，重置分頁
  useEffect(() => {
    setVisibleCount(12);
  }, [activeFilter, priceRange, sortBy]);

  const displayedProducts = finalProducts.slice(0, visibleCount);

  return (
    <>
      <Head>
        <title>Shop | KÉSH de¹</title>
      </Head>

      <main className="pb-20 bg-white text-black font-sans min-h-screen">
        <Slider />
        <Carousel />

        {/* 頁面標題 */}
        <section className="py-12 px-6 md:px-10 border-b border-gray-400">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase">
            {activeFilter.type === "all" ? "Online Store" : activeFilter.value}
          </h1>
          <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest">
            {finalProducts.length} Results Found
          </p>
        </section>

        {/* 手機版篩選按鈕 */}
        <div className="md:hidden sticky top-[60px] z-40 bg-white border-b border-gray-400 shadow-sm">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full flex justify-between items-center py-5 px-6"
          >
            <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <Filter size={14} /> Filters
            </span>
            <ChevronDown
              size={14}
              className={`transform transition-transform ${isMobileFilterOpen ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {isMobileFilterOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden bg-[#fdfdfd]"
              >
                <FilterSidebar
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  dynamicBrands={brands}
                  dynamicCategories={categories}
                  locale={locale}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section className="products-content flex flex-col md:flex-row">
          {/* 左側 Sticky 篩選欄 */}
          <aside className="hidden md:block w-[280px] lg:w-[320px] border-r border-gray-400 bg-white">
            <div className="sticky top-20 max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
              <FilterSidebar
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                dynamicBrands={brands}
                dynamicCategories={categories}
                locale={locale}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
          </aside>

          {/* 右側產品網格 */}
          <div className="flex-1 min-h-[50vh]">
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayedProducts.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      index={idx}
                    />
                  ))}
                </div>

                {/* 加載更多按鈕 */}
                {visibleCount < finalProducts.length && (
                  <div className="py-20 flex justify-center border-t border-gray-100">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="px-12 py-4 border border-black text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-500"
                    >
                      Show More Results
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-gray-400">
                <p className="text-sm tracking-widest uppercase">
                  No matching products
                </p>
                <button
                  onClick={() => {
                    setActiveFilter({ type: "all", value: null });
                    setPriceRange({ min: "", max: "" });
                  }}
                  className="mt-4 text-[10px] font-bold border-b border-gray-400 pb-1 hover:text-black"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export async function getStaticProps({ locale }) {
  const currentLang = locale || "zh-TW";
  const targetCurrency =
    currentLang === "en" ? "usd" : currentLang === "ko" ? "krw" : "twd";
  const symbol =
    targetCurrency === "usd" ? "$ " : targetCurrency === "krw" ? "₩ " : "NT$ ";

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  try {
    const headers = {
      "x-publishable-api-key": API_KEY,
      "Content-Type": "application/json",
    };
    const fetchOptions = { headers, cache: "no-store" };

    const [catRes, colRes, pRes] = await Promise.all([
      fetch(`${BACKEND_URL}/store/product-categories?limit=100`, fetchOptions),
      fetch(`${BACKEND_URL}/store/collections?limit=100`, fetchOptions),
      fetch(
        `${BACKEND_URL}/store/products?limit=100&fields=id,title,handle,thumbnail,metadata,created_at,*variants,*variants.prices,*collection`,
        fetchOptions,
      ),
    ]);

    const catData = await catRes.json();
    const colData = await colRes.json();
    const pData = await pRes.json();

    const formattedProducts = (pData.products || []).map((p) => {
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

      return {
        id: p.id,
        slug: p.handle || "",
        title: p.title || "",
        brand: p.collection?.title || "KÉSH de¹ Select",
        brandSlug: p.collection?.handle || "select",
        categorySlug: p.categories?.[0]?.handle || "others",
        displayPrice: `${symbol}${Math.round(amount).toLocaleString()}`,
        rawPrice: amount,
        createdAt: p.created_at,
        image: p.thumbnail,
        metadata: p.metadata || {},
        status: p.metadata?.rank || "RANK S",
        tags: p.tags?.map((t) => t.value) || [],
      };
    });

    const categoriesList = (catData.product_categories || [])
      .map((c) => ({
        id: c.id,
        name: c.name,
        metadata: c.metadata || {},
        slug: c.handle,
        count: formattedProducts.filter((p) => p.categorySlug === c.handle)
          .length,
      }))
      .filter((c) => c.count > 0);

    const brandsList = (colData.collections || [])
      .map((c) => ({
        id: c.id,
        name: c.title,
        metadata: c.metadata || {},
        slug: c.handle,
        count: formattedProducts.filter((p) => p.brandSlug === c.handle).length,
      }))
      .filter((b) => b.count > 0);

    return {
      props: {
        ...(await serverSideTranslations(currentLang, ["common"])),
        products: formattedProducts,
        brands: brandsList,
        categories: categoriesList,
      },
      revalidate: 60,
    };
  } catch (error) {
    return { props: { products: [], brands: [], categories: [] } };
  }
}
