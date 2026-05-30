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
  buildProductSeoTitle,
  buildProductSeoDescription,
  buildProductSeoKeywords,
} from "@/lib/product-seo";
import { buildMerchantOfferSchema } from "@/lib/product-offer-schema";
import { getSchemaBrand, getSchemaBreadcrumbLabels } from "@/lib/schema-i18n";
import {
  resolveSchemaImage,
  resolveSchemaImages,
} from "@/lib/schema-images";
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
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import HeroSlider from "../../components/HeroSlider";
// 🔥 引入全站統一的價格計算工具
import { getCorrectAmount } from "@/lib/price";

const isHtmlContent = (text) =>
  typeof text === "string" && /<[a-z][\s\S]*>/i.test(text.trim());

const isQuestionLine = (line) => {
  const t = line.trim();
  if (!t) return false;
  if (/^(Q|Ｑ|問)[：:]/i.test(t)) return true;
  if (/[？?]$/.test(t)) return true;
  if (/^(\d+[\.\)、]|[（(]\d+[)）])\s*.+[？?]$/.test(t)) return true;
  return false;
};

const cleanQuestionLine = (line) =>
  line
    .trim()
    .replace(/^(Q|Ｑ|問)[：:]\s*/i, "")
    .replace(/^(\d+[\.\)、]|[（(]\d+[)）])\s*/, "")
    .trim();

/** Medusa FAQ：Q:/A:、Ｑ：/Ａ：、或「問句？＋下一行起為回答」 */
function parseFaqContent(text) {
  if (!text || typeof text !== "string") return { items: [], footer: "" };
  const trimmed = text.trim();
  if (!trimmed) return { items: [], footer: "" };

  if (/Q:|Ｑ：/i.test(trimmed) && /A:|Ａ：/i.test(trimmed)) {
    const items = trimmed
      .split(/Q:|Ｑ：/i)
      .filter(Boolean)
      .map((part) => {
        const [q, ...aArr] = part.split(/A:|Ａ：/i);
        if (!q?.trim() || aArr.length === 0) return null;
        return {
          question: q.trim(),
          answer: aArr.join("A:").trim(),
        };
      })
      .filter(Boolean);
    if (items.length) return { items, footer: "" };
  }

  const blocks = trimmed
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length >= 2) {
    const blockItems = [];
    let pendingQ = null;
    const orphan = [];

    for (const block of blocks) {
      const firstLine = block.split(/\r?\n/)[0]?.trim() || block;
      if (isQuestionLine(firstLine) && !block.includes("\n")) {
        if (pendingQ) orphan.push(pendingQ);
        pendingQ = cleanQuestionLine(firstLine);
        continue;
      }
      if (pendingQ) {
        blockItems.push({ question: pendingQ, answer: block });
        pendingQ = null;
      } else if (isQuestionLine(firstLine)) {
        const lines = block
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        const q = cleanQuestionLine(lines[0]);
        const a = lines.slice(1).join("\n").trim();
        if (q && a) blockItems.push({ question: q, answer: a });
      } else {
        orphan.push(block);
      }
    }
    if (pendingQ) orphan.push(pendingQ);
    if (blockItems.length >= 1) {
      return { items: blockItems, footer: orphan.join("\n\n").trim() };
    }
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length >= 2) {
    const items = [];
    let question = null;
    const answerLines = [];
    const footerLines = [];

    const flush = () => {
      if (question && answerLines.length) {
        items.push({
          question,
          answer: answerLines.join("\n").trim(),
        });
      }
      question = null;
      answerLines.length = 0;
    };

    for (const line of lines) {
      if (isQuestionLine(line)) {
        flush();
        question = cleanQuestionLine(line);
      } else if (question) {
        answerLines.push(line);
      } else {
        footerLines.push(line);
      }
    }
    flush();

    if (items.length >= 1) {
      return { items, footer: footerLines.join("\n").trim() };
    }
  }

  const inlineMatches = [
    ...trimmed.matchAll(
      /([^？?\n]+[？?])\s*([\s\S]*?)(?=\s*[^？?\n]+[？?]|$)/g,
    ),
  ];
  if (inlineMatches.length >= 2) {
    const items = inlineMatches
      .map((m) => ({
        question: m[1].trim(),
        answer: m[2].trim(),
      }))
      .filter((item) => item.question && item.answer);
    if (items.length >= 2) return { items, footer: "" };
  }

  if (inlineMatches.length === 1 && inlineMatches[0][2]?.trim()) {
    return {
      items: [
        {
          question: inlineMatches[0][1].trim(),
          answer: inlineMatches[0][2].trim(),
        },
      ],
      footer: "",
    };
  }

  return { items: [], footer: trimmed };
}

