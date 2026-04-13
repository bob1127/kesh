import React, { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { NextButton, PrevButton } from "./EmblaCarouselArrowButtons"; // ✅ 只留 Button，不要 import hook

import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
// import Styles from "../../styles/embla.module.css";

const TWEEN_FACTOR_BASE = 0.52;
const usePrevNextButtons = (emblaApi) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  const onPrevButtonClick = React.useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const onNextButtonClick = React.useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // 初始狀態
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

const numberWithinRange = (number, min, max) =>
  Math.min(Math.max(number, min), max);

const EmblaCarousel = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef([]);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi) => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".embla__slide__number");
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenScale = useCallback((emblaApi, eventName) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = eventName === "scroll";

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            }
          });
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
        const scale = numberWithinRange(tweenValue, 0, 1).toString();
        const tweenNode = tweenNodes.current[slideIndex];
        tweenNode.style.transform = `scale(${scale})`;
      });
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenScale(emblaApi);

    emblaApi
      .on("reInit", setTweenNodes)
      .on("reInit", setTweenFactor)
      .on("reInit", tweenScale)
      .on("scroll", tweenScale)
      .on("slideFocus", tweenScale);
  }, [emblaApi, tweenScale]);

  return (
    <div
      className=""
      style={{
        "--slide-height": "19rem",
        "--slide-spacing": "1rem",
        "--slide-size": "60%",
      }}
    >
      <div className="embla__controls  grid grid-cols-[auto_1fr] justify-between gap-[1.2rem] mt-[1.8rem]">
        <div className="embla__buttons sm:grid hidden   grid-cols-2 gap-[0.6rem] items-center">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
      </div>
      <div className="embla__viewport overflow-hidden" ref={emblaRef}>
        <div
          className="embla__container flex touch-pan-y touch-pinch-zoom h-[400px] "
          style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}
        >
          {slides.map((slide, index) => (
            <div
              className=" embla__slide transform flex-none h-full min-w-0 "
              key={index}
              style={{
                transform: "translate3d(0, 0, 0)",
                flex: "0 0 var(--slide-size)",
                paddingLeft: "var(--slide-spacing)",
              }}
            >
              <div
                style={{
                  boxShadow: "inset 0 0 0 0.2rem var(--detail-medium-contrast)",
                  borderRadius: "1.8rem",
                  fontSize: "4rem",
                  height: "100%",
                  userSelect: "none",
                }}
                className="embla__slide__number  border-none !h-auto  border-gray-300 border-2 shadow-2xl md:border bg-[#e6f0ff] flex  py-[10px] md:border-black  items-center justify-center font-semibold"
              >
                {/* {index + 1} */}
                <div className="flex flex-col md:flex-row justify-center p-6 items-center ">
                  {slide.content ? (
                    slide.content // Render iframe or other HTML content directly
                  ) : (
                    <img
                      src={slide.image}
                      className="w-full md:w-1/2   rounded-xl"
                      alt={`Slide ${index + 1}`}
                    />
                  )}
                  <div className="txt mt-[20px]  flex-col flex justify-center items-center w-full md:w-1/2 mx-auto">
                    <b className="text-[22px] text-center">{slide.title}</b>
                    <p className="text-[14px] w-ful md:w-2/3 mx-auto font-normal text-center">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
