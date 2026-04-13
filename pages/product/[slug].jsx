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
} from "lucide-react";

import HeroSlider from "../../components/HeroSlider";

// --- 共用商品卡片組件 ---
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
      className="group relative flex flex-col bg-white border border-gray-100 hover:border-gray-300 transition-colors h-full"
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
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="text-[10px] font-bold text-gray-500 border border-gray-400 px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm">
            {product.status}
          </span>
        </div>
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `url('${product.image || "/images/placeholder.jpg"}')`,
            transform: isHovered ? "scale(1.15)" : "scale(1)",
            transformOrigin: `${cursorPos.x}% ${cursorPos.y}%`,
          }}
        ></div>
      </div>
      <div className="p-4 bg-white mt-auto flex flex-col gap-1">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
          {product.brand}
        </div>
        <h2 className="text-[13px] font-medium text-gray-900 leading-snug tracking-wide group-hover:text-[#ef4628] transition-colors line-clamp-2">
          {product.title}
        </h2>
        <div className="mt-2 flex items-center justify-between pt-2">
          <p className="text-[14px] font-bold text-black tracking-wide">
            {product.price}
          </p>
        </div>
      </div>
    </Link>
  );
};

// --- 通用摺疊組件 ---
const GenericAccordion = ({
  title,
  children,
  icon: Icon,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
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
            <div className="pt-4 text-[13px] text-gray-500 leading-relaxed font-medium">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- FAQ 摺疊組件 ---
const FAQAccordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group focus:outline-none"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#ef4628] group-hover:text-black transition-colors">
          {question}
        </span>
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
            <p className="pt-3 text-[12px] text-gray-500 leading-relaxed">
              {answer}
            </p>
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

  const pdT = t("product_detail", { returnObjects: true }) || {};
  const ui = pdT.ui || {};

  const defaultFaqs = [
    {
      q: "ABOUT BRANDS",
      a: "We specialize in international luxury brands such as Hermès, Chanel, Louis Vuitton, and Dior.",
    },
    {
      q: "PAYMENT & SECURITY",
      a: "We support multiple payment methods including VISA, MasterCard, JCB, Apple Pay, and PayPal.",
    },
    {
      q: "SHIPPING & FEES",
      a: "Standard delivery fee is NT$80. We strongly recommend insured courier delivery for luxury items.",
    },
  ];

  const faqsToDisplay =
    Array.isArray(pdT.faqs) && pdT.faqs.length > 0 ? pdT.faqs : defaultFaqs;

  if (router.isFallback || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold tracking-widest uppercase text-gray-500">
        Loading Product...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${product.title} | ${product.brand} | KÉSH de¹`}</title>
        <meta name="description" content={product.shortDescPlain} />
      </Head>

      <main className="bg-white text-black min-h-screen pt-24 md:pt-32 pb-0">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
            {/* 左側圖片 */}
            <div className="w-full md:w-[55%] lg:w-[60%] md:sticky md:top-32 z-10">
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
                className="w-full aspect-[4/5] bg-gray-50 mb-4 rounded-sm"
              >
                {product.images?.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={product.title}
                        fill
                        className="object-cover"
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

            {/* 右側資訊 */}
            <div className="w-full md:w-[45%] lg:w-[40%] pb-10">
              <div className="mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {product.brand}
                  </span>
                  <span className="bg-black text-white text-[10px] px-2 py-1 font-bold">
                    {product.specs.rank}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-medium mb-3">
                  {product.title}
                </h1>
                <p className="text-2xl font-bold tracking-tight text-black">
                  {product.price}
                </p>
              </div>

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

              {product.productCondition && (
                <GenericAccordion
                  title={ui.condition_title || "ITEM CONDITION"}
                  icon={CheckCircle2}
                  isOpenDefault={true}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.productCondition,
                    }}
                  />
                </GenericAccordion>
              )}
              {product.description && (
                <GenericAccordion
                  title={ui.details_title || "PRODUCT DETAILS"}
                  isOpenDefault={true}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </GenericAccordion>
              )}

              <div className="pt-8 mt-4 border-t border-gray-200">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info size={14} className="text-[#ef4628]" />
                  {ui.faq_title || "SHOPPING GUIDE & FAQ"}
                </h3>
                {faqsToDisplay.map((faq, idx) => (
                  <FAQAccordion key={idx} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 mt-20 pt-10 border-t border-gray-200">
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
          <div className="min-h-[400px]">
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
      (locales || ["zh-TW"]).forEach((l) =>
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

  // 決定幣值
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

    // 🔥 終極完美修正：明確列出所有需要的欄位，絕對不讓 API 報錯
    const apiUrl = `${BACKEND_URL}/store/products?handle=${slug}&fields=id,handle,title,description,thumbnail,metadata,*images,*collection,*variants,*variants.prices`;

    const res = await fetch(apiUrl, { headers });
    const data = await res.json();

    // 🛡️ 除錯機制：如果 API 還是有問題，會印在終端機讓您看到
    if (!res.ok) {
      console.error("Medusa API 錯誤:", data);
    }

    const rawProduct = data.products?.[0];

    if (!rawProduct) return { notFound: true };

    // 💰 價格邏輯
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

    // 🌍 多語系內容切換邏輯
    const isEn = currentLang === "en";
    const isKo = currentLang === "ko" || currentLang === "kr";

    const localizedTitle = isEn
      ? rawProduct.metadata?.title_en || rawProduct.title
      : isKo
        ? rawProduct.metadata?.title_ko || rawProduct.title
        : rawProduct.title;

    const localizedDesc = isEn
      ? rawProduct.metadata?.description_en || rawProduct.description
      : isKo
        ? rawProduct.metadata?.description_ko || rawProduct.description
        : rawProduct.description;

    const localizedCondition = isEn
      ? rawProduct.metadata?.condition_en ||
        rawProduct.metadata?.product_condition
      : isKo
        ? rawProduct.metadata?.condition_ko ||
          rawProduct.metadata?.product_condition
        : rawProduct.metadata?.product_condition;

    const product = {
      id: rawProduct.id || "",
      slug: rawProduct.handle || slug,
      title: localizedTitle || "",
      price: `${symbol}${Math.round(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      rawPrice: amount,
      variantId: rawProduct.variants?.[0]?.id || null,
      brand: rawProduct.collection?.title || "KÉSH de¹ Select",
      description: localizedDesc || "",
      productCondition: localizedCondition || "",
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
