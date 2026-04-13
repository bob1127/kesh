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
  Loader2,
  X,
} from "lucide-react";

import { useCart } from "../../components/context/CartContext";
import { useTranslation } from "next-i18next";
import { medusa } from "@/lib/medusa";
import { useUser } from "../../components/context/UserContext";

export const SlideTabsExample = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState("none");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({
    products: [],
    pages: [],
  });
  const searchContainerRef = useRef(null);

  const { totalQty, setIsCartOpen } = useCart();
  const { userInfo, loading: userLoading } = useUser();

  const [categoriesChildren, setCategoriesChildren] = useState([]);
  const [brandChildren, setBrandChildren] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const navRef = useRef(null);
  const router = useRouter();
  const { t } = useTranslation("common");

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          fetch(
            `${BACKEND_URL}/store/product-categories?fields=id,name,handle,metadata&limit=100`,
            { headers },
          ).then((res) => res.json()),
          fetch(
            `${BACKEND_URL}/store/collections?fields=id,title,handle,metadata&limit=100`,
            { headers },
          ).then((res) => res.json()),
        ]);

        setCategoriesChildren(
          (catsRes.product_categories || []).map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.handle,
            image: cat.metadata?.image_url || cat.metadata?.Image_url || null,
          })),
        );

        setBrandChildren(
          (colRes.collections || []).map((col) => ({
            id: col.id,
            name: col.title,
            slug: col.handle,
            image: col.metadata?.image_url || col.metadata?.Image_url || null,
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
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowSearchDropdown(true);
        try {
          const { products } = await medusa.products.list({
            q: searchQuery,
            limit: 5,
          });
          setSearchResults((prev) => ({
            ...prev,
            products: products.map((p) => ({
              id: p.id,
              title: p.title,
              slug: p.handle,
              image: p.thumbnail,
              price: p.variants?.[0]?.prices?.[0]
                ? `${(p.variants[0].prices[0].amount / 100).toLocaleString()} TWD`
                : "TBA",
            })),
          }));
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
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if ((e.key === "Enter" || e.type === "click") && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery("");
    }
  };

  const changeLanguage = (newLocale) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(router.pathname, router.asPath, { locale: newLocale });
    setIsLangOpen(false);
  };

  const navLinks = [
    {
      key: "categories",
      label: t("navbar.categories") || "產品類別",
      href: "/category",
      hasMega: true,
    },
    {
      key: "brand",
      label: t("navbar.brand") || "品牌館",
      href: "/category",
      hasMega: true,
    },
    {
      key: "AUTHENTICITY",
      label: t("navbar.authenticity") || "正品保證",
      href: "/authenticity",
    },
    {
      key: "SHIPPING",
      label: t("navbar.shipping") || "全球配送",
      href: "/shipping",
    },
    { key: "news", label: t("navbar.news") || "最新消息", href: "/news" },
    {
      key: "CONTACT",
      label: t("navbar.contact") || "聯繫凱仕",
      href: "/contact",
    },
  ];

  return (
    <>
      <div
        ref={navRef}
        onMouseLeave={() => setOpenMega("none")}
        className={`font-sans text-gray-800 z-[1000] w-full transition-all duration-300 ${isScrolled ? "fixed top-0 left-0 shadow-md" : "relative"}`}
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
                      className="absolute top-[120%] right-0 mt-2 w-32 bg-white rounded-sm shadow-xl border border-gray-100 overflow-hidden z-[1100]"
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
              <div className="hidden md:flex pl-4 gap-3 min-w-[120px] justify-end items-center">
                {mounted && !userLoading ? (
                  userInfo ? (
                    /* 🔥 修正：已登入時顯示會員姓名與頭像 */
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
                    /* 🔥 修正：未登入時明確顯示 Login / Register */
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
            {/* 🔥 漢堡按鈕 (開啟 Mobile Menu) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-800 hover:text-[#ef4628] transition-colors"
            >
              <Menu size={24} />
            </button>

            <Link
              href="/"
              className="text-2xl font-bold tracking-widest absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
            >
              KÉSH<span className="text-[#ef4628]">.</span>
            </Link>

            <nav className="hidden md:flex gap-8 items-center h-full">
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
              {/* 🔥 去除黑框的搜尋欄 */}
              <div
                className="hidden lg:block relative"
                ref={searchContainerRef}
              >
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full border-none focus-within:ring-1 focus-within:ring-gray-200 transition-all">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    placeholder={t("navbar.search") || "搜尋..."}
                    className="bg-transparent text-sm w-40 outline-none border-none ring-0 p-0 focus:ring-0"
                  />
                  <Search
                    size={16}
                    className="text-gray-400 cursor-pointer hover:text-[#ef4628]"
                    onClick={handleSearchSubmit}
                  />
                </div>
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
              className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl z-50 hidden md:block"
            >
              {/* ... (Mega Menu 內容保持不變) ... */}
              <div className="max-w-[1920px] mx-auto px-6 md:px-10 py-10">
                {loadingCats ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 size={32} className="animate-spin text-gray-300" />
                  </div>
                ) : (
                  <div className="w-full">
                    {openMega === "categories" && (
                      <div className="w-full">
                        <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-8">
                          <h3 className="text-sm font-bold tracking-widest uppercase text-gray-900">
                            {t("mega.categories") || "產品類別"}
                          </h3>
                          <Link
                            href="/category"
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
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:border-[#ef4628] transition-colors relative">
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
                                <span className="text-sm font-bold tracking-widest text-gray-700 group-hover:text-[#ef4628] transition-colors text-center uppercase">
                                  {cat.name}
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
                            href="/category"
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
                                className="flex flex-col items-center gap-3"
                              >
                                <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:border-[#ef4628] transition-colors relative">
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
                                <span className="text-sm font-bold tracking-widest text-gray-700 group-hover:text-[#ef4628] transition-colors text-center uppercase">
                                  {brand.name}
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

      {/* 🔥 手機版側邊滑出選單 (Mobile Sidebar) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-[1001] md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 w-[85%] max-w-[320px] h-full bg-white shadow-2xl z-[1002] md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
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
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center bg-gray-50 px-4 py-3 rounded-full border-none focus-within:ring-1 focus-within:ring-gray-200">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit(e);
                        setIsMenuOpen(false);
                      }
                    }}
                    placeholder="Search products..."
                    className="bg-transparent text-sm w-full outline-none border-none ring-0 p-0"
                  />
                </div>
              </div>

              {/* 導覽連結 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {navLinks.map((link) => (
                  <div key={link.key}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-sm font-bold tracking-widest uppercase hover:text-[#ef4628] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </div>
                ))}
              </div>

              {/* 手機版會員與語系底欄 */}
              <div className="p-6 bg-gray-50 mt-auto space-y-4">
                {/* 🔥 修正：手機版的登入狀態判斷 */}
                <Link
                  href={userInfo ? "/member" : "/login"}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-[#ef4628]"
                >
                  <User size={18} />
                  {userInfo ? `Hi, ${userInfo.name}` : "Login / Register"}
                </Link>
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      changeLanguage("zh-TW");
                      setIsMenuOpen(false);
                    }}
                    className={`text-xs ${router.locale === "zh-TW" ? "font-bold text-[#ef4628]" : "text-gray-500"}`}
                  >
                    繁
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage("en");
                      setIsMenuOpen(false);
                    }}
                    className={`text-xs ${router.locale === "en" ? "font-bold text-[#ef4628]" : "text-gray-500"}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage("ko");
                      setIsMenuOpen(false);
                    }}
                    className={`text-xs ${router.locale === "ko" ? "font-bold text-[#ef4628]" : "text-gray-500"}`}
                  >
                    KR
                  </button>
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
