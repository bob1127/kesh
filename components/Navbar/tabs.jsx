"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  User,
  ShoppingBag,
  Search,
  Phone,
  Mail,
  Globe,
  ChevronRight,
  ChevronDown,
  Loader2,
  X,
  FileText,
} from "lucide-react";

import { useCart } from "../../components/context/CartContext";
import { useTranslation } from "next-i18next";
import { useUser } from "../../components/context/UserContext";
import { tFallback } from "@/lib/t-fallback";
import { getCorrectAmount } from "@/lib/price";

export const SlideTabsExample = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState("none");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔥 控制手機版分類/品牌下拉選單的狀態
  const [mobileExpanded, setMobileExpanded] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: [],
    pages: [],
  });
  const searchContainerRef = useRef(null);
  const searchScrollRef = useRef(null);

  const { totalQty, setIsCartOpen } = useCart();
  const { userInfo, loading: userLoading } = useUser();

  const [categoriesChildren, setCategoriesChildren] = useState([]);
  const [brandChildren, setBrandChildren] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const navRef = useRef(null);
  const router = useRouter();
  const { t } = useTranslation("common");

  // 🔥 動態多語系判斷邏輯
  const metaLang = router.locale === "zh-TW" ? "zh" : router.locale;
  const getLocalizedName = (item) => {
    return item.metadata?.[`name_${metaLang}`] || item.name;
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 語系 Cookie：以「目前網址語系」為準，不要把 /ko、/en 強制導回舊 Cookie
  useEffect(() => {
    if (!mounted) return;

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const setCookie = (name, val) => {
      document.cookie = `${name}=${val}; path=/; max-age=31536000; SameSite=Lax`;
    };

    const savedLocale = getCookie("NEXT_LOCALE");
    const currentLocale = router.locale;
    const path = router.asPath || "";

    // 網址已明確是 /ko 或 /en：更新 Cookie，不要 redirect 離開
    if (path.startsWith("/ko") || path.startsWith("/en")) {
      if (currentLocale && savedLocale !== currentLocale) {
        setCookie("NEXT_LOCALE", currentLocale);
      }
      return;
    }

    // 僅在繁中主站路徑（無前綴）且 Cookie 與目前語系不一致時，才同步一次
    if (savedLocale && savedLocale !== currentLocale) {
      router.replace(
        { pathname: router.pathname, query: router.query },
        undefined,
        { locale: savedLocale },
      );
    }
  }, [router.locale, router.pathname, router.query, router.asPath, mounted]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 搜尋下拉開啟時鎖住背景頁面滾動，避免滾輪「穿透」到頁面
  useEffect(() => {
    if (!showSearchDropdown) return;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [showSearchDropdown]);

  // 非 passive wheel：才能在邊界 preventDefault，確保清單可滾、頁面不跟滾
  useEffect(() => {
    if (!showSearchDropdown) return;
    const el = searchScrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.stopPropagation();
      if (el.scrollHeight <= el.clientHeight + 1) {
        e.preventDefault();
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [showSearchDropdown, searchResults, isSearching]);

  // 手機選單開啟：鎖背景滾動、隱藏社群浮動鈕
  useEffect(() => {
    if (!isMenuOpen) {
      document.body.classList.remove("mobile-menu-open");
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.classList.add("mobile-menu-open");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("mobile-menu-open");
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    async function fetchMenuData() {
      try {
        setLoadingCats(true);
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
        const headers = { "Content-Type": "application/json" };
        if (API_KEY) headers["x-publishable-api-key"] = API_KEY;

        const [catsRes, colRes] = await Promise.all([
          // 🔥 確保有把 rank 欄位抓回來
          fetch(
            `${BACKEND_URL}/store/product-categories?fields=id,name,handle,metadata,rank&limit=100`,
            { headers },
          ).then((res) => res.json()),
          // 🔥 把 collections 的 fields 也加上 rank，確保品牌拖拉排序正常
          fetch(
            `${BACKEND_URL}/store/collections?fields=id,title,handle,metadata,rank&limit=100`,
            { headers },
          ).then((res) => res.json()),
        ]);

        // ==========================================
        // 🔥 商品類別 (Categories) 依照 Rank 排序並保留 metadata
        // ==========================================
        let sortedCategories = catsRes.product_categories || [];
        sortedCategories.sort((a, b) => {
          const rankA = typeof a.rank === "number" ? a.rank : 999;
          const rankB = typeof b.rank === "number" ? b.rank : 999;
          if (rankA === rankB)
            return (a.name || "").localeCompare(b.name || "");
          return rankA - rankB;
        });

        setCategoriesChildren(
          sortedCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.handle,
            image: cat.metadata?.image_url || cat.metadata?.Image_url || null,
            metadata: cat.metadata || {}, // 保留 metadata 以供多語系抓取
          })),
        );

        // ==========================================
        // 🔥 精選品牌 (Collections) 依照 Metadata Rank 排序並保留 metadata
        // ==========================================
        let sortedBrands = colRes.collections || [];
        sortedBrands.sort((a, b) => {
          const rankA =
            a.metadata?.rank !== undefined ? Number(a.metadata.rank) : 999;
          const rankB =
            b.metadata?.rank !== undefined ? Number(b.metadata.rank) : 999;

          if (rankA === rankB) {
            return (a.title || "").localeCompare(b.title || "");
          }
          return rankA - rankB;
        });

        setBrandChildren(
          sortedBrands.map((col) => ({
            id: col.id,
            name: col.title,
            slug: col.handle,
            image: col.metadata?.image_url || col.metadata?.Image_url || null,
            metadata: col.metadata || {}, // 保留 metadata 以供多語系抓取
          })),
        );
      } catch (error) {
        console.error("Medusa 資料抓取失敗:", error);
      } finally {
        setLoadingCats(false);
      }
    }
    if (mounted) fetchMenuData();
  }, [mounted]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length > 1) {
        setIsSearching(true);
        setShowSearchDropdown(true);
        try {
          const backendUrl =
            process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
            "https://kesh-backend-production.up.railway.app";
          const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
          const headers = { "Content-Type": "application/json" };
          if (pubKey) headers["x-publishable-api-key"] = pubKey;
          const qLower = q.toLowerCase();

          const [productsJson, postsJson] = await Promise.all([
            fetch(
              `${backendUrl}/store/products?q=${encodeURIComponent(q)}&limit=4&fields=id,title,handle,thumbnail,metadata,*variants,*variants.prices`,
              { headers },
            )
              .then((r) => (r.ok ? r.json() : { products: [] }))
              .catch(() => ({ products: [] })),
            fetch(`${backendUrl}/store/custom/posts`, { headers })
              .then((r) => (r.ok ? r.json() : { posts: [] }))
              .catch(() => ({ posts: [] })),
          ]);

          const getProductTitle = (p) => {
            const meta = p.metadata || {};
            if (metaLang === "en" && meta.title_en?.trim()) return meta.title_en;
            if (metaLang === "ko" && meta.title_ko?.trim()) return meta.title_ko;
            return p.title || "";
          };

          const products = (productsJson.products || []).map((p) => {
            const priceObj = p.variants?.[0]?.prices?.[0];
            const amount = priceObj
              ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
              : 0;
            return {
              id: p.id,
              title: getProductTitle(p),
              slug: p.handle,
              image: p.thumbnail,
              price: amount
                ? `NT$ ${Math.round(amount).toLocaleString()}`
                : "",
            };
          });

          const getPostTitle = (post) => {
            if (metaLang === "en" && post.title_en?.trim()) return post.title_en;
            if (metaLang === "ko" && post.title_ko?.trim()) return post.title_ko;
            return post.title || "";
          };

          const pages = (postsJson.posts || [])
            .filter((post) => post.is_active !== false)
            .filter((post) => {
              const haystack = [
                post.title,
                post.title_en,
                post.title_ko,
                post.excerpt,
                post.excerpt_en,
                post.excerpt_ko,
                post.slug,
                post.seo_keywords,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return haystack.includes(qLower);
            })
            .slice(0, 4)
            .map((post) => ({
              id: post.id,
              title: getPostTitle(post),
              slug: post.slug,
              image: post.thumbnail || null,
            }));

          setSearchResults({ products, pages });
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowSearchDropdown(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, metaLang]);

  const handleSearchSubmit = (e) => {
    if ((e.key === "Enter" || e.type === "click") && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const changeLanguage = (newLocale) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.replace(
      { pathname: router.pathname, query: router.query },
      undefined,
      { locale: newLocale },
    );
    setIsLangOpen(false);
    setIsMenuOpen(false);
  };

  const handleMenuClick = (targetPath) => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`kesh_filters_${targetPath}`);
      sessionStorage.removeItem(`kesh_scroll_${targetPath}`);

      if (targetPath === "/category" || targetPath === "/category/all") {
        sessionStorage.removeItem(`kesh_filters_/category/all`);
        sessionStorage.removeItem(`kesh_scroll_/category/all`);
        sessionStorage.removeItem(`kesh_filters_/category`);
        sessionStorage.removeItem(`kesh_scroll_/category`);
      }
    }
    setOpenMega("none");
    setIsMenuOpen(false);
    setMobileExpanded(""); // 點擊後順便收起手機下拉
  };

  const navLinks = [
    {
      key: "categories",
      label: tFallback(t, "navbar.categories", "產品類別"),
      href: "/category/all",
      hasMega: true,
    },
    {
      key: "brand",
      label: tFallback(t, "navbar.brand", "品牌館"),
      href: "/category/all",
      hasMega: true,
    },
    {
      key: "authenticity",
      label: tFallback(t, "navbar.authenticity", "正品保證"),
      href: "/authenticity",
    },
    {
      key: "shipping",
      label: tFallback(t, "navbar.shipping", "全球配送"),
      href: "/shipping",
    },
    {
      key: "services",
      label: tFallback(t, "navbar.services", "精品服務"),
      href: "/services",
    },
    {
      key: "about",
      label: tFallback(t, "navbar.about", "關於凱仕"),
      href: "/about",
    },
    {
      key: "news",
      label: tFallback(t, "navbar.news", "最新消息"),
      href: "/news",
    },
    {
      key: "terms",
      label: tFallback(t, "navbar.terms", "服務條款"),
      href: "/service",
    },
    {
      key: "contact",
      label: tFallback(t, "navbar.contact", "聯繫凱仕"),
      href: "/contact",
    },
  ];

  return (
    <>
      <div
        ref={navRef}
        onMouseLeave={() => setOpenMega("none")}
        className={`font-sans text-gray-800 z-[1000] w-full transition-all duration-300 ${isScrolled ? "fixed top-0 left-0 border-b border-gray-200" : "relative"}`}
      >
        {/* Top Bar */}
        <div className="bg-[#ef4628] text-white text-[11px] md:text-xs font-medium py-2 px-4">
          <div className="max-w-[1920px] mx-auto flex justify-between items-center px-4">
            <div className="flex gap-4">
              <a
                href="tel:+886901055624"
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Phone size={14} /> +886 901-055-624
              </a>
              <a
                href="mailto:contact@kesh-de1.com"
                className="hidden sm:flex items-center gap-2 hover:opacity-80"
              >
                <Mail size={14} /> contact@kesh-de1.com
              </a>
            </div>
            <div className="flex gap-4 divide-x divide-white/30">
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 hover:opacity-80"
                >
                  <Globe size={14} /> <span>{t(`lang.${router.locale}`)}</span>{" "}
                  <ChevronRight
                    size={12}
                    className={isLangOpen ? "rotate-90" : ""}
                  />
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-[120%] right-0 mt-2 w-32 bg-white rounded-sm border border-gray-200 shadow-none overflow-hidden z-[1100]"
                    >
                      {["zh-TW", "en", "ko"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => changeLanguage(lang)}
                          className="px-4 py-3 text-left hover:bg-gray-50 hover:text-[#ef4628] transition-colors w-full border-b border-gray-50 text-gray-700"
                        >
                          {lang === "zh-TW"
                            ? "繁體中文"
                            : lang === "en"
                              ? "English"
                              : "한국어"}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden xl:flex pl-4 gap-3 min-w-[120px] justify-end items-center">
                {mounted && !userLoading ? (
                  userInfo ? (
                    <Link
                      href="/member"
                      className="hover:opacity-80 flex items-center gap-2 group"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden relative border border-white/20 group-hover:border-white/50 transition-colors bg-white/10 flex items-center justify-center">
                        {userInfo.avatar ? (
                          <Image
                            src={userInfo.avatar}
                            alt={userInfo.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <User size={14} className="text-white/80" />
                        )}
                      </div>
                      Hi, <span className="font-bold">{userInfo.name}</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="hover:opacity-80 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"
                    >
                      <User size={14} /> Login / Register
                    </Link>
                  )
                ) : (
                  <span className="opacity-50 flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div
          className={`bg-white border-b border-gray-100 w-full transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}
        >
          <div className="max-w-[1920px] mx-auto px-6 md:px-10 flex justify-between items-center relative">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="xl:hidden p-2 -ml-2 text-gray-800 hover:text-[#ef4628] transition-colors"
            >
              <Menu size={24} />
            </button>

            <Link
              href="/"
              className="text-2xl font-bold tracking-widest absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0"
            >
              KÉSH<span className="text-[#ef4628]">.</span>
            </Link>

            <nav className="hidden xl:flex gap-8 items-center h-full">
              {navLinks.map((link) => (
                <div
                  key={link.key}
                  className="relative group py-4"
                  onMouseEnter={() =>
                    setOpenMega(link.hasMega ? link.key : "none")
                  }
                >
                  <Link
                    href={link.href}
                    onClick={() => handleMenuClick(link.href)}
                    className="text-[13px] font-bold tracking-widest hover:text-[#ef4628] uppercase transition-colors"
                  >
                    {link.label}
                  </Link>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#ef4628] transition-transform origin-left ${openMega === link.key ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  />
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* 🔍 搜尋欄區塊 */}
              <div
                className="hidden xl:block relative"
                ref={searchContainerRef}
              >
                <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-200 shadow-none focus-within:border-gray-400 transition-colors">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    onFocus={() => {
                      if (searchQuery.trim().length > 1) {
                        setShowSearchDropdown(true);
                      }
                    }}
                    placeholder={t("navbar.search") || "搜尋..."}
                    className="bg-transparent text-sm w-40 outline-none border-none ring-0 shadow-none p-0 focus:ring-0 focus:outline-none"
                  />
                  <Search
                    size={16}
                    className="text-gray-400 cursor-pointer hover:text-[#ef4628]"
                    onClick={handleSearchSubmit}
                  />
                </div>

                {/* 🔥 搜尋下拉選單介面 */}
                <AnimatePresence>
                  {showSearchDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-3 w-[360px] bg-white border border-gray-200 shadow-none rounded-md z-[1100] flex flex-col max-h-[min(70vh,520px)] overflow-hidden"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {isSearching ? (
                        <div className="flex items-center justify-center p-8 text-gray-400">
                          <Loader2 size={24} className="animate-spin" />
                        </div>
                      ) : searchResults.products.length === 0 &&
                        searchResults.pages.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">
                          {tFallback(
                            t,
                            "search_page.dropdown_empty",
                            '找不到與 "{{query}}" 相關的結果',
                          ).replace("{{query}}", searchQuery)}
                        </div>
                      ) : (
                        <>
                          <div
                            ref={searchScrollRef}
                            className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
                          >
                            {searchResults.products.length > 0 && (
                              <div className="p-2">
                                {searchResults.products.map((product) => (
                                  <Link
                                    href={`/product/${product.slug}`}
                                    key={product.id}
                                    onClick={() => setShowSearchDropdown(false)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors group"
                                  >
                                    <div className="w-12 h-12 bg-gray-100 rounded-sm overflow-hidden relative flex-shrink-0">
                                      {product.image ? (
                                        <Image
                                          src={product.image}
                                          alt={product.title}
                                          fill
                                          className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                      ) : (
                                        <span className="flex items-center justify-center w-full h-full text-[8px] text-gray-400">
                                          No Img
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="inline-block mb-1 text-[10px] font-bold tracking-[0.12em] px-1.5 py-0.5 border border-gray-300 text-gray-700 bg-white">
                                        {tFallback(
                                          t,
                                          "search_page.tag_product",
                                          "產品",
                                        )}
                                      </span>
                                      <p className="text-sm font-medium text-black truncate group-hover:text-[#ef4628] transition-colors">
                                        {product.title}
                                      </p>
                                      {product.price ? (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {product.price}
                                        </p>
                                      ) : null}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}

                            {searchResults.pages.length > 0 && (
                              <div
                                className={`p-2 ${searchResults.products.length > 0 ? "border-t border-gray-100" : ""}`}
                              >
                                {searchResults.pages.map((page) => (
                                  <Link
                                    href={`/news/${page.slug}`}
                                    key={page.id}
                                    onClick={() => setShowSearchDropdown(false)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors group"
                                  >
                                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-sm overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                                      {page.image ? (
                                        <Image
                                          src={page.image}
                                          alt={page.title}
                                          fill
                                          className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                      ) : (
                                        <FileText
                                          size={16}
                                          className="text-gray-400 group-hover:text-[#ef4628] transition-colors"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="inline-block mb-1 text-[10px] font-bold tracking-[0.12em] px-1.5 py-0.5 border border-[#ef4628]/40 text-[#ef4628] bg-[#ef4628]/5">
                                        {tFallback(
                                          t,
                                          "search_page.tag_article",
                                          "文章",
                                        )}
                                      </span>
                                      <p className="text-sm font-medium text-black truncate group-hover:text-[#ef4628] transition-colors">
                                        {page.title}
                                      </p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 p-2 bg-gray-50 border-t border-gray-200">
                            <button
                              onClick={handleSearchSubmit}
                              className="w-full text-center py-2 text-xs font-bold tracking-widest text-[#ef4628] hover:text-black transition-colors"
                            >
                              {tFallback(
                                t,
                                "search_page.view_all",
                                "查看全部結果",
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 group"
              >
                <ShoppingBag
                  size={22}
                  className="group-hover:text-[#ef4628] transition-colors"
                />
                {totalQty > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ef4628] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalQty}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        <AnimatePresence>
          {openMega !== "none" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 w-full bg-white border-t border-b border-gray-200 shadow-none z-50 hidden xl:block"
            >
              <div className="max-w-[1920px] mx-auto px-6 md:px-10 py-10">
                {loadingCats ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 size={32} className="animate-spin text-gray-300" />
                  </div>
                ) : (
                  <div className="w-full">
                    {openMega === "categories" && (
                      <div className="w-full mx-auto max-w-[1920px] lg:w-[80%]">
                        <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-8">
                          <h3 className="text-sm font-bold tracking-widest uppercase text-gray-900">
                            {t("mega.categories") || "產品類別"}
                          </h3>
                          <Link
                            href="/category/all"
                            onClick={() => handleMenuClick("/category/all")}
                            className="text-xs text-gray-500 hover:text-[#ef4628] uppercase tracking-widest"
                          >
                            {t("mega.view_all") || "查看全部"} &rarr;
                          </Link>
                        </div>
                        <ul className="flex flex-wrap gap-8 md:gap-12">
                          {categoriesChildren.map((cat) => (
                            <li key={cat.id} className="group cursor-pointer">
                              <Link
                                href={`/category/${cat.slug}`}
                                onClick={() =>
                                  handleMenuClick(`/category/${cat.slug}`)
                                }
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 shadow-none group-hover:border-[#ef4628] transition-colors relative">
                                  {cat.image ? (
                                    <Image
                                      src={cat.image}
                                      alt={cat.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      unoptimized
                                    />
                                  ) : (
                                    <span className="text-[10px] text-gray-400">
                                      KÉSH
                                    </span>
                                  )}
                                </div>
                                {/* 🔥 電腦版：渲染翻譯後的產品類別名稱 */}
                                <span className="text-sm font-bold tracking-widest text-gray-700 group-hover:text-[#ef4628] transition-colors text-center uppercase">
                                  {getLocalizedName(cat)}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {openMega === "brand" && (
                      <div className="w-full mx-auto max-w-[1920px] lg:w-[80%]">
                        <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-8">
                          <h3 className="text-sm font-bold tracking-widest uppercase text-gray-900">
                            {t("mega.brands") || "精選品牌"}
                          </h3>
                          <Link
                            href="/category/all"
                            onClick={() => handleMenuClick("/category/all")}
                            className="text-xs text-gray-500 hover:text-[#ef4628] uppercase tracking-widest"
                          >
                            {t("mega.view_all") || "查看全部"} &rarr;
                          </Link>
                        </div>
                        <ul className="flex flex-wrap gap-8 md:gap-12">
                          {brandChildren.map((brand) => (
                            <li key={brand.id} className="group cursor-pointer">
                              <Link
                                href={`/category/${brand.slug}`}
                                onClick={() =>
                                  handleMenuClick(`/category/${brand.slug}`)
                                }
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 shadow-none group-hover:border-[#ef4628] transition-colors relative">
                                  {brand.image ? (
                                    <Image
                                      src={brand.image}
                                      alt={brand.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      unoptimized
                                    />
                                  ) : (
                                    <span className="text-[10px] text-gray-400 uppercase">
                                      {brand.name.substring(0, 2)}
                                    </span>
                                  )}
                                </div>
                                {/* 🔥 電腦版：渲染翻譯後的精選品牌名稱 */}
                                <span className="text-sm font-bold tracking-widest text-gray-700 group-hover:text-[#ef4628] transition-colors text-center uppercase">
                                  {getLocalizedName(brand)}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 手機版側邊滑出選單（z 需高於社群浮動按鈕） */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-[5000] xl:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 w-[85%] max-w-[320px] h-[100dvh] max-h-[100dvh] bg-white border-r border-gray-200 shadow-none z-[5001] xl:hidden flex flex-col"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                <span className="text-xl font-bold tracking-widest">
                  KÉSH<span className="text-[#ef4628]">.</span>
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 -mr-2 text-gray-500 hover:text-black"
                >
                  <X size={24} />
                </button>
              </div>

              {/* 手機版搜尋 */}
              <div className="p-6 border-b border-gray-100 shrink-0">
                <div className="flex items-center bg-white px-4 py-3 rounded-full border border-gray-200 shadow-none focus-within:border-gray-400 transition-colors">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        router.push(
                          `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                        );
                        setIsMenuOpen(false);
                      }
                    }}
                    placeholder={t("navbar.search") || "搜尋..."}
                    className="bg-transparent text-sm w-full outline-none border-none ring-0 shadow-none p-0 focus:ring-0"
                  />
                </div>
              </div>

              {/* min-h-0 才能讓 flex 子層正確 overflow 滾到底 */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-6 space-y-6 pb-8">
                {navLinks.map((link) => (
                  <div key={link.key}>
                    {link.hasMega ? (
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            setMobileExpanded(
                              mobileExpanded === link.key ? "" : link.key,
                            )
                          }
                          className="flex justify-between items-center w-full text-sm font-bold tracking-widest uppercase hover:text-[#ef4628] transition-colors"
                        >
                          {link.label}
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform ${
                              mobileExpanded === link.key ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === link.key && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 pb-2 pl-4 flex flex-col gap-4 border-l-2 border-gray-100 ml-2 mt-2">
                                <Link
                                  href={link.href}
                                  onClick={() => handleMenuClick(link.href)}
                                  className="text-xs font-bold text-gray-400 hover:text-[#ef4628] uppercase tracking-widest"
                                >
                                  {t("mega.view_all") || "查看全部"} &rarr;
                                </Link>
                                {(link.key === "categories"
                                  ? categoriesChildren
                                  : brandChildren
                                ).map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/category/${child.slug}`}
                                    onClick={() =>
                                      handleMenuClick(`/category/${child.slug}`)
                                    }
                                    className="text-[13px] font-medium text-gray-600 hover:text-[#ef4628] uppercase tracking-wider"
                                  >
                                    {getLocalizedName(child)}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => handleMenuClick(link.href)}
                        className="block text-sm font-bold tracking-widest uppercase hover:text-[#ef4628] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}

                <div className="pt-6 mt-2 border-t border-gray-100 space-y-4">
                  <Link
                    href={userInfo ? "/member" : "/login"}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-[#ef4628]"
                  >
                    <User size={18} />
                    {userInfo ? `Hi, ${userInfo.name}` : "Login / Register"}
                  </Link>
                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => changeLanguage("zh-TW")}
                      className={`text-xs ${router.locale === "zh-TW" ? "font-bold text-[#ef4628]" : "text-gray-500"}`}
                    >
                      繁
                    </button>
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`text-xs ${router.locale === "en" ? "font-bold text-[#ef4628]" : "text-gray-500"}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => changeLanguage("ko")}
                      className={`text-xs ${router.locale === "ko" ? "font-bold text-[#ef4628]" : "text-gray-500"}`}
                    >
                      KR
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SlideTabsExample;
