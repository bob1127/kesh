"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "../EmblaCarouselFeatureCarousel/EmblaCarouselArrowButtons";
import {
  DotButton,
  useDotButton,
} from "../EmblaCarouselFeatureCarousel/EmblaCarosuelDotButton";
import Image from "next/image";

const newsItems = [
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/11/20251111_12_bororo7847-scaled.jpg",
    title: "「A&D Awards 2024」受賞",
    // 移除 text-white，統一用深色或讓 CSS 控制，這裡保留你的資料結構但做微調
    titleColor: "text-stone-800",
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    // ✅ 重點：只在 md (桌機) 以上套用高度，手機版由 CSS 統一控制
    desktopHeightClass: "md:h-[33vh]",
  },
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/11/Insta_26SS_JOINT_m2028-scaled.jpg",
    title: "New Collection Released",
    titleColor: "text-stone-800", // 修正為深色以確保可讀性
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    desktopHeightClass: "md:h-[36vh]",
  },
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/11/20250924_25_bororo4741-scaled.jpg",
    title: "Craftsmanship Workshop",
    titleColor: "text-stone-800",
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    desktopHeightClass: "md:h-[26vh]",
  },
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/11/Insta_JOINT_k9591-scaled.jpg",
    title: "Limited Edition",
    titleColor: "text-stone-800",
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    desktopHeightClass: "md:h-[30vh]",
  },
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/11/20250924_25_bororo4741-scaled.jpg",
    title: "Summer Sale",
    titleColor: "text-stone-800",
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    desktopHeightClass: "md:h-[33vh]",
  },
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/11/himie_main4%C3%975-scaled.jpg",
    title: "Designer Interview",
    titleColor: "text-stone-800",
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    desktopHeightClass: "md:h-[36vh]",
  },
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/10/IMG_1445-scaled.jpg",
    title: "Global Exhibition",
    titleColor: "text-stone-800",
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    desktopHeightClass: "md:h-[26vh]",
  },
  {
    img: "https://culet-web.jp/2018/wp/wp-content/uploads/2025/10/IMG_1446-scaled.jpg",
    title: "Sustainability",
    titleColor: "text-stone-800",
    body: "太陽印刷製造 InnoValley 在最佳工作場所類別中獲得了最高獎項。",
    placeDate: "Taichung - 2025.03.23",
    desktopHeightClass: "md:h-[30vh]",
  },
];

const NewsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1, // 每次滑動一張，體驗較好
    containScroll: "trimSnaps", // 避免右側過多留白
  });

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <div
      className="embla-news relative mt-6 w-full py-10"
      style={{
        // 預設 (手機版) 變數
        "--slide-size": "80%",
        "--slide-spacing": "1rem",
      }}
    >
      <style>
        {`
          /* Mobile First */
          .embla__viewport { --slide-size: 80%; }
          
          /* Tablet */
          @media (min-width: 640px) { .embla__viewport { --slide-size: 50%; } }
          
          /* Desktop */
          @media (min-width: 1024px) { .embla__viewport { --slide-size: 30%; } }
          
          /* Large Desktop */
          @media (min-width: 1280px) { .embla__viewport { --slide-size: 25%; } }
        `}
      </style>

      {/* Viewport
          pl-5: 手機版給一點左邊距，不要貼死
          md:pl-0: 桌機版歸零，由外層容器控制
      */}
      <div
        className="embla__viewport pl-5 md:pl-0 overflow-hidden"
        ref={emblaRef}
      >
        <div
          className="embla__container flex touch-pan-y"
          style={{
            marginLeft: "calc(var(--slide-spacing) * -1)",
            gap: "var(--slide-spacing)", // 使用 gap 取代 padding-left trick，排版更直覺
          }}
        >
          {newsItems.map((item, index) => (
            <div
              key={index}
              className="embla__slide relative flex-none min-w-0"
              style={{ flex: "0 0 var(--slide-size)" }}
            >
              <div className="group cursor-pointer flex flex-col h-full">
                {/* 圖片容器
                    1. 手機版：aspect-[3/4] 統一比例
                    2. 桌機版：item.desktopHeightClass (保留高低錯落感)
                */}
                <div
                  className={`
                    img-wrapper w-full relative overflow-hidden bg-gray-100 mb-4
                    aspect-[3/4] ${item.desktopHeightClass}
                  `}
                >
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
                  />
                </div>

                {/* 文字內容 */}
                <div className="flex flex-col px-1 flex-grow">
                  <div className="mb-2">
                    <button
                      type="button"
                      className="relative inline-block text-left"
                    >
                      {/* 裝飾線條效果 */}
                      <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
                      <h3
                        className={`text-[1rem] md:text-[1.1rem] font-bold leading-tight ${item.titleColor}`}
                      >
                        {item.title}
                      </h3>
                    </button>
                  </div>

                  {/* 使用 line-clamp 限制行數，避免長短不一 */}
                  <p className="text-[0.8rem] text-gray-500 font-light leading-relaxed line-clamp-2 mb-2">
                    {item.body}
                  </p>

                  <div className="mt-auto">
                    <span className="text-[0.7rem] text-gray-400 uppercase tracking-wider">
                      {item.placeDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 控制區：箭頭與圓點 */}
      <div className="mt-8 px-5 md:px-0 flex items-center justify-between max-w-[1440px] mx-auto">
        <div className="flex gap-3">
          <PrevButton
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
            // 這裡可以加自定義樣式
          />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="flex gap-2">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={"embla__dot".concat(
                index === selectedIndex ? " embla__dot--selected" : ""
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCarousel;
