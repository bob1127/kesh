"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// 引入 Swiper 相關模組
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { useCart } from "@/components/context/CartContext";
import {
  Star,
  ChevronDown,
  Plus,
  Minus,
  Info,
  CheckCircle2,
  CreditCard,
  Truck,
  HelpCircle,
  ZoomIn, // 🔥 新增放大鏡 Icon
  ZoomOut, // 🔥 新增縮小鏡 Icon
} from "lucide-react";

import HeroSlider from "../../components/HeroSlider";

// --- 通用摺疊組件 ---
const GenericAccordion = ({
  title,
  children,
  icon: Icon,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  if (!children) return null;

  return (
    <div className="border-b border-gray-200 py-5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group focus:outline-none"
      >
        <h3 className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-[#ef4628] transition-colors">
          {Icon && <Icon size={16} className="text-[#ef4628]" />}
          {title}
        </h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={14} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-[14.5px] text-stone-700 tracking-wide leading-[25px] font-medium whitespace-pre-wrap">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductDetail({ product, relatedProducts = [] }) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState("features");

  // 🔥 放大鏡專屬 State
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // 滑鼠移動時追蹤座標，只有在開啟放大鏡時才運作
  const handleMouseMove = (e) => {
    if (!isZoomEnabled) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCursorPos({ x, y });
  };

  const pdT = t("product_detail", { returnObjects: true }) || {};
  const ui = pdT.ui || {};

  useEffect(() => {
    if (product) {
      console.log("=== 🐞 [除錯] 當前頁面商品資料 ===", product);
      console.log("👉 提取到的重量為:", product.weight, "g");
    }
  }, [product]);

  if (router.isFallback || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold tracking-widest uppercase text-gray-500">
        Loading Product...
      </div>
    );
  }

  const isEn = router.locale === "en";
  const isKo = router.locale === "ko";
  const tCondition = isEn ? "Condition" : isKo ? "상태" : "商品狀況";
  const tPayment = isEn ? "Payment Methods" : isKo ? "결제 수단" : "付款方式";
  const tShipping = isEn ? "Shipping Info" : isKo ? "배송 안내" : "配送說明";
  const tFAQ = isEn ? "FAQ" : isKo ? "자주 묻는 질문" : "常見問題";
  const tDetails = isEn ? "Product Details" : isKo ? "상품 상세" : "商品詳情";

  return (
    <>
      <Head>
        <title>{`${product.title} | ${product.brand} | KÉSH de¹`}</title>
        <meta name="description" content={product.title} />
      </Head>

      <main className="bg-white text-black min-h-screen pt-5 md:pt-14 pb-0">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
            {/* ================= 左側：圖片區 ================= */}
            <div className="w-full md:w-[55%] lg:w-[55%] 2xl:w-[50%] md:sticky md:top-32 z-10 relative">
              {/* 🔥 右上角：放大鏡開關按鈕 */}
              <button
                onClick={() => setIsZoomEnabled(!isZoomEnabled)}
                className={`absolute top-4 right-4 z-20 p-2.5 rounded-full shadow-md transition-all duration-300 ${
                  isZoomEnabled
                    ? "bg-[#ef4628] text-white hover:bg-red-700"
                    : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-black hover:scale-105"
                }`}
                title={isZoomEnabled ? "關閉放大鏡" : "開啟放大鏡"}
              >
                {isZoomEnabled ? (
                  <ZoomOut size={20} strokeWidth={2.5} />
                ) : (
                  <ZoomIn size={20} strokeWidth={2.5} />
                )}
              </button>

              <Swiper
                spaceBetween={10}
                navigation={true}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="w-full aspect-[4/4] bg-gray-50 mb-4 rounded-sm"
              >
                {product.images?.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    {/* 🔥 圖片外框，加入滑鼠事件與動態 cursor */}
                    <div
                      className={`relative w-full h-full overflow-hidden ${isZoomEnabled ? "cursor-crosshair" : "cursor-default"}`}
                      onMouseEnter={() => isZoomEnabled && setIsHovered(true)}
                      onMouseLeave={() => {
                        setIsHovered(false);
                        setCursorPos({ x: 50, y: 50 });
                      }}
                      onMouseMove={handleMouseMove}
                    >
                      <Image
                        src={img}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-200 ease-out"
                        style={{
                          transform:
                            isHovered && isZoomEnabled
                              ? "scale(2.5)"
                              : "scale(1)",
                          transformOrigin: `${cursorPos.x}% ${cursorPos.y}%`,
                        }}
                        priority={idx === 0}
                        unoptimized
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="w-full h-24 md:h-28 thumb-swiper"
              >
                {product.images?.map((img, idx) => (
                  <SwiperSlide
                    key={idx}
                    className="cursor-pointer opacity-50 [&.swiper-slide-thumb-active]:opacity-100"
                  >
                    <div className="relative w-full h-full border border-transparent bg-white">
                      <Image
                        src={img}
                        alt="thumb"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* ================= 右側：商品資訊區 ================= */}
            <div className="w-full md:w-[45%] lg:w-[45%] 2xl:w-[50%] pb-10">
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {product.brand}
                  </span>
                  <span className="bg-black text-white text-[10px] px-2 py-1 font-bold">
                    {product.specs.rank}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl !leading-[40px] tracking-wide font-medium mb-3">
                  {product.title}
                </h1>

                {product.subtitle && (
                  <p className="text-[13px] text-gray-500 mb-4">
                    {product.subtitle}
                  </p>
                )}

                <p className="text-2xl font-bold tracking-tight text-black">
                  {product.price}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Weight: {product.weight}g
                </p>
              </div>

              {product.condition && (
                <div className="flex sm:flex-row flex-col items-start sm:items-center justify-between py-4 border-b border-gray-100 mb-6">
                  <span className="text-[13px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#ef4628]" />
                    {tCondition}
                  </span>
                  <span className="text-[13px] mt-3 text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-sm font-medium">
                    {product.condition}
                  </span>
                </div>
              )}

              {/* 購買按鈕 */}
              <div className="mb-10 space-y-4">
                <div className="flex gap-4">
                  <div className="flex border border-gray-300 w-28 justify-between items-center px-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="py-3 px-2 text-gray-400"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="py-3 px-2 text-gray-400"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 bg-[#ef4628] text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95"
                  >
                    {ui.btn_buy || "加入購物車"}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200">
                <GenericAccordion
                  title={tDetails}
                  icon={Info}
                  isOpenDefault={true}
                >
                  {product.description}
                </GenericAccordion>
                <GenericAccordion title={tPayment} icon={CreditCard}>
                  {product.paymentInfo}
                </GenericAccordion>
                <GenericAccordion title={tShipping} icon={Truck}>
                  {product.shippingInfo}
                </GenericAccordion>
                <GenericAccordion title={tFAQ} icon={HelpCircle}>
                  {product.faqInfo}
                </GenericAccordion>
              </div>
            </div>
          </div>
        </div>

        {/* 下方 Tabs */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-10">
          <div className="flex justify-center gap-8 md:gap-16 border-b border-gray-200 mb-10">
            <button
              onClick={() => setActiveTab("features")}
              className={`pb-4 text-sm font-bold uppercase tracking-widest relative ${activeTab === "features" ? "text-black" : "text-gray-400"}`}
            >
              {ui.tab_features || "產品特色"}
              {activeTab === "features" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-black"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-4 text-sm font-bold uppercase tracking-widest relative ${activeTab === "shipping" ? "text-black" : "text-gray-400"}`}
            >
              {ui.tab_shipping || "退換貨及運送須知"}
              {activeTab === "shipping" && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-black"
                />
              )}
            </button>
          </div>
          <div className="min-h-[400px] pb-20">
            <AnimatePresence mode="wait">
              {activeTab === "features" && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <HeroSlider
                    carouselSlides={[
                      {
                        title: "嚴選品質保證",
                        image:
                          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_7.jpg",
                      },
                      {
                        title: "支援專業真品鑑定",
                        image:
                          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_8.jpg",
                      },
                    ]}
                  />
                </motion.div>
              )}
              {activeTab === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-4xl mx-auto text-[14px] leading-8"
                >
                  <h3 className="font-bold mb-3">運送方式：門市自取</h3>
                  <p>請於下單後前往台中中清路門市領取。</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths({ locales }) {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
  if (!BACKEND_URL || !API_KEY) return { paths: [], fallback: "blocking" };

  try {
    const res = await fetch(`${BACKEND_URL}/store/products?limit=100`, {
      headers: { "x-publishable-api-key": API_KEY },
    });
    const data = await res.json();
    const paths = [];
    (data.products || []).forEach((p) => {
      (locales || ["zh-TW", "en", "ko"]).forEach((l) =>
        paths.push({ params: { slug: p.handle }, locale: l }),
      );
    });
    return { paths, fallback: "blocking" };
  } catch (e) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params, locale }) {
  const { slug } = params;
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

    const apiUrl = `${BACKEND_URL}/store/products?handle=${slug}&fields=id,handle,title,description,thumbnail,weight,metadata,*images,*collection,*variants,*variants.prices`;

    const res = await fetch(apiUrl, fetchOptions);
    const data = await res.json();

    if (!res.ok) console.error("Medusa API 錯誤:", data);

    const rawProduct = data.products?.[0];
    if (!rawProduct) return { notFound: true };

    const variantPrices = rawProduct.variants?.[0]?.prices || [];
    let priceObj =
      variantPrices.find(
        (p) => p.currency_code?.toLowerCase() === targetCurrency,
      ) || variantPrices[0];
    let amount = priceObj
      ? priceObj.amount > 1000000
        ? priceObj.amount / 100
        : priceObj.amount
      : 0;

    const productWeight =
      rawProduct.variants?.[0]?.weight || rawProduct.weight || 0;
    const metaLang = currentLang === "zh-TW" ? "zh" : currentLang;

    const localizedTitle =
      rawProduct.metadata?.[`title_${metaLang}`] || rawProduct.title;
    const localizedSubtitle =
      rawProduct.metadata?.[`subtitle_${metaLang}`] ||
      rawProduct.subtitle ||
      "";
    const localizedDesc =
      rawProduct.metadata?.[`desc_${metaLang}`] || rawProduct.description;

    const product = {
      id: rawProduct.id || "",
      slug: rawProduct.handle || slug,
      title: localizedTitle || "",
      subtitle: localizedSubtitle,
      price: `${symbol}${Math.round(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      rawPrice: amount,
      variantId: rawProduct.variants?.[0]?.id || null,
      brand: rawProduct.collection?.title || "KÉSH de¹ Select",
      weight: productWeight,
      description: localizedDesc || "",
      condition:
        rawProduct.metadata?.[`condition_${metaLang}`] ||
        rawProduct.metadata?.condition_zh ||
        "",
      paymentInfo:
        rawProduct.metadata?.[`payment_${metaLang}`] ||
        rawProduct.metadata?.payment_zh ||
        "",
      shippingInfo:
        rawProduct.metadata?.[`shipping_${metaLang}`] ||
        rawProduct.metadata?.shipping_zh ||
        "",
      faqInfo:
        rawProduct.metadata?.[`faq_${metaLang}`] ||
        rawProduct.metadata?.faq_zh ||
        "",
      images:
        rawProduct.images?.map((img) => img.url) ||
        [rawProduct.thumbnail].filter(Boolean),
      specs: { rank: rawProduct.metadata?.rank || "Rank S" },
    };

    return {
      props: {
        product,
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
      revalidate: 60,
    };
  } catch (e) {
    console.error("Error in getStaticProps:", e);
    return { notFound: true };
  }
}
