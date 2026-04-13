import React, { useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarosuelDotButton";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link"; // ✅ 記得引入 Link

const EmblaCarousel = (props) => {
  const { slides, options } = props;

  // 強制關閉 loop (視需求而定，若數量少於顯示數量建議關閉)
  const mergedOptions = {
    ...options,
    loop: false,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(mergedOptions);
  const dragIndicatorRef = useRef(null);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const handleMouseEnter = () => {
    if (dragIndicatorRef.current) {
      gsap.to(dragIndicatorRef.current, { opacity: 1, scale: 1, duration: 0.5 });
    }
    document.body.style.cursor = "grab";
  };

  const handleMouseLeave = () => {
    if (dragIndicatorRef.current) {
      gsap.to(dragIndicatorRef.current, { opacity: 0, scale: 0.5, duration: 0.5 });
    }
    document.body.style.cursor = "default";
  };

  return (
    <div
      className="w-full py-8 mx-auto relative group/carousel"
      style={{
        "--slide-height": "4rem",
        "--slide-spacing": "1rem",
        "--slide-size": "85%",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>
        {`
          .embla__viewport { --slide-size: 85%; }
          @media (min-width: 768px) { .embla__viewport { --slide-size: 45%; } }
          @media (min-width: 1024px) { .embla__viewport { --slide-size: 30%; } }
          @media (min-width: 1600px) { .embla__viewport { --slide-size: 21%; } }
        `}
      </style>

      {/* 控制按鈕區 */}
      <div className="embla__controls flex flex-col-reverse md:flex-row items-center justify-center md:justify-between gap-4 md:gap-0 mt-6 md:mt-0 md:absolute md:left-1/2 md:-translate-x-1/2 md:bottom-[0%] z-10 w-full px-4 md:px-0">
        <div className="embla__buttons flex justify-center w-[140px] md:w-[180px] gap-4 md:gap-0 md:absolute md:left-[-50%] md:-translate-x-1/2 md:top-8">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
        <div className="embla__dots flex flex-wrap justify-center gap-2">
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

      {/* Viewport */}
      <div className="embla__viewport pl-4 md:pl-10 lg:pl-[24rem] overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex touch-pan-y touch-pinch-zoom h-auto" style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}>
          {slides.map((slide, index) => (
            <div className="embla__slide relative transform flex-none h-full min-w-0" key={index} style={{ transform: "translate3d(0, 0, 0)", flex: "0 0 var(--slide-size)", paddingLeft: "var(--slide-spacing)" }}>
              <div className="embla__slide__number bg-[#f7f7f7] group pb-[25px] md:pb-[35px] flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg" style={{ boxShadow: "inset 0 0 0 0.2rem var(--detail-medium-contrast)", height: "100%", userSelect: "none" }}>
                
                {/* ✅ 改為動態連結 */}
                <Link href={`/product/${slide.slug}`} className="w-full h-full block">
                  <div className="flex flex-col justify-center items-center h-full">
                    
                    {/* ✅ 產品名稱標籤 */}
                    <div className="py-4 px-2 w-full text-center">
                      <span className="card-title text-[1rem] md:text-[1.2rem] font-medium tracking-wide block truncate">
                        {slide.title}
                      </span>
                    </div>

                    {/* 圖片區域 */}
                    {slide.content ? (
                      slide.content
                    ) : (
                      <div className="w-full px-6 md:px-8 aspect-square relative overflow-hidden">
                        <Image
                          width={600}
                          height={600}
                          placeholder="empty"
                          loading="lazy"
                          src={slide.image}
                          alt={slide.title || "Product Image"}
                          className="w-full h-full object-cover scale-100 group-hover:scale-105 duration-500 ease-out"
                        />
                      </div>
                    )}

                    {/* ✅ 文字區域 (顯示價格與簡述) */}
                    <div className="txt mt-4 md:mt-5 flex-col flex justify-center items-center w-[90%] md:w-4/5 mx-auto">
                      <b className="text-[14px] md:text-[16px] text-center leading-tight mb-2 text-[#ef4628]">
                        {slide.price}
                      </b>
                      <p className="text-[12px] md:text-[14px] font-normal text-center text-gray-500 line-clamp-2">
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;