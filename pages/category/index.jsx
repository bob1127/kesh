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

// 🔥 引入全站統一的價格計算工具
import { getCorrectAmount } from "@/lib/price";

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
        className="group border-b border-gray-200 md:border-r border-gray-200 last:border-r-0 relative flex flex-col bg-white h-full"
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

// --- 🔽 通用收合組件 (Accordion) ---
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-4 group outline-none"
      >
        {title}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown
            size={14}
            className="text-gray-400 group-hover:text-black transition-colors"
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 批發過濾側邊欄 ---
const FilterSidebar = ({
  activeFilters,
  setActiveFilters,
  dynamicBrands,
  dynamicCategories,
  locale,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  isMobile = false,
  onApply,
  onUserInteraction,
}) => {
  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const t = (zh, en, ko) => (locale === "en" ? en : locale === "ko" ? ko : zh);

  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { value: "newest", label: t("最新發布", "Newest", "최신순") },
    { value: "oldest", label: t("由舊到新", "Oldest", "오래된순") },
    {
      value: "price-high",
      label: t("價格：高到低", "Price: High to Low", "가격: 높은순"),
    },
    {
      value: "price-low",
      label: t("價格：低到高", "Price: Low to High", "가격: 낮은순"),
    },
  ];

  const toggleFilter = (type, slug) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      return { ...prev, [type]: updated };
    });
    onUserInteraction();
  };

  const CustomCircleCheckbox = ({ isChecked }) => (
    <div
      className={`w-[14px] h-[14px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ease-out flex-shrink-0
      ${isChecked ? "border-black bg-black" : "border-gray-300 group-hover:border-gray-500"}`}
    >
      {isChecked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-1.5 h-1.5 bg-white rounded-full"
        />
      )}
    </div>
  );

  const resetFilters = () => {
    setActiveFilters({ categories: [], brands: [] });
    setPriceRange({ min: "", max: "" });
    setSortBy("newest");
    onUserInteraction();
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      sessionStorage.removeItem(`kesh_filters_${currentPath}`);
      sessionStorage.removeItem(`kesh_scroll_${currentPath}`);
    }
  };

  return (
    <div className="py-6 pr-6 pl-8 md:py-8 md:pr-8 md:pl-12 flex flex-col h-full">
      <div className="flex-1">
        <div className="mb-10 relative">
          <h3 className="text-[11px] font-bold text-black uppercase tracking-[0.2em] mb-4">
            {t("排序方式", "Sort By", "정렬 기준")}
          </h3>
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex justify-between items-center bg-transparent border-b border-gray-200 py-2.5 text-[13px] text-gray-700 outline-none hover:border-black transition-colors"
            >
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <motion.div animate={{ rotate: isSortOpen ? 180 : 0 }}>
                <ChevronDown size={14} className="text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 shadow-xl z-50 overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        onUserInteraction();
                        setIsSortOpen(false);
                      }}
                      className={`px-4 py-3 text-[13px] cursor-pointer hover:bg-stone-50 transition-colors ${
                        sortBy === option.value
                          ? "font-bold text-black bg-stone-50"
                          : "text-gray-600"
                      }`}
                    >
                      {option.label}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <FilterSection
          title={t("價格區間", "Price Range", "가격 범위")}
          defaultOpen={true}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-black">
                $
              </span>
              <input
                type="number"
                placeholder={t("最低", "Min", "최소")}
                value={priceRange.min}
                onChange={(e) => {
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }));
                  onUserInteraction();
                }}
                className="w-full bg-transparent border-b border-gray-200 py-2 pl-4 pr-1 text-[13px] outline-none focus:border-black transition-colors rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <span className="text-gray-300">-</span>
            <div className="relative flex-1 group">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs group-focus-within:text-black">
                $
              </span>
              <input
                type="number"
                placeholder={t("最高", "Max", "최대")}
                value={priceRange.max}
                onChange={(e) => {
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }));
                  onUserInteraction();
                }}
                className="w-full bg-transparent border-b border-gray-200 py-2 pl-4 pr-1 text-[13px] outline-none focus:border-black transition-colors rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title={t("產品類別", "Categories", "카테고리")}
          defaultOpen={true}
        >
          <div className="space-y-3">
            {dynamicCategories.map((cat) => {
              const isChecked = activeFilters.categories.includes(cat.slug);
              const isEmpty = cat.count === 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleFilter("categories", cat.slug)}
                  className={`flex items-center gap-3 w-full text-left group transition-all duration-200 ${isEmpty ? "opacity-40" : ""}`}
                >
                  <CustomCircleCheckbox isChecked={isChecked} />
                  <span
                    className={`text-[13px] transition-colors flex-1 ${isChecked ? "font-bold text-black" : "text-gray-500 group-hover:text-black"}`}
                  >
                    {cat.metadata?.[`name_${metaLang}`] || cat.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wider">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection
          title={t("精選品牌", "Brands", "브랜드")}
          defaultOpen={true}
        >
          <div className="grid grid-cols-1 gap-3">
            {dynamicBrands.map((brand) => {
              const isChecked = activeFilters.brands.includes(brand.slug);
              const isEmpty = brand.count === 0;
              return (
                <button
                  key={brand.id}
                  onClick={() => toggleFilter("brands", brand.slug)}
                  className={`flex items-center gap-3 w-full text-left group transition-all duration-200 ${isEmpty ? "opacity-40" : ""}`}
                >
                  <CustomCircleCheckbox isChecked={isChecked} />
                  <span
                    className={`text-[13px] transition-colors flex-1 truncate ${isChecked ? "font-bold text-black" : "text-gray-500 group-hover:text-black"}`}
                  >
                    {brand.metadata?.[`name_${metaLang}`] || brand.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wider">
                    {brand.count}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>

      {isMobile ? (
        <div className="flex gap-3 mt-4 border-t border-gray-100 pt-6">
          <button
            onClick={resetFilters}
            className="flex-[0.4] py-3.5 text-[11px] font-bold tracking-[0.1em] border border-gray-300 text-gray-600 uppercase rounded-none"
          >
            {t("清除", "Reset", "초기화")}
          </button>
          <button
            onClick={onApply}
            className="flex-1 py-3.5 bg-black text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors rounded-none flex items-center justify-center gap-2 active:scale-95"
          >
            <Search size={14} />
            {t("套用並搜尋", "Apply & Search", "적용 및 검색")}
          </button>
        </div>
      ) : (
        <button
          onClick={resetFilters}
          className="w-full py-4 mt-4 text-[10px] font-bold tracking-[0.25em] border border-black text-black hover:bg-black hover:text-white transition-all uppercase rounded-none"
        >
          {t("清除所有篩選", "Clear Filters", "필表 초기화")}
        </button>
      )}
    </div>
  );
};

// --- 下方門市資訊 ---
const CompanyLocation = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const overlayOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 0.4, 0],
  );
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.15, 1, 1.15],
  );

  return (
    <section
      ref={ref}
      className="company-location relative border-t border-gray-400"
    >
      <div className="flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-1/2 relative overflow-hidden min-h-[400px] md:min-h-full">
          <motion.div
            className="absolute inset-0 bg-black z-10 pointer-events-none"
            style={{ opacity: overlayOpacity }}
          ></motion.div>
          <motion.div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_6.jpg')",
              scale: imageScale,
            }}
          ></motion.div>
        </div>
        <div className="w-full md:w-1/2 bg-white p-10 md:p-20 flex flex-col justify-center">
          <h2 className="text-[32px] font-normal uppercase tracking-wide mb-10">
            STORE INFO
          </h2>
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Open Hours
              </h4>
              <p className="text-[15px] font-medium leading-relaxed">
                13:00 – 20:00 (週一至週六)
                <br />
                <span className="text-gray-500 text-[13px]">
                  [定休日: 週日]
                </span>
              </p>
            </div>
          </div>
          <div className="mt-12">
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-stone-400 px-8 py-3 font-bold text-black transition-all duration-300 hover:text-white"
            >
              <span className="absolute inset-0 h-full w-full translate-y-full bg-[#eb4820] transition-all duration-300 group-hover:translate-y-0"></span>
              <span className="relative">到店前請提前預約</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- 🔥 主頁面元件 ---
export default function CategoryPage({ products, brands, categories }) {
  const router = useRouter();
  const { locale, asPath } = router;
  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const tAllProducts =
    locale === "en"
      ? "All Products"
      : locale === "ko"
        ? "전체 상품"
        : "全部商品";

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    brands: [],
  });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(12);

  const isReady = useRef(false);
  const prevFiltersRef = useRef("");
  const [loadedPath, setLoadedPath] = useState(null);

  const handleSetActiveFilters = (action) => {
    setActiveFilters(action);
    setVisibleCount(12);
  };
  const handleSetPriceRange = (action) => {
    setPriceRange(action);
    setVisibleCount(12);
  };
  const handleSetSortBy = (action) => {
    setSortBy(action);
    setVisibleCount(12);
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "scrollRestoration" in window.history
    ) {
      window.history.scrollRestoration = "manual";
    }

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        sessionStorage.setItem(
          `kesh_scroll_${asPath}`,
          window.scrollY.toString(),
        );
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [asPath]);

  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;

    const currentSlug = router.query.slug;
    const currentPath = router.asPath.split("?")[0];

    const savedState = sessionStorage.getItem(`kesh_filters_${currentPath}`);

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setActiveFilters(
          parsed.activeFilters || { categories: [], brands: [] },
        );
        setPriceRange(parsed.priceRange || { min: "", max: "" });
        setSortBy(parsed.sortBy || "newest");
        setVisibleCount(parsed.visibleCount || 12);
        prevFiltersRef.current = JSON.stringify({
          activeFilters: parsed.activeFilters,
          priceRange: parsed.priceRange,
          sortBy: parsed.sortBy,
        });
      } catch (e) {
        console.error("Failed to parse filters", e);
      }
    } else {
      const defaultFilters = { categories: [], brands: [] };
      if (currentSlug && currentSlug !== "all") {
        if (categories.some((c) => c.slug === currentSlug)) {
          defaultFilters.categories = [currentSlug];
        } else if (brands.some((b) => b.slug === currentSlug)) {
          defaultFilters.brands = [currentSlug];
        }
      }

      setActiveFilters(defaultFilters);
      setPriceRange({ min: "", max: "" });
      setSortBy("newest");
      setVisibleCount(12);
      prevFiltersRef.current = JSON.stringify({
        activeFilters: defaultFilters,
        priceRange: { min: "", max: "" },
        sortBy: "newest",
      });
    }

    setLoadedPath(currentPath);

    const savedScroll = sessionStorage.getItem(`kesh_scroll_${currentPath}`);
    if (savedScroll) {
      const targetY = parseInt(savedScroll, 10);
      let attempts = 0;
      const tryScroll = () => {
        if (document.body.scrollHeight >= targetY || attempts > 20) {
          window.scrollTo({ top: targetY, behavior: "instant" });
          sessionStorage.removeItem(`kesh_scroll_${currentPath}`);
        } else {
          attempts++;
          setTimeout(tryScroll, 50);
        }
      };
      tryScroll();
    }
    isReady.current = true;
  }, [router.isReady, router.query.slug, router.asPath, categories, brands]);

  useEffect(() => {
    const currentPath = router.asPath.split("?")[0];
    if (loadedPath !== currentPath) return;

    const stateToSave = { activeFilters, priceRange, sortBy, visibleCount };
    sessionStorage.setItem(
      `kesh_filters_${currentPath}`,
      JSON.stringify(stateToSave),
    );
  }, [
    activeFilters,
    priceRange,
    sortBy,
    visibleCount,
    router.asPath,
    loadedPath,
  ]);

  useEffect(() => {
    const currentPath = router.asPath.split("?")[0];
    if (loadedPath !== currentPath) return;

    const currentFiltersString = JSON.stringify({
      activeFilters,
      priceRange,
      sortBy,
    });

    if (
      prevFiltersRef.current !== currentFiltersString &&
      prevFiltersRef.current !== ""
    ) {
      setVisibleCount(12);
      prevFiltersRef.current = currentFiltersString;
    }
  }, [activeFilters, priceRange, sortBy, loadedPath, router.asPath]);

  const handleMobileApply = () => {
    setIsMobileFilterOpen(false);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      window.scrollTo({
        top: document.querySelector(".products-content").offsetTop - 60,
        behavior: "smooth",
      });
    }, 600);
  };

  const finalProducts = useMemo(() => {
    let list = [...products];

    if (activeFilters.categories.length > 0) {
      list = list.filter((p) =>
        p.categorySlugs?.some((slug) =>
          activeFilters.categories.includes(slug),
        ),
      );
    }
    if (activeFilters.brands.length > 0) {
      list = list.filter((p) => activeFilters.brands.includes(p.brandSlug));
    }
    if (priceRange.min)
      list = list.filter((p) => p.rawPrice >= parseFloat(priceRange.min));
    if (priceRange.max)
      list = list.filter((p) => p.rawPrice <= parseFloat(priceRange.max));

    list.sort((a, b) => {
      if (sortBy === "price-high") return b.rawPrice - a.rawPrice;
      if (sortBy === "price-low") return a.rawPrice - b.rawPrice;
      if (sortBy === "oldest")
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [products, activeFilters, priceRange, sortBy]);

  const listForCategoryCount = useMemo(() => {
    let list = [...products];
    if (activeFilters.brands.length > 0) {
      list = list.filter((p) => activeFilters.brands.includes(p.brandSlug));
    }
    if (priceRange.min)
      list = list.filter((p) => p.rawPrice >= parseFloat(priceRange.min));
    if (priceRange.max)
      list = list.filter((p) => p.rawPrice <= parseFloat(priceRange.max));
    return list;
  }, [products, activeFilters.brands, priceRange]);

  const dynamicCategoriesWithCount = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      count: listForCategoryCount.filter((p) =>
        p.categorySlugs?.includes(cat.slug),
      ).length,
    }));
  }, [categories, listForCategoryCount]);

  const listForBrandCount = useMemo(() => {
    let list = [...products];
    if (activeFilters.categories.length > 0) {
      list = list.filter((p) =>
        p.categorySlugs?.some((slug) =>
          activeFilters.categories.includes(slug),
        ),
      );
    }
    if (priceRange.min)
      list = list.filter((p) => p.rawPrice >= parseFloat(priceRange.min));
    if (priceRange.max)
      list = list.filter((p) => p.rawPrice <= parseFloat(priceRange.max));
    return list;
  }, [products, activeFilters.categories, priceRange]);

  const dynamicBrandsWithCount = useMemo(() => {
    return brands.map((brand) => ({
      ...brand,
      count: listForBrandCount.filter((p) => p.brandSlug === brand.slug).length,
    }));
  }, [brands, listForBrandCount]);

  if (router.isFallback)
    return (
      <div className="min-h-screen flex items-center justify-center tracking-widest uppercase">
        Loading...
      </div>
    );

  const displayedProducts = finalProducts.slice(0, visibleCount);

  const getFilterDisplayName = () => {
    if (
      activeFilters.categories.length === 1 &&
      activeFilters.brands.length === 0
    ) {
      const c = categories.find((x) => x.slug === activeFilters.categories[0]);
      return c
        ? c.metadata?.[`name_${metaLang}`] || c.name
        : activeFilters.categories[0];
    }
    if (
      activeFilters.brands.length === 1 &&
      activeFilters.categories.length === 0
    ) {
      const b = brands.find((x) => x.slug === activeFilters.brands[0]);
      return b
        ? b.metadata?.[`name_${metaLang}`] || b.name
        : activeFilters.brands[0];
    }
    if (
      activeFilters.categories.length === 0 &&
      activeFilters.brands.length === 0
    ) {
      return tAllProducts;
    }
    return "Filtered Results";
  };

  // 🔥 關鍵修正：修正原本 titleDisplay 未定義的 Typo，與變數一致
  const displayTitle = getFilterDisplayName();
  const pageTitle = `${displayTitle} | KÉSH de¹`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <main className="pb-0 bg-white text-black font-sans min-h-screen">
        <Slider />
        <Carousel />

        <section>
          <div className="title">
            <div className="py-12 px-6 md:px-10 bg-[#fafafa]">
              {/* 🔥 關鍵修正：此處原本打錯成 {titleDisplay} 導致崩潰 */}
              <h1 className="text-3xl md:text-5xl font-light tracking-wide uppercase text-gray-900">
                {displayTitle}
              </h1>
              <p className="mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {finalProducts.length} Items
              </p>
            </div>
            <div className="border-t border-b border-gray-200 py-3 bg-stone-50">
              <Marquee gradient={false} speed={40}>
                <div className="flex items-center">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="px-10 md:px-20 flex flex-row items-center gap-4"
                    >
                      <span className="bg-[#1c1c1c] text-white text-[10px] rounded-full py-1 px-3 font-bold tracking-widest">
                        NEWS
                      </span>
                      <p className="text-[13px] font-medium text-gray-800 tracking-wide">
                        凱仕國際精品保證所有商品皆經專業鑑定，僅販售 100% 正品。
                      </p>
                    </div>
                  ))}
                </div>
              </Marquee>
            </div>
          </div>
        </section>

        <div className="md:hidden sticky top-[90px] z-40 bg-white border-b border-gray-200 shadow-sm">
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
                className="overflow-hidden bg-white"
              >
                <FilterSidebar
                  activeFilters={activeFilters}
                  setActiveFilters={handleSetActiveFilters}
                  dynamicBrands={dynamicBrandsWithCount}
                  dynamicCategories={dynamicCategoriesWithCount}
                  locale={locale}
                  priceRange={priceRange}
                  setPriceRange={handleSetPriceRange}
                  sortBy={sortBy}
                  setSortBy={handleSetSortBy}
                  isMobile={true}
                  onApply={handleMobileApply}
                  onUserInteraction={() => setVisibleCount(12)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section className="products-content flex flex-col md:flex-row">
          <aside className="hidden md:block w-[280px] lg:w-[320px] border-r border-gray-200 bg-white relative">
            <div className="sticky top-[100px] h-fit pb-10">
              <FilterSidebar
                activeFilters={activeFilters}
                setActiveFilters={handleSetActiveFilters}
                dynamicBrands={dynamicBrandsWithCount}
                dynamicCategories={dynamicCategoriesWithCount}
                locale={locale}
                priceRange={priceRange}
                setPriceRange={handleSetPriceRange}
                sortBy={sortBy}
                setSortBy={handleSetSortBy}
                isMobile={false}
                onUserInteraction={() => setVisibleCount(12)}
              />
            </div>
          </aside>

          <div
            className={`flex-1 min-h-[50vh] bg-white transition-all duration-500 ease-in-out ${
              isRefreshing
                ? "opacity-30 blur-[2px] pointer-events-none scale-[0.99]"
                : "opacity-100 blur-0 scale-100"
            }`}
          >
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

                {visibleCount < finalProducts.length && (
                  <div className="py-24 flex justify-center border-t border-gray-100">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="px-16 py-4 border border-black text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-300 rounded-none"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-gray-400">
                <Search size={48} className="mb-6 opacity-20" />
                <p className="text-sm tracking-widest uppercase font-medium text-gray-500">
                  No products found
                </p>
                <button
                  onClick={() => {
                    handleSetActiveFilters({ categories: [], brands: [] });
                    handleSetPriceRange({ min: "", max: "" });
                    sessionStorage.removeItem(
                      `kesh_filters_${router.asPath.split("?")[0]}`,
                    );
                  }}
                  className="mt-6 text-[11px] font-bold uppercase tracking-widest border-b border-gray-400 pb-1 hover:text-black hover:border-black transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </section>

        <CompanyLocation />
      </main>
    </>
  );
}

export async function getStaticProps({ params, locale }) {
  const slug = params?.slug || "all";
  const currentLang = locale || "zh-TW";

  const targetCurrency =
    currentLang === "en" ? "usd" : currentLang === "ko" ? "krw" : "twd";
  const symbol =
    targetCurrency === "usd" ? "$ " : targetCurrency === "krw" ? "₩ " : "NT$ ";

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!BACKEND_URL || !API_KEY) {
    return {
      props: {
        products: [],
        brands: [],
        categories: [],
      },
      revalidate: 60,
    };
  }

  try {
    const headers = {
      "x-publishable-api-key": API_KEY,
      "Content-Type": "application/json",
    };
    const fetchOptions = { headers, cache: "no-store" };

    const [catRes, colRes, pRes] = await Promise.all([
      // 🔥 關鍵修正：加上 fields 參數強抓 metadata，否則側邊欄多語系和 rank 排序會完全破圖失效！
      fetch(
        `${BACKEND_URL}/store/product-categories?limit=250&fields=id,name,handle,metadata,rank`,
        fetchOptions,
      ),
      fetch(
        `${BACKEND_URL}/store/collections?limit=250&fields=id,title,handle,metadata,rank`,
        fetchOptions,
      ),
      fetch(
        `${BACKEND_URL}/store/products?limit=250&fields=id,title,handle,thumbnail,metadata,created_at,*variants,*variants.prices,*collection,*categories`,
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
        ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
        : 0;

      return {
        id: p.id,
        slug: p.handle || "",
        title: p.title || "",
        brand: p.collection?.title || "KÉSH de¹ Select",
        brandSlug: p.collection?.handle || "select",
        categorySlugs:
          p.categories && p.categories.length > 0
            ? p.categories.map((c) => c.handle)
            : ["others"],
        displayPrice: `${symbol}${Math.round(amount).toLocaleString()}`,
        rawPrice: amount,
        createdAt: p.created_at,
        image: p.thumbnail,
        metadata: p.metadata || {},
        status: p.metadata?.rank || "RANK S",
        tags: p.tags?.map((t) => t.value) || [],
      };
    });

    const categoriesList = (catData.product_categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      metadata: c.metadata || {},
      slug: c.handle,
    }));

    categoriesList.sort((a, b) => {
      const rankA =
        a.metadata?.rank !== undefined ? Number(a.metadata.rank) : 999;
      const rankB =
        b.metadata?.rank !== undefined ? Number(b.metadata.rank) : 999;
      if (rankA === rankB) return (a.name || "").localeCompare(b.name || "");
      return rankA - rankB;
    });

    const brandsList = (colData.collections || []).map((c) => ({
      id: c.id,
      name: c.title,
      metadata: c.metadata || {},
      slug: c.handle,
    }));

    brandsList.sort((a, b) => {
      const rankA =
        a.metadata?.rank !== undefined ? Number(a.metadata.rank) : 999;
      const rankB =
        b.metadata?.rank !== undefined ? Number(b.metadata.rank) : 999;
      if (rankA === rankB) return (a.name || "").localeCompare(b.name || "");
      return rankA - rankB;
    });

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
    return {
      props: {
        ...(await serverSideTranslations(currentLang, ["common"])),
        products: [],
        brands: [],
        categories: [],
      },
      revalidate: 60,
    };
  }
}