/** 日式組版：內文基礎字級與行高 */
const BODY_TEXT =
  "text-[14.5px] md:text-[15px] text-stone-600 leading-[1.95] tracking-[0.035em] break-words [text-rendering:optimizeLegibility]";

const ACCORDION_PROSE =
  `${BODY_TEXT} ` +
  "[&_p]:mb-[1.15em] [&_p:last-child]:mb-0 [&_p]:leading-[1.95] " +
  "[&_ul]:my-[0.85em] [&_ul]:space-y-[0.65em] [&_ul]:pl-0 [&_ul]:list-none " +
  "[&_ol]:my-[0.85em] [&_ol]:space-y-[0.65em] [&_ol]:pl-[1.25em] [&_ol]:leading-[1.9] " +
  "[&_li]:leading-[1.9] [&_strong]:font-semibold [&_strong]:text-stone-800 " +
  "[&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-stone-900 [&_h3]:mb-2 " +
  "[&_h4]:text-[14.5px] [&_h4]:font-semibold [&_h4]:text-stone-900 [&_h4]:mb-2";

const FAQ_ANSWER = `${BODY_TEXT} whitespace-pre-wrap`;

const SECTION_TITLE =
  "text-[13px] font-semibold text-stone-900 tracking-[0.05em] mb-2.5";

/** 【標題】分段（付款、運送、保養等後台常見格式） */
function parseBracketSections(text) {
  if (!text?.includes("【")) return null;
  const sections = [];
  const regex = /【([^】]+)】\s*([\s\S]*?)(?=【|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const body = match[2].trim();
    if (match[1] || body) {
      sections.push({ title: match[1].trim(), body });
    }
  }
  return sections.length ? sections : null;
}

const isListLine = (line) =>
  /^[・•●○▪\-*]\s/.test(line) || /^\d+[\.\)、]\s/.test(line);

function ProseBlock({ text }) {
  const sections = parseBracketSections(text);
  if (sections) {
    return (
      <div className="space-y-6">
        {sections.map((sec, i) => (
          <div key={i}>
            {sec.title ? (
              <p className={SECTION_TITLE}>{sec.title}</p>
            ) : null}
            <ProseBlock text={sec.body} />
          </div>
        ))}
      </div>
    );
  }

  const paragraphs = text.split(/\n{2,}|\r\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    return (
      <div className="space-y-5">
        {paragraphs.map((para, i) => (
          <ProseBlock key={i} text={para} />
        ))}
      </div>
    );
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2 && lines.every(isListLine)) {
    return (
      <ul className="space-y-2.5 list-none m-0 p-0">
        {lines.map((line, i) => (
          <li key={i} className={`flex gap-2.5 ${BODY_TEXT}`}>
            <span className="text-[#ef4628]/70 shrink-0 mt-[0.55em] text-[8px] leading-none">
              ●
            </span>
            <span>{line.replace(/^[・•●○▪\-*]\s*|\d+[\.\)、]\s*/, "")}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (lines.length >= 2) {
    return (
      <div className="space-y-3">
        {lines.map((line, i) => (
          <p key={i} className={BODY_TEXT}>
            {line}
          </p>
        ))}
      </div>
    );
  }

  return <p className={`${BODY_TEXT} whitespace-pre-wrap`}>{text}</p>;
}

/** 常見問題：Q 標記 + 層級分明（無左側直線） */
function FaqItemBlock({ question, answer, index }) {
  return (
    <article
      className={index > 0 ? "pt-6 mt-6 border-t border-stone-100/90" : "pt-0.5"}
    >
      <div className="flex gap-3 md:gap-3.5">
        <span
          className="flex-shrink-0 mt-[2px] w-7 h-7 rounded-full border border-[#ef4628]/35 text-[#ef4628] text-[11px] font-bold flex items-center justify-center leading-none select-none"
          aria-hidden
        >
          Q
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] md:text-[15.5px] font-semibold text-stone-900 leading-[1.75] tracking-[0.03em]">
            {question}
          </h4>
          <p className={`mt-3 md:mt-3.5 ${FAQ_ANSWER}`}>{answer}</p>
        </div>
      </div>
    </article>
  );
}

function FaqAccordionBody({ content }) {
  const trimmed = typeof content === "string" ? content.trim() : "";

  if (isHtmlContent(trimmed)) {
    return (
      <div
        className={ACCORDION_PROSE}
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  const { items, footer } = parseFaqContent(trimmed);

  if (items.length > 0) {
    return (
      <div>
        {items.map((item, i) => (
          <FaqItemBlock
            key={i}
            index={i}
            question={item.question}
            answer={item.answer}
          />
        ))}
        {footer ? (
          <div className="mt-7 pt-5 border-t border-stone-100/90">
            <ProseBlock text={footer} />
          </div>
        ) : null}
      </div>
    );
  }

  return <ProseBlock text={trimmed} />;
}

const AccordionBody = ({ content, variant = "default" }) => {
  if (content == null || content === "") return null;

  if (variant === "faq") {
    return <FaqAccordionBody content={content} />;
  }

  if (typeof content !== "string") {
    return <div className={ACCORDION_PROSE}>{content}</div>;
  }

  const trimmed = content.trim();

  if (isHtmlContent(trimmed)) {
    return (
      <div
        className={ACCORDION_PROSE}
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  return <ProseBlock text={trimmed} />;
};

const AccordionContentPanel = ({ children }) => (
  <div className="mt-2 pt-1 pb-1 md:pt-2">
    {children}
  </div>
);

// --- 通用摺疊組件 ---
const GenericAccordion = ({
  title,
  children,
  icon: Icon,
  isOpenDefault = false,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  if (!children) return null;

  return (
    <div className="border-b border-gray-200 py-5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group focus:outline-none"
      >
        <h3 className="text-[13px] font-bold uppercase tracking-[0.12em] flex items-center gap-2 group-hover:text-[#ef4628] transition-colors">
          {Icon && <Icon size={16} className="text-[#ef4628]" />}
          {title}
        </h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={14} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <AccordionContentPanel>
              <AccordionBody content={children} variant={variant} />
            </AccordionContentPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductDetail({ product, relatedProducts = [] }) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const schemaBrand = getSchemaBrand(t);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState("features");

  // 🔥 放大鏡專屬 State
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // 🔥 縮圖方向 State (用於判斷手機版水平、電腦版垂直)
  const [thumbDirection, setThumbDirection] = useState("horizontal");

  useEffect(() => {
    const updateDirection = () => {
      setThumbDirection(window.innerWidth >= 768 ? "vertical" : "horizontal");
    };
    updateDirection();
    window.addEventListener("resize", updateDirection);
    return () => window.removeEventListener("resize", updateDirection);
  }, []);

  // 🖱️ 滑鼠版放大鏡追蹤
  const handleMouseMove = (e) => {
    if (!isZoomEnabled) return;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCursorPos({ x, y });
  };

  // 📱 手機觸控版放大鏡追蹤
  const handleTouchMove = (e) => {
    if (!isZoomEnabled) return;
    const touch = e.touches[0];
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    let x = ((touch.clientX - left) / width) * 100;
    let y = ((touch.clientY - top) / height) * 100;
    // 限制範圍在 0~100 之間，避免觸控超界導致破圖
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setCursorPos({ x, y });
  };

  const pdT = t("product_detail", { returnObjects: true }) || {};
  const ui = pdT.ui || {};

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
  const tCare = isEn
    ? "Care Instructions"
    : isKo
      ? "취급 시 주의사항"
      : "清潔與保養建議";
  const tReport = isEn ? "Condition Report" : isKo ? "상태 보고서" : "品況報告";

  // ==========================================
  // SEO — computed directly from locale (no i18next dependency for meta tags)
  // ==========================================
  const siteUrl =
    process.env.NEXT_PUBLIC_STORE_URL || "https://www.kesh-de1.com";
  const currentUrl = `${siteUrl}${router.asPath}`;

  const currentLocale = isEn ? "en" : isKo ? "ko" : "zh-TW";

  const seoTitle = buildProductSeoTitle({
    brand: product.brand,
    title: product.title,
    condition: product.condition,
    locale: currentLocale,
    customTitle: product.seoTitle || "",
  });

  const seoDesc = buildProductSeoDescription({
    brand: product.brand,
    title: product.title,
    condition: product.condition,
    subtitle: product.subtitle,
    description: product.description,
    locale: currentLocale,
    customDesc: product.seoDesc || "",
  });

  const seoKeywords = buildProductSeoKeywords({
    brand: product.brand,
    title: product.title,
    condition: product.condition,
    subtitle: product.subtitle,
    locale: currentLocale,
    customKeywords: product.seoKeywords || "",
  });

  // og:locale directly from router.locale (avoids i18next hydration issue)
  const ogLocale = isEn ? "en_US" : isKo ? "ko_KR" : "zh_TW";

  const ogImage = resolveSchemaImage({
    candidates: [product.thumbnail, ...(product.images || [])],
    siteUrl,
  });
  const schemaImages = resolveSchemaImages({
    candidates: [product.thumbnail, ...(product.images || [])],
    siteUrl,
  });

  const schemaGraph = [];

  schemaGraph.push({
    "@type": "Product",
    name: product.title,
    image: schemaImages.length === 1 ? schemaImages[0] : schemaImages,
    description: seoDesc,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: buildMerchantOfferSchema({
      url: currentUrl,
      price: product.rawPrice,
      currency: product.currency,
      sellerName: schemaBrand.siteName,
      inStock: product.inStock,
    }),
  });

  const faqEntities = [];

  const careQuestionName = isEn
    ? `How to clean and care for ${product.title}?`
    : isKo
      ? `${product.title} 관리 및 보관 방법은 무엇인가요?`
      : `如何清潔與保養 ${product.title}？`;

  const defaultCareZh =
    "【日常清潔與保養】建議每次使用後，使用乾淨、柔軟的乾布輕輕擦拭皮件表面，去除灰塵與輕微汙垢。【防潮與遇水處理】精品皮件請盡量避免接觸水分、雨水及濕氣。若不慎淋濕，請立即以乾淨的吸水軟布將水分輕壓吸乾。【正確的收納方式】皮件長期不使用時，請在包包內部塞入適量的無酸紙或乾淨軟布以支撐包型，並放入防塵袋中。【五金配件維護】保養時僅需使用乾燥的纖維軟布輕輕擦拭即可。";
  const defaultCareEn =
    "【Daily Care】Wipe gently with a soft, dry cloth after each use. 【Moisture Protection】Avoid contact with water and humidity. If wet, pat dry immediately. 【Storage】Stuff with acid-free paper to maintain shape and store in a dust bag. 【Hardware Maintenance】Wipe metal parts with a dry microfiber cloth.";
  const defaultCareKo =
    "【일상 관리】사용 후 부드럽고 마른 천으로 부드럽게 닦아주세요. 【습기 주의】물과 습기를 피하고, 젖었을 경우 즉시 물기를 닦아내세요. 【보관 방법】모양 유지를 위해 산성 없는 종이를 넣고 더스트 백에 보관하세요. 【금속 부품 관리】마른 극세사 천으로 금속 부품을 닦아주세요.";

  const finalCareInfo =
    product.careInfo ||
    (isEn ? defaultCareEn : isKo ? defaultCareKo : defaultCareZh);

  faqEntities.push({
    "@type": "Question",
    name: careQuestionName,
    acceptedAnswer: {
      "@type": "Answer",
      text: finalCareInfo,
    },
  });

  if (product.faqInfo) {
    const hasQAFormat =
      /Q:|Ｑ：/i.test(product.faqInfo) && /A:|Ａ：/i.test(product.faqInfo);

    if (hasQAFormat) {
      const faqParts = product.faqInfo.split(/Q:|Ｑ：/i).filter(Boolean);
      faqParts.forEach((part) => {
        const [q, ...aArr] = part.split(/A:|Ａ：/i);
        if (q && aArr.length > 0) {
          faqEntities.push({
            "@type": "Question",
            name: q.trim(),
            acceptedAnswer: {
              "@type": "Answer",
              text: aArr.join("A:").trim(),
            },
          });
        }
      });
    } else {
      const fallbackQuestionName = isEn
        ? `Purchasing and Shipping for ${product.title}`
        : isKo
          ? `${product.title} 구매 및 배송 관련 질문`
          : `關於 ${product.title} 的購買與配送問題`;

      faqEntities.push({
        "@type": "Question",
        name: fallbackQuestionName,
        acceptedAnswer: {
          "@type": "Answer",
          text: product.faqInfo,
        },
      });
    }
  }

  if (faqEntities.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      mainEntity: faqEntities,
    });
  }

  // BreadcrumbList — locale-aware breadcrumb for Google SERP display
  const breadcrumbLabels = getSchemaBreadcrumbLabels(t, currentLocale);
  const breadcrumbHome = breadcrumbLabels.home;
  const breadcrumbProducts = breadcrumbLabels.products;
  const brandPageUrl = `${siteUrl}/brand/${product.brand.toLowerCase().replace(/\s+/g, "-")}`;

  schemaGraph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: breadcrumbHome, item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumbProducts,
        item: `${siteUrl}/category`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.brand,
        item: brandPageUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.title,
        item: currentUrl,
      },
    ],
  });

  const jsonLd = {
    "@context": "https://schema.org/",
    "@graph": schemaGraph,
  };

  return (
    <>
      <Head>
        <title key="title">{seoTitle}</title>
        <meta name="description" content={seoDesc} key="desc" />
        <meta name="keywords" content={seoKeywords} key="keywords" />
        <link rel="canonical" href={currentUrl} />

        <meta property="og:locale" content={ogLocale} key="oglocale" />
        <meta property="og:type" content="product" key="ogtype" />
        <meta property="og:title" content={seoTitle} key="ogtitle" />
        <meta property="og:description" content={seoDesc} key="ogdesc" />
        <meta property="og:image" content={ogImage} key="ogimage" />
        <meta
          property="og:image:secure_url"
          content={ogImage}
          key="ogimagesecure"
        />
        <meta property="og:url" content={currentUrl} key="ogurl" />
        <meta
          property="product:price:amount"
          content={product.rawPrice}
          key="productprice"
        />
        <meta
          property="product:price:currency"
          content={product.currency}
          key="productcurrency"
        />

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content={seoTitle} key="twtitle" />
        <meta name="twitter:description" content={seoDesc} key="twdesc" />
        <meta name="twitter:image" content={ogImage} key="twimage" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* 🔥 加入全域樣式以複寫 Swiper 預設箭頭，呈現毛玻璃效果 */}
      <style jsx global>{`
        .main-product-swiper .swiper-button-next,
        .main-product-swiper .swiper-button-prev {
          width: 44px !important;
          height: 44px !important;
          background-color: rgba(255, 255, 255, 0.45) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          border-radius: 50% !important;
          color: #1a1a1a !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05) !important;
          transition: all 0.3s ease !important;
          opacity: 0 !important;
        }
        .main-swiper-group:hover
          .main-product-swiper
          .swiper-button-next:not(.swiper-button-disabled),
        .main-swiper-group:hover
          .main-product-swiper
          .swiper-button-prev:not(.swiper-button-disabled) {
          opacity: 1 !important;
        }
        .main-product-swiper .swiper-button-next:hover,
        .main-product-swiper .swiper-button-prev:hover {
          background-color: rgba(255, 255, 255, 0.85) !important;
          transform: scale(1.05) !important;
        }
        .main-product-swiper .swiper-button-next::after,
        .main-product-swiper .swiper-button-prev::after {
          font-size: 16px !important;
          font-weight: 900 !important;
        }
        .main-product-swiper .swiper-button-prev {
          left: 16px !important;
        }
        .main-product-swiper .swiper-button-next {
          right: 16px !important;
        }
        .main-product-swiper .swiper-button-disabled {
          opacity: 0 !important;
          cursor: default;
        }
      `}</style>

      <main className="bg-white text-black min-h-screen pt-5 md:pt-14 pb-0">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-16 items-start">
            {/* ================= 左側：圖片區 (結合垂直與水平排列) ================= */}
            <div className="w-full md:w-[55%] lg:w-[55%] 2xl:w-[50%] md:sticky md:top-32 z-10 flex flex-col-reverse md:flex-row gap-3 items-stretch">
              {/* 縮圖區塊 */}
              <div className="w-full md:w-[80px] lg:w-[100px] shrink-0 relative h-24 md:h-auto">
                <div className="md:absolute md:inset-0 w-full h-full">
                  <Swiper
                    key={thumbDirection}
                    onSwiper={setThumbsSwiper}
                    direction={thumbDirection}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="w-full h-full thumb-swiper"
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
              </div>

              {/* 主圖區塊 (加入 main-swiper-group 讓 hover 生效) */}
              <div className="w-full flex-1 relative min-w-0 main-swiper-group">
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
                  // 🔥 加入 main-product-swiper 套用上方毛玻璃 CSS
                  className="w-full aspect-[4/4] bg-gray-50 rounded-sm main-product-swiper"
                >
                  {product.images?.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div
                        className={`relative w-full h-full overflow-hidden ${
                          isZoomEnabled
                            ? "cursor-crosshair touch-none"
                            : "cursor-default"
                        }`}
                        onMouseEnter={() => isZoomEnabled && setIsHovered(true)}
                        onMouseLeave={() => {
                          setIsHovered(false);
                          setCursorPos({ x: 50, y: 50 });
                        }}
                        onMouseMove={handleMouseMove}
                        onTouchStart={(e) => {
                          if (isZoomEnabled) {
                            setIsHovered(true);
                            handleTouchMove(e);
                          }
                        }}
                        onTouchEnd={() => {
                          setIsHovered(false);
                          setCursorPos({ x: 50, y: 50 });
                        }}
                        onTouchMove={handleTouchMove}
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
              </div>
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
                <GenericAccordion title={tFAQ} icon={HelpCircle} variant="faq">
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
              {ui.tab_features || "品況報告"}
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
                  className="flex flex-col gap-10 overflow-hidden" // 🔥 加入 overflow-hidden
                >
                  {product.reportInfo && (
                    <div className="max-w-4xl mx-auto w-full text-[14px] leading-8 text-gray-700 space-y-8">
                      <div>
                        <h3 className="text-base font-bold mb-4 text-black tracking-widest border-b border-gray-100 pb-2">
                          {tReport}
                        </h3>
                        {/* 🔥 加入 break-words 修正連續字串爆版問題 */}
                        <p className="whitespace-pre-wrap break-words">
                          {product.reportInfo}
                        </p>
                      </div>
                    </div>
                  )}

                  <HeroSlider
                    carouselSlides={[
                      {
                        title: isEn
                          ? "Curated Quality Assurance"
                          : isKo
                            ? "엄선된 품질 보증"
                            : "嚴選品質保證",
                        image:
                          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_7.jpg",
                      },
                      {
                        title: isEn
                          ? "Professional Authentication"
                          : isKo
                            ? "전문 정품 감정"
                            : "支援專業真品鑑定",
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
                  className="max-w-4xl mx-auto text-[14px] leading-8 text-gray-700 space-y-8"
                >
                  <div>
                    <h3 className="text-base font-bold mb-4 text-black tracking-widest border-b border-gray-100 pb-2">
                      {tCare}
                    </h3>
                    <p className="whitespace-pre-wrap break-words">
                      {product.careInfo || finalCareInfo}
                    </p>
                  </div>
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

    // 🔥 使用全域統一的價格計算工具
    let amount = priceObj
      ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
      : 0;

    const productWeight =
      rawProduct.variants?.[0]?.weight || rawProduct.weight || 0;
    const metaLang = currentLang === "zh-TW" ? "zh" : currentLang;

    // 基本資訊多語系
    const localizedTitle =
      rawProduct.metadata?.[`title_${metaLang}`] || rawProduct.title;
    const localizedSubtitle =
      rawProduct.metadata?.[`subtitle_${metaLang}`] ||
      rawProduct.subtitle ||
      "";
    const localizedDesc =
      rawProduct.metadata?.[`desc_${metaLang}`] || rawProduct.description;

    // SEO — only use explicit metadata values; component builds smart fallback
    const finalSeoTitle =
      rawProduct.metadata?.[`seo_title_${metaLang}`] ||
      (metaLang === "zh" ? rawProduct.metadata?.seo_title : null) ||
      ""; // empty → component builds locale-aware default title

    const finalSeoDesc =
      rawProduct.metadata?.[`seo_description_${metaLang}`] ||
      (metaLang === "zh" ? rawProduct.metadata?.seo_description : null) ||
      ""; // empty → component builds locale-aware default description

    const brandName = rawProduct.collection?.title || "";
    const productTitle = localizedTitle || rawProduct.title || "";

    // Rich locale-specific keyword fallback built at build time
    const conditionMeta =
      rawProduct.metadata?.[`condition_${metaLang}`] ||
      rawProduct.metadata?.condition_zh ||
      "";
    const subtitleMeta =
      rawProduct.metadata?.[`subtitle_${metaLang}`] ||
      rawProduct.subtitle ||
      "";

    const finalSeoKeywords =
      rawProduct.metadata?.[`seo_keywords_${metaLang}`] ||
      rawProduct.metadata?.seo_keywords ||
      buildProductSeoKeywords({
        brand: brandName,
        title: productTitle,
        condition: conditionMeta,
        subtitle: subtitleMeta,
        locale: currentLang === "zh-TW" ? "zh-TW" : currentLang,
      });

    const product = {
      id: rawProduct.id || "",
      slug: rawProduct.handle || slug,
      title: localizedTitle || "",
      subtitle: localizedSubtitle,
      price: `${symbol}${Math.round(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      rawPrice: amount,
      currency: targetCurrency.toUpperCase(),
      prices: rawProduct.variants?.[0]?.prices || [],
      sku: rawProduct.variants?.[0]?.sku || "",
      variantId: rawProduct.variants?.[0]?.id || null,
      brand: rawProduct.collection?.title || "KÉSH de¹ Select",
      weight: productWeight,
      description: localizedDesc || "",
      thumbnail: rawProduct.thumbnail || rawProduct.images?.[0]?.url || "",

      // SEO 使用剛剛運算過的智慧變數
      seoTitle: finalSeoTitle || "",
      seoDesc: finalSeoDesc || "",
      seoKeywords: finalSeoKeywords || "",

      inStock:
        rawProduct.variants?.some((v) => v.inventory_quantity > 0) || true,

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
      careInfo:
        rawProduct.metadata?.[`care_${metaLang}`] ||
        rawProduct.metadata?.care_zh ||
        "",
      reportInfo:
        rawProduct.metadata?.[`report_${metaLang}`] ||
        rawProduct.metadata?.report_zh ||
        "",

      images:
        rawProduct.images?.map((img) => img.url) ||
        [rawProduct.thumbnail].filter(Boolean),
      specs: { rank: rawProduct.metadata?.rank || "Rank S" },

      // 🔥 非常重要：把原始的 metadata 整包傳給購物車，用來即時翻譯！
      metadata: rawProduct.metadata || {},
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
