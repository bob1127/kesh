"use client";

import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useMemo, useRef, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// --- 🛍️ 商品卡片組件 (支援多語系) ---
const ProductCard = ({ product, locale }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const displayTitle = product.metadata?.[`title_${metaLang}`] || product.title;

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCursorPos({ x, y });
  };

  return (
    <Link href={`/product/${product.slug}`} className="group border-b border-gray-400 md:border-r border-gray-400 last:border-r-0 relative flex flex-col bg-white">
      <div className="relative w-full aspect-[4/5] bg-[#f4f4f4] overflow-hidden cursor-crosshair" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); setCursorPos({ x: 50, y: 50 }); }} onMouseMove={handleMouseMove}>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20 pointer-events-none">
          {product.tags && product.tags.map((tag) => (
            <span key={tag} className="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-sm font-medium tracking-wide">{tag}</span>
          ))}
        </div>
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="text-[10px] font-bold text-gray-500 border border-gray-400 px-1.5 py-0.5 rounded bg-white/80">{product.status}</span>
        </div>
        <div className="w-full h-full bg-cover bg-center transition-transform duration-500 ease-out" style={{ backgroundImage: `url('${product.image || "/images/placeholder.jpg"}')`, transform: isHovered ? "scale(2)" : "scale(1)", transformOrigin: `${cursorPos.x}% ${cursorPos.y}%` }}></div>
      </div>
      <div className="p-5 bg-white mt-auto flex flex-col gap-1">
        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">{product.brand}</div>
        <h2 className="text-[14px] font-medium text-gray-900 leading-snug tracking-wide group-hover:text-[#ef4628] transition-colors line-clamp-2">{displayTitle}</h2>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="text-[15px] font-bold text-black tracking-wide">{product.price}</p>
          <span className="text-[10px] text-gray-400 underline decoration-gray-300 underline-offset-2">View Detail</span>
        </div>
      </div>
    </Link>
  );
};

// --- 🏷️ FilterSidebar ---
const FilterSidebar = ({ activeFilter, onFilterChange, isMobile = false, onCloseMobile, dynamicBrands = [], dynamicCategories = [], locale }) => {
  const isActive = (type, value) => activeFilter.type === type && activeFilter.value === value ? "text-[#ef4628] font-extrabold" : "text-gray-600 hover:text-black"; 
  const linkClass = "text-[13px] transition-colors block leading-tight cursor-pointer py-1";
  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const tAllProducts = locale === 'en' ? "All Products" : locale === 'ko' ? "전체 상품" : "全部商品";

  return (
    <div className={`flex ${isMobile ? "flex-col p-6 space-y-8" : "flex-row gap-6 p-6 md:p-8"}`}>
      <div className={isMobile ? "" : "flex-1"}>
        {isMobile && <div className="border-t border-gray-200 mb-8"></div>}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</h3>
          {dynamicCategories.length > 0 ? (
            <ul className="space-y-2">
              <li>
                <Link href="/category/all" onClick={() => isMobile && onCloseMobile()} className={`flex justify-between w-full ${linkClass} ${isActive("all", null)}`}>
                  <span>{tAllProducts}</span>
                </Link>
              </li>
              {dynamicCategories.map((cat) => {
                const displayName = cat.metadata?.[`name_${metaLang}`] || cat.name;
                return (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.slug}`} onClick={() => isMobile && onCloseMobile()} className={`flex justify-between w-full ${linkClass} ${isActive("category", cat.slug)}`}>
                      <span>{displayName}</span>
                      <span className={`text-[10px] ${activeFilter.value === cat.slug ? "opacity-100 font-bold" : "opacity-60"}`}>({cat.count})</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (<p className="text-[12px] text-gray-400">Loading Categories...</p>)}
        </div>
      </div>
      {isMobile && <div className="border-t border-gray-200"></div>}
      <div className={isMobile ? "" : "flex-1"}>
        <h3 className="text-lg font-bold mb-4 text-gray-400 md:text-black md:text-lg text-xs md:font-bold uppercase tracking-widest md:tracking-normal md:normal-case">Brands</h3>
        {dynamicBrands.length > 0 ? (
          <ul className={`${isMobile ? "grid grid-cols-2 gap-x-4 gap-y-3" : "space-y-2"}`}>
            {dynamicBrands.map((brand) => {
              const brandName = brand.metadata?.[`name_${metaLang}`] || brand.name;
              return (
                <li key={brand.id}>
                  <Link href={`/category/${brand.slug}`} onClick={() => isMobile && onCloseMobile()} className={`flex justify-between items-center w-full text-left ${linkClass} ${isActive("brand", brand.slug)}`}>
                    <span className="truncate mr-1 md:underline md:decoration-gray-300 md:underline-offset-4 decoration-1">{brandName}</span>
                    <span className={`text-[10px] ${activeFilter.value === brand.slug ? "opacity-100 font-bold" : "opacity-60"}`}>({brand.count})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (<p className="text-[12px] text-gray-400">Loading Brands...</p>)}
      </div>
    </div>
  );
};

const CompanyLocation = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.4, 0]);
    const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1, 1.15]);
  
    return (
      <section ref={ref} className="company-location relative border-t border-gray-400">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          <div className="w-full md:w-1/2 relative overflow-hidden min-h-[400px] md:min-h-full">
            <motion.div className="absolute inset-0 bg-black z-10 pointer-events-none" style={{ opacity: overlayOpacity }}></motion.div>
            <motion.div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_6.jpg')", scale: imageScale }}></motion.div>
          </div>
          <div className="w-full md:w-1/2 bg-white p-10 md:p-20 flex flex-col justify-center">
            <h2 className="text-[32px] font-normal uppercase tracking-wide mb-10">STORE INFO</h2>
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Address</h4>
                <p className="text-[15px] font-medium leading-relaxed">台灣省台中市北區中清路一段 428 號</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Open Hours</h4>
                <p className="text-[15px] font-medium leading-relaxed">13:00 – 20:00 (週一至週六)<br /><span className="text-gray-500 text-[13px]">[定休日: 週日]</span></p>
              </div>
            </div>
            <div className="mt-12">
              <Link href="/contact" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-stone-400 px-8 py-3 font-bold text-black transition-all duration-300 hover:text-white">
                <span className="absolute inset-0 h-full w-full translate-y-full bg-[#eb4820] transition-all duration-300 group-hover:translate-y-0"></span>
                <span className="relative">到店前請提前預約</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  };

// --- 🔥 主頁面: 分類列表頁 ([slug].jsx) ---
export default function CategoryPage({ products, brands, categories, initialFilter }) {
  const router = useRouter();
  const { locale } = router;
  const metaLang = locale === "zh-TW" ? "zh" : locale;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(initialFilter || { type: 'all', value: null });
  const tAllProducts = locale === 'en' ? "All Products" : locale === 'ko' ? "전체 상품" : "全部商品";

  useEffect(() => {
    if (initialFilter) setActiveFilter(initialFilter);
  }, [initialFilter]);

  const handleFilterChange = (type, value) => {
    setActiveFilter({ type, value });
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeFilter.type === "all") return products;
    return products.filter((product) => {
      if (activeFilter.type === "brand") return product.brandSlug === activeFilter.value;
      if (activeFilter.type === "category") return product.categorySlug === activeFilter.value;
      if (activeFilter.type === "collection") return product.tags && product.tags.includes(activeFilter.value);
      return true;
    });
  }, [activeFilter, products]);

  if (router.isFallback) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const getFilterDisplayName = () => {
    if (activeFilter.type === 'all' || !activeFilter.value) return tAllProducts;
    if (activeFilter.type === 'brand') {
      const b = brands.find(x => x.slug === activeFilter.value);
      return b ? (b.metadata?.[`name_${metaLang}`] || b.name) : activeFilter.value;
    }
    if (activeFilter.type === 'category') {
      const c = categories.find(x => x.slug === activeFilter.value);
      return c ? (c.metadata?.[`name_${metaLang}`] || c.name) : activeFilter.value;
    }
    return activeFilter.value;
  };

  const displayTitle = getFilterDisplayName();
  const pageTitle = `${displayTitle} | KÉSH de¹`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <main className="py-20 bg-white text-black font-sans min-h-screen">
        <section>
          <div className="title">
            <div className="py-6 px-6 md:px-10">
              <nav className="text-[11px] font-medium text-gray-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <Link href="/" className="hover:text-black transition-colors">Home</Link>
                <span>/</span>
                <Link href="/category/all" className="hover:text-black transition-colors">Shop</Link>
                {activeFilter.type !== 'all' && (
                  <>
                    <span>/</span>
                    <span className="text-black uppercase">{displayTitle}</span>
                  </>
                )}
              </nav>
              <h1 className="text-[32px] md:text-[36px] font-normal tracking-wide uppercase">{displayTitle}</h1>
            </div>
          </div>
        </section>

        <section className="products-content border-t border-b border-gray-400 flex flex-col md:flex-row">
          <div className="filter hidden md:flex w-full md:w-[25%] border-b md:border-b-0 md:border-r border-gray-400 relative bg-white">
            <div className="sticky top-20 h-auto overflow-y-auto max-h-[calc(100vh-100px)] w-full">
              <FilterSidebar activeFilter={activeFilter} onFilterChange={handleFilterChange} isMobile={false} dynamicBrands={brands} dynamicCategories={categories} locale={locale} />
            </div>
          </div>
          
          <div className="products w-full md:w-[75%] min-h-[50vh]">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <p className="text-lg">該分類下目前沒有產品</p>
                <Link href="/category/all" className="mt-4 text-sm underline hover:text-[#ef4628] transition-colors">查看全部商品</Link>
              </div>
            )}
          </div>
        </section>
        <CompanyLocation />
      </main>
    </>
  );
}

// 🚀 SSG: 生成靜態路徑 (解決 404 問題)
export async function getStaticPaths() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!BACKEND_URL || !API_KEY) return { paths: [], fallback: 'blocking' };

  try {
    const headers = { "x-publishable-api-key": API_KEY };
    const [catRes, colRes] = await Promise.all([
      fetch(`${BACKEND_URL}/store/product-categories?limit=100`, { headers }),
      fetch(`${BACKEND_URL}/store/collections?limit=100`, { headers })
    ]);

    const catData = await catRes.json();
    const colData = await colRes.json();

    const catSlugs = (catData.product_categories || []).map(c => c.handle.replace(/^\/+/, ''));
    const colSlugs = (colData.collections || []).map(c => c.handle.replace(/^\/+/, ''));
    
    const validSlugs = ['all', ...catSlugs, ...colSlugs];
    const paths = validSlugs.map((slug) => ({ params: { slug: slug } }));

    return { paths, fallback: 'blocking' };
  } catch (error) {
    return { paths: [], fallback: 'blocking' };
  }
}

// 🚀 SSG: 抓取分類資料與商品
export async function getStaticProps({ params, locale }) {
  const { slug } = params;
  const currentLang = locale || 'zh-TW';

  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!BACKEND_URL || !API_KEY) {
     return { props: { products: [], brands: [], categories: [], initialFilter: { type: 'all', value: null } }, revalidate: 60 };
  }

  try {
    const headers = {
      "x-publishable-api-key": API_KEY,
      "Content-Type": "application/json",
    };

    const [catRes, colRes] = await Promise.all([
      fetch(`${BACKEND_URL}/store/product-categories?limit=100`, { headers }),
      fetch(`${BACKEND_URL}/store/collections?limit=100`, { headers })
    ]);

    const catData = await catRes.json();
    const colData = await colRes.json();
    const rawCategories = catData.product_categories || [];
    const rawCollections = colData.collections || [];

    const categoryMap = {}; 
    await Promise.all(
      rawCategories.map(async (cat) => {
        try {
          const res = await fetch(`${BACKEND_URL}/store/products?category_id[]=${cat.id}&limit=100`, { headers });
          const data = await res.json();
          if (data.products) data.products.forEach(p => { categoryMap[p.id] = cat; });
        } catch (e) { console.error(e); }
      })
    );

    const pRes = await fetch(`${BACKEND_URL}/store/products?limit=100`, { headers });
    const pData = await pRes.json();
    const rawProducts = pData.products || [];

    const formattedProducts = rawProducts.map((p) => {
      const rawPrice = p.variants?.[0]?.prices?.[0] ? p.variants[0].prices[0].amount / 100 : 0;
      const mappedCat = categoryMap[p.id];
      const catHandle = mappedCat?.handle || "others";
      const colHandle = p.collection?.handle || "select";

      return {
        id: p.id,
        slug: p.handle ? p.handle.replace(/^\/+/, '') : '',
        title: p.title ? p.title.toUpperCase() : '未命名',
        brand: p.collection?.title || "KÉSH de¹ Select",
        brandSlug: colHandle.replace(/^\/+/, ''),
        category: mappedCat?.name || "Accessories",
        categorySlug: catHandle.replace(/^\/+/, ''),
        price: `NT$ ${rawPrice.toLocaleString()}`,
        status: "RANK S",
        image: p.thumbnail || null,
        metadata: p.metadata || {}, // 🔥 讓商品卡片讀取翻譯
      };
    });

    const categoriesList = rawCategories.map((c) => ({
      id: c.id,
      name: c.name,
      metadata: c.metadata || {}, // 🔥 讓選單讀取翻譯
      slug: c.handle.replace(/^\/+/, ''),
      count: formattedProducts.filter(p => p.categorySlug === c.handle.replace(/^\/+/, '')).length
    }));

    const brandsList = rawCollections.map((c) => ({
      id: c.id,
      name: c.title,
      metadata: c.metadata || {}, // 🔥 讓選單讀取翻譯
      slug: c.handle.replace(/^\/+/, ''),
      count: formattedProducts.filter(p => p.brandSlug === c.handle.replace(/^\/+/, '')).length
    }));

    let initialFilter = { type: 'all', value: null };
    if (slug !== 'all') {
      if (brandsList.some(b => b.slug === slug)) {
         initialFilter = { type: 'brand', value: slug };
      } else if (categoriesList.some(c => c.slug === slug)) {
         initialFilter = { type: 'category', value: slug };
      } else {
        return { notFound: true }; // 防呆
      }
    }

    return {
      props: {
        ...(await serverSideTranslations(currentLang, ['common'])),
        products: formattedProducts,
        brands: brandsList,
        categories: categoriesList,
        initialFilter,
      },
      revalidate: 60,
    };
  } catch (error) {
    return { props: { ...(await serverSideTranslations(currentLang, ['common'])), products: [], brands: [], categories: [], initialFilter: { type: 'all', value: null } }, revalidate: 60 };
  }
}