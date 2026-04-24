"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// 引用外部 Carousel (接收 Medusa 資料)
import Carousel from "../components/EmblaCarousel06/index.jsx";

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 1. 精品風格多語系備用字典 (Fallback)
// ==========================================
const fallbackData = {
  "zh-TW": {
    headerTitle: "CURATION",
    headerSub: "(STYLE)",
    headerTag: "for MODERN ELEGANCE",
    headerDesc:
      "探索 KÉSH de¹ 為您精心挑選的頂級精品。\n從經典雋永的傳世之作到現代俐落的都會風格，展現獨一無二的奢華品味。",
    tagFeatured: "KÉSH de¹ : FEATURED ITEM",
    btnReadMore: "DISCOVER MORE",
    cases: [
      {
        id: "style-01",
        caseNumber: "STYLE 01",
        role: "TIMELESS CLASSIC",
        name: "經典傳承",
        description: "為什麼經典包款永遠是無可取代的選擇？",
        image:
          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_17.jpg",
        blockTitle: "百年工藝與現代美學的\n完美交織。",
        blockDesc:
          "精選頂級皮質與無可挑惕的精湛工藝。\n無論是正式場合或是日常穿搭，經典的元素與俐落剪裁，\n為您的每一個優雅瞬間完美加分。",
      },
      {
        id: "style-02",
        caseNumber: "STYLE 02",
        role: "URBAN ELEGANCE",
        name: "都會奢華",
        description: "探索城市叢林中的精緻生活流儀",
        image:
          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_7.jpg",
        blockTitle: "為日常注入\n不凡的奢華底蘊。",
        blockDesc:
          "兼具實用性與搶眼外觀的絕佳設計。\n不僅提供充足的收納空間，細緻的金屬五金與流線型的輪廓，\n讓您在都會節奏中展現自信與從容。",
      },
    ],
  },
  en: {
    headerTitle: "CURATION",
    headerSub: "(STYLE)",
    headerTag: "for MODERN ELEGANCE",
    headerDesc:
      "Discover the finest luxury pieces curated by KÉSH de¹.\nFrom timeless classics to modern urban styles, showcase your unique taste in luxury.",
    tagFeatured: "KÉSH de¹ : FEATURED ITEM",
    btnReadMore: "DISCOVER MORE",
    cases: [
      {
        id: "style-01",
        caseNumber: "STYLE 01",
        role: "TIMELESS CLASSIC",
        name: "Iconic Heritage",
        description: "Why classic bags never go out of style?",
        image:
          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_17.jpg",
        blockTitle:
          "The perfect blend of\ncentury-old craft and modern aesthetics.",
        blockDesc:
          "Selected top-tier leather and impeccable craftsmanship.\nWhether for formal occasions or daily wear, classic elements and sleek tailoring\nperfectly enhance your every elegant moment.",
      },
      {
        id: "style-02",
        caseNumber: "STYLE 02",
        role: "URBAN ELEGANCE",
        name: "Modern Chic",
        description: "Exploring refined lifestyle in the city.",
        image:
          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_22.jpg",
        blockTitle: "Injecting extraordinary luxury\ninto everyday life.",
        blockDesc:
          "Excellent design combining practicality and striking appearance.\nNot only providing ample storage space, but the delicate hardware and streamlined silhouette\nallow you to exude confidence in the urban jungle.",
      },
    ],
  },
  ko: {
    headerTitle: "CURATION",
    headerSub: "(STYLE)",
    headerTag: "for MODERN ELEGANCE",
    headerDesc:
      "KÉSH de¹가 엄선한 최고급 럭셔리 아이템을 만나보세요.\n시대를 초월한 클래식부터 현대적인 어반 스타일까지, 당신만의 특별한 취향을 보여주세요.",
    tagFeatured: "KÉSH de¹ : FEATURED ITEM",
    btnReadMore: "DISCOVER MORE",
    cases: [
      {
        id: "style-01",
        caseNumber: "STYLE 01",
        role: "TIMELESS CLASSIC",
        name: "클래식 헤리티지",
        description: "클래식 백이 유행을 타지 않는 이유는?",
        image:
          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_17.jpg",
        blockTitle: "백년의 장인정신과\n현대적 미학의 완벽한 조화.",
        blockDesc:
          "엄선된 최고급 가죽과 흠잡을 데 없는 장인정신.\n격식 있는 자리나 일상복에 상관없이, 클래식한 요소와 깔끔한 테일러링이\n당신의 모든 우아한 순간을 완벽하게 돋보이게 합니다.",
      },
      {
        id: "style-02",
        caseNumber: "STYLE 02",
        role: "URBAN ELEGANCE",
        name: "모던 시크",
        description: "도심 속 세련된 라이프스타일 탐구",
        image:
          "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_22.jpg",
        blockTitle: "평범한 일상에\n특별한 럭셔리를 더하다.",
        blockDesc:
          "실용성과 눈길을 끄는 디자인의 완벽한 결합.\n넉넉한 수납공간은 물론, 섬세한 금속 장식과 유선형 실루엣으로\n도심 속에서도 자신감 있고 여유로운 모습을 연출할 수 있습니다.",
      },
    ],
  },
};

