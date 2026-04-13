import React, { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link"; // 使用 Next.js Link
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarosuelDotButton";
import { gsap } from "gsap";

const EmblaCarousel = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const dragIndicatorRef = useRef(null);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const handleMouseEnter = () => {
    gsap.to(dragIndicatorRef.current, { opacity: 1, scale: 1, duration: 0.5 });
    document.body.style.cursor = "grab";
  };

  const handleMouseLeave = () => {
    gsap.to(dragIndicatorRef.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.5,
    });
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("reInit", () => {}).on("scroll", () => {}).on("slideFocus", () => {});
  }, [emblaApi]);

if (!slides || slides.length === 0) {
  return (
    <div className="w-full py-20 text-center border-2 border-red-500 bg-red-100 text-red-600 font-bold">
      ⚠️ 目前沒有讀取到任何商品資料 (slides is empty)
    </div>
  );
}
  return (
    <div
      className="w-full py-8 mx-auto relative"
      style={{
        "--slide-height": "19rem",
        "--slide-spacing": "1rem",
        "--slide-size": "25%",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div
          className="embla__container flex touch-pan-y touch-pinch-zoom h-[600px]"
          style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}
        >
          {slides.map((slide, index) => (
            <div
              className="embla__slide transform flex-none h-full min-w-0"
              key={slide.id || index}
              style={{
                transform: "translate3d(0, 0, 0)",
                flex: "0 0 var(--slide-size)",
                paddingLeft: "var(--slide-spacing)",
              }}
            >
              {/* 這裡加入 'group' class，讓子元素可以偵測 hover */}
              <div
                className="embla__slide__inner group border-none border border-black md:border bg-grey-500 py-8 md:border-black flex flex-col items-center justify-center font-semibold relative overflow-hidden transition-all duration-300 hover:shadow-xl"
                style={{
                  boxShadow: "inset 0 0 0 0.2rem var(--detail-medium-contrast)",
                  borderRadius: "1.8rem",
                  height: "100%",
                  userSelect: "none",
                  backgroundColor: "#fff" // 確保背景色
                }}
              >
                <Link href={`/product/${slide.slug}`} className="w-full h-full flex flex-col">
                  <div className="flex-1 flex overflow-hidden flex-col justify-center items-center px-4">
                    
                    {/* 圖片區域 */}
                    <div className="h-[300px] w-full flex items-center justify-center overflow-hidden mb-4">
                      {slide.image ? (
                        <img
                          src={slide.image}
                          className="w-full h-full object-contain hover:scale-110 duration-1000"
                          alt={slide.titleEn}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                      )}
                    </div>

                    {/* 文字區域 */}
                    <div className="txt mt-2 flex-col flex justify-center items-center w-full mx-auto">
                      
                      {/* 🔥 重點修改：英文/中文標題切換 🔥 */}
                      <div className="h-[60px] flex items-center justify-center w-full px-2">
                        {/* 預設顯示英文 */}
                        <b className="text-[18px] font-extrabold text-center uppercase block group-hover:hidden transition-all duration-300 line-clamp-2">
                          {slide.titleEn}
                        </b>
                        {/* Hover 時顯示中文 */}
                        <b className="text-[18px] font-extrabold text-center hidden group-hover:block transition-all duration-300 text-rose-500 line-clamp-2">
                          {slide.titleZh}
                        </b>
                      </div>

                      <p className="text-[14px] text-gray-500 font-bold text-center mt-2">
                        {slide.price}
                      </p>

                      <span
                        className="mt-4 text-black px-4 py-2 text-[14px] rounded-[3px] hover:text-white hover:bg-rose-500 duration-300 border border-black transition-colors"
                      >
                        Buy Now
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls absolute bottom-0 left-6 grid grid-cols-[auto_1fr] justify-between flex inline-block border border-black gap-3 mt-7 bg-white px-2 py-1 rounded-full z-10">
        <div className="embla__buttons flex justify-center">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots flex items-center">
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

      <div
        ref={dragIndicatorRef}
        className="drag-indicator fixed pointer-events-none rounded-full text-white bg-black flex items-center justify-center z-50"
        style={{
          opacity: 0,
          scale: 0.5,
          width: "100px",
          height: "100px",
          fontSize: "20px",
          top: 0, 
          left: 0 
        }}
      >
        拖曳
      </div>
    </div>
  );
};

export default EmblaCarousel;