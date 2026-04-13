"use client";

import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useMemo, useRef, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const QUICK_LINKS = ["最新現貨", "經典包款", "熱門小皮件", "全配頂級收藏"];

// --- 商品卡片組件 (維持原設計) ---
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCursorPos({ x, y });
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group border-b border-gray-400 md:border-r border-gray-400 last:border-r-0 relative flex flex-col bg-white"
    >
      <div
        className="relative w-full aspect-[4/5] bg-[#f4f4f4] overflow-hidden cursor-crosshair"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setCursorPos({ x: 50, y: 50 });
        }}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
          {product.tags &&
            product.tags.map((tag) => (
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
          className="w-full h-full bg-cover bg-center transition-transform duration-500 ease-out"
          style={{
            backgroundImage: `url('${product.image || "/images/placeholder.jpg"}')`,
            transform: isHovered ? "scale(2)" : "scale(1)",
            transformOrigin: `${cursorPos.x}% ${cursorPos.y}%`,
          }}
        ></div>
      </div>
      <div className="p-5 bg-white mt-auto flex flex-col gap-1">
        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">
          {product.brand}
        </div>
        <h2 className="text-[14px] font-medium text-gray-900 leading-snug tracking-wide group-hover:text-[#ef4628] transition-colors line-clamp-2">
          {product.title}
        </h2>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="text-[15px] font-bold text-black tracking-wide">
            {product.price}
          </p>
          <span className="text-[10px] text-gray-400 underline decoration-gray-300 underline-offset-2">
            View Detail
          </span>
        </div>
      </div>
    </Link>
  );
};

// --- FilterSidebar (維持原設計) ---
const FilterSidebar = ({
  activeFilter,
  onFilterChange,
  isMobile = false,
  onCloseMobile,
  dynamicBrands = [],
  dynamicCategories = [],
}) => {
  const { t } = useTranslation("common");

  const isActive = (type, value) =>
    activeFilter.type === type && activeFilter.value === value
      ? "text-[#ef4628] font-extrabold"
      : "text-gray-600 hover:text-black";
  const linkClass =
    "text-[13px] transition-colors block leading-tight cursor-pointer py-1";

  return (
    <div
      className={`flex ${isMobile ? "flex-col p-6 space-y-8" : "flex-row gap-6 p-6 md:p-8"}`}
    >
      <div className={isMobile ? "" : "flex-1"}>
        {isMobile && <div className="border-t border-gray-200 mb-8"></div>}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Categories
          </h3>
          {dynamicCategories.length > 0 ? (
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onFilterChange("all", null);
                    if (isMobile) onCloseMobile();
                  }}
                  className={`flex justify-between w-full text-left ${linkClass} ${isActive("all", null)}`}
                >
                  <span>All Products</span>
                </button>
              </li>
              {dynamicCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onFilterChange("category", cat.slug);
                      if (isMobile) onCloseMobile();
                    }}
                    className={`flex justify-between w-full text-left ${linkClass} ${isActive("category", cat.slug)}`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-60">
                      ({cat.count})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-gray-400">Loading Categories...</p>
          )}
        </div>
      </div>

      {isMobile && <div className="border-t border-gray-200"></div>}

      <div className={isMobile ? "" : "flex-1"}>
        <h3 className="text-lg font-bold mb-4 text-gray-400 md:text-black md:text-lg text-xs md:font-bold uppercase tracking-widest md:tracking-normal md:normal-case">
          Brands
        </h3>
        {dynamicBrands.length > 0 ? (
          <ul
            className={`${isMobile ? "grid grid-cols-2 gap-x-4 gap-y-3" : "space-y-2"}`}
          >
            {dynamicBrands.map((brand) => (
              <li key={brand.id}>
                <button
                  onClick={() => {
                    onFilterChange("brand", brand.slug);
                    if (isMobile) onCloseMobile();
                  }}
                  className={`flex justify-between items-center w-full text-left ${linkClass} ${isActive("brand", brand.slug)}`}
                >
                  <span className="truncate mr-1 md:underline md:decoration-gray-300 md:underline-offset-4 decoration-1">
                    {brand.name}
                  </span>
                  <span className="text-[10px] opacity-60">
                    ({brand.count})
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-gray-400">Loading Brands...</p>
        )}
      </div>
    </div>
  );
};

// --- CompanyLocation (維持原設計) ---
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
                Address
              </h4>
              <p className="text-[15px] font-medium leading-relaxed">
                台灣省台中市北區中清路一段 428 號
              </p>
            </div>
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

// --- 🔥 主要頁面 Component ---
export default function CategoryOverview({ products, brands, categories }) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState({
    type: "all",
    value: null,
  });

  const handleFilterChange = (type, value) => {
    setActiveFilter({ type, value });
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      const productSection = document.querySelector(".products-content");
      if (productSection) productSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeFilter.type === "all") return products;
    if (activeFilter.type === "brand")
      return products.filter((p) => p.brandSlug === activeFilter.value);
    if (activeFilter.type === "category")
      return products.filter((p) => p.categorySlug === activeFilter.value);
    return products;
  }, [activeFilter, products]);

  const getFilterDisplayName = () => {
    if (activeFilter.type === "all" || !activeFilter.value)
      return "Online Store";
    if (activeFilter.type === "brand") {
      const b = brands.find((x) => x.slug === activeFilter.value);
      return b ? b.name : activeFilter.value;
    }
    if (activeFilter.type === "category") {
      const c = categories.find((x) => x.slug === activeFilter.value);
      return c ? c.name : activeFilter.value;
    }
    return activeFilter.value;
  };

  const displayTitle = getFilterDisplayName();
  const pageTitle = `${displayTitle} | KÉSH de¹ 凱仕國際精品`;
  const pageDesc =
    "KÉSH de¹ 凱仕國際精品線上商店，提供 Hermès, Chanel, LV 等國際精品。台中實體門市，100%正品保證。";

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.kesh-de1.com";
  const currentUrl = `${SITE_URL}${router.asPath}`;
  const ogImage =
    filteredProducts.length > 0 && filteredProducts[0].image
      ? filteredProducts[0].image
      : `${SITE_URL}/default-og-image.jpg`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
      </Head>

      <main className="py-20 bg-white text-black font-sans min-h-screen">
        <section>
          <div className="title">
            <div className="py-6 px-6 md:px-10">
              <h1 className="text-[32px] md:text-[36px] font-normal tracking-wide uppercase">
                {displayTitle}
              </h1>
            </div>
            <div className="border-t border-gray-400 py-3 bg-stone-50">
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

        {/* Mobile Filter Button */}
        <div className="md:hidden sticky top-[60px] z-40 bg-white border-t border-b border-gray-400 shadow-sm">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full flex justify-between items-center py-4 px-6 bg-white"
          >
            <span className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              FILTER & CATEGORIES
            </span>
            <span
              className={`transform transition-transform duration-300 ${isMobileFilterOpen ? "rotate-180" : ""}`}
            >
              ↓
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out bg-[#fdfdfd] ${isMobileFilterOpen ? "max-h-[85vh] border-t border-gray-200" : "max-h-0"}`}
          >
            <FilterSidebar
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              isMobile={true}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
              dynamicBrands={brands}
              dynamicCategories={categories}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <section className="products-content border-t border-b border-gray-400 flex flex-col md:flex-row">
          <div className="filter hidden md:flex w-full md:w-[25%] border-b md:border-b-0 md:border-r border-gray-400 relative bg-white">
            <div className="sticky top-20 h-auto w-full p-0">
              <FilterSidebar
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                isMobile={false}
                dynamicBrands={brands}
                dynamicCategories={categories}
              />
            </div>
          </div>

          <div className="products w-full md:w-[75%] min-h-[50vh]">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-lg">該分類下沒有產品</p>
                <button
                  onClick={() => handleFilterChange("all", null)}
                  className="mt-4 text-sm underline hover:text-[#ef4628]"
                >
                  看全部商品
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

// ==========================================
// 🔥 SSG 數據抓取：全面替換為 Medusa 2.0 API
// ==========================================
export async function getStaticProps({ locale }) {
  const currentLang = locale || "zh-TW";

  // 從環境變數讀取您的 Medusa 設定
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  try {
    const headers = {
      "x-publishable-api-key": API_KEY,
      "Content-Type": "application/json",
    };

    // 1. 同時向 Medusa 抓取所有：商品、分類(Categories)、品牌系列(Collections)
    const [pRes, catRes, colRes] = await Promise.all([
      fetch(`${BACKEND_URL}/store/products?limit=100`, { headers }),
      fetch(`${BACKEND_URL}/store/product-categories`, { headers }),
      fetch(`${BACKEND_URL}/store/collections`, { headers }),
    ]);

    const pData = await pRes.json();
    const catData = await catRes.json();
    const colData = await colRes.json();

    const rawProducts = pData.products || [];
    const rawCategories = catData.product_categories || [];
    const rawCollections = colData.collections || [];

    // 2. 格式化商品資料 (匹配原來的 ProductCard 需求)
    const formattedProducts = rawProducts.map((p) => {
      // 處理價格：Medusa 存的是分，除以 100 變回元
      const rawPrice = p.variants?.[0]?.prices?.[0]
        ? p.variants[0].prices[0].amount / 100
        : 0;

      return {
        id: p.id,
        slug: p.handle,
        title: p.title.toUpperCase(),
        // 將 Medusa 的 Collection 當作品牌
        brand: p.collection?.title || "KÉSH de¹ Select",
        brandSlug: p.collection?.handle || "select",
        // 將 Medusa 的 Category 當作分類
        category: p.categories?.[0]?.name || "Accessories",
        categorySlug: p.categories?.[0]?.handle || "others",
        price: `NT$ ${rawPrice.toLocaleString()}`,
        rawPrice: rawPrice,
        tags: p.tags ? p.tags.map((t) => t.value) : [],
        status: "RANK S", // 可以根據庫存後續優化
        image: p.thumbnail || null,
      };
    });

    // 3. 自動計算各分類與品牌的商品數量
    const categoriesList = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.handle,
      count: formattedProducts.filter((p) => p.categorySlug === c.handle)
        .length,
    }));

    const brandsList = rawCollections.map((c) => ({
      id: c.id,
      name: c.title,
      slug: c.handle,
      count: formattedProducts.filter((p) => p.brandSlug === c.handle).length,
    }));

    return {
      props: {
        ...(await serverSideTranslations(currentLang, ["common"])),
        products: formattedProducts,
        brands: brandsList,
        categories: categoriesList,
      },
      // 每 60 秒重新生成一次頁面以保持資料最新
      revalidate: 60,
    };
  } catch (error) {
    console.error("❌ [Medusa SSG 抓取失敗]:", error);
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