export default function CollectionShowcase({ initialProducts = [] }) {
  const router = useRouter();
  const { t } = useTranslation("common");

  // 取得當前語系，預設繁中
  const locale = router.locale || "zh-TW";

  const tData = t("collection_showcase", { returnObjects: true });
  const content =
    typeof tData === "object" && Object.keys(tData).length > 0
      ? tData
      : fallbackData[locale] || fallbackData["zh-TW"];

  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(!initialProducts.length);
  const containerRef = useRef(null);

  // 🔥 安全鎖：確保 fetch 只會執行一次
  const isFetched = useRef(false);

  // ==========================================
  // 自動抓取 Medusa 後台商品 (附帶超級除錯模式與環境判斷)
  // ==========================================
  useEffect(() => {
    if (isFetched.current || (initialProducts && initialProducts.length > 0)) {
      if (initialProducts && initialProducts.length > 0) {
        setProducts(initialProducts);
      }
      return;
    }

    isFetched.current = true;

    const fetchMedusaProducts = async () => {
      // 🔥 智慧判斷：如果是本地開發就用 9000，如果是正式上線 (Vercel) 就用 Railway
      const defaultBackendUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:9000"
          : "https://kesh-backend-production.up.railway.app";

      const BACKEND_URL =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || defaultBackendUrl;
      const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

      // 🕵️‍♂️ 超級除錯追蹤器開始
      console.log("🔍 [Medusa API 測試] 開始抓取商品資料...");
      console.log(
        "🔗 [Medusa API 測試] 當前環境 NODE_ENV:",
        process.env.NODE_ENV,
      );
      console.log("🔗 [Medusa API 測試] 實際使用的 BACKEND_URL:", BACKEND_URL);
      console.log("🔑 [Medusa API 測試] 是否有帶 API Key:", !!API_KEY);

      if (!API_KEY) {
        console.error(
          "❌ [Medusa API 測試] 缺少 NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY！請檢查 .env 檔案",
        );
        return setIsLoading(false);
      }

      try {
        const targetUrl = `${BACKEND_URL}/store/products?limit=8`;
        console.log("📡 [Medusa API 測試] 準備發送請求至:", targetUrl);

        const res = await fetch(targetUrl, {
          headers: {
            "x-publishable-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        });

        console.log("📥 [Medusa API 測試] 收到回應，狀態碼:", res.status);

        if (!res.ok) {
          throw new Error(`HTTP 錯誤! 狀態碼: ${res.status}`);
        }

        const data = await res.json();
        console.log("📦 [Medusa API 測試] 成功解析後端資料:", data);

        if (data.products && data.products.length > 0) {
          const formattedProducts = data.products.map((p) => {
            const priceObj = p.variants?.[0]?.prices?.[0];
            let amount = priceObj
              ? priceObj.amount > 1000000
                ? priceObj.amount / 100
                : priceObj.amount
              : 0;
            return {
              id: p.id,
              title: p.title,
              slug: p.handle,
              price: `NT$ ${amount.toLocaleString()}`,
              image: p.thumbnail || "/images/placeholder.jpg",
            };
          });
          console.log(
            "✨ [Medusa API 測試] 轉換後的輪播圖商品陣列:",
            formattedProducts,
          );
          setProducts(formattedProducts);
        } else {
          console.warn(
            "⚠️ [Medusa API 測試] 後端有回應，但 products 陣列是空的！請確定你的 Medusa 後台有上架商品並且為 Published。",
          );
        }
      } catch (error) {
        console.error("❌ [Medusa API 測試] 發生致命連線錯誤:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedusaProducts();
  }, []);

  // ==========================================
  // GSAP 視覺差滾動動畫
  // ==========================================
  useGSAP(
    () => {
      const images = gsap.utils.toArray(".parallax-img-wrapper");
      images.forEach((img) => {
        gsap.to(img, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="w-full bg-white text-black font-sans"
    >
      {/* 標題區塊 */}
      <div className="w-full pt-28 pb-5 md:pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-widest flex items-start justify-center gap-1 mb-2">
            {content.headerTitle}
            <span className="text-[11px] lg:text-[13px] font-bold mt-2 tracking-normal uppercase">
              {content.headerSub}
            </span>
          </h2>
          <p className="text-sm md:text-base font-bold tracking-[0.2em] uppercase">
            {content.headerTag}
          </p>
        </div>
        <p className="text-[12px] md:text-[14px] text-gray-700 leading-[2.5] tracking-[0.15em] whitespace-pre-line max-w-3xl">
          {content.headerDesc}
        </p>
      </div>

      {/* 企劃展示區塊 */}
      {content.cases.map((item, index) => {
        const isEven = index % 2 !== 0;

        return (
          <div
            key={item.id}
            className={`flex flex-col lg:flex-row w-full h-auto lg:h-[100svh] ${isEven ? "lg:flex-row-reverse" : ""}`}
          >
            {/* 左側：商品展示區 */}
            <div className="w-full lg:w-[50%] h-full overflow-hidden flex flex-col items-center justify-center bg-white z-10 relative">
              <div className="text-center mb-8 max-w-lg">
                <h3 className="text-[20px] lg:text-[24px] mt-8 font-bold leading-[1.8] mb-4 whitespace-pre-line text-gray-900 tracking-wider">
                  {item.blockTitle}
                </h3>
                <p className="text-[11px] lg:text-[12px] leading-[2.2] text-gray-500 whitespace-pre-line tracking-[0.1em]">
                  {item.blockDesc}
                </p>
                <div className="mt-6 inline-block border border-gray-300 rounded-full px-5 py-1.5">
                  <span className="text-[9px] font-bold tracking-[0.15em] text-gray-600 uppercase">
                    {content.tagFeatured}
                  </span>
                </div>
              </div>

              <div className="w-full ml-20">
                {isLoading ? (
                  <div className="flex justify-center items-center h-48 text-gray-400 text-xs tracking-widest uppercase">
                    Loading Collection...
                  </div>
                ) : (
                  <Carousel products={products} />
                )}
              </div>
            </div>

            {/* 右側：情境人物區 (含視覺差) */}
            <div className="w-full lg:w-1/2 h-[60vh] lg:h-full relative overflow-hidden group">
              {/* 視覺差圖層 */}
              <div className="parallax-img-wrapper absolute top-[-10%] left-0 w-full h-[120%] will-change-transform">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-[10s] ease-out"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 pointer-events-none"></div>

              <div className="absolute bottom-12 w-full flex flex-col items-center text-center text-white z-20 px-6">
                <span className="border border-white/40 rounded-full px-5 py-1.5 text-[10px] font-bold tracking-[0.15em] mb-4 backdrop-blur-md">
                  {item.caseNumber}
                </span>
                <span className="text-[11px] font-bold tracking-[0.2em] mb-2 opacity-80 uppercase">
                  {item.role}
                </span>
                <h2 className="text-3xl lg:text-[36px] font-bold tracking-widest mb-4">
                  {item.name}
                </h2>
                <div className="w-6 h-[1px] bg-white/50 mb-6"></div>
                <p className="text-[12px] tracking-widest mb-8 opacity-90">
                  {item.description}
                </p>
                <Link
                  href="/category"
                  className="bg-[#fd4e27] text-white border border-white text-[10px] font-bold tracking-[0.2em] uppercase px-12 py-4 hover:bg-white hover:text-black transition-colors duration-300"
                >
                  {content.btnReadMore}
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
