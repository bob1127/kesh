import React, { useCallback, useEffect, useState } from "react";

export const usePrevNextButtons = (emblaApi, onButtonClick) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    if (onButtonClick) onButtonClick(emblaApi);
  }, [emblaApi, onButtonClick]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    if (onButtonClick) onButtonClick(emblaApi);
  }, [emblaApi, onButtonClick]);

  const onSelect = useCallback((embla) => {
    setPrevBtnDisabled(!embla.canScrollPrev());
    setNextBtnDisabled(!embla.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

export const PrevButton = (props) => {
  const { children, className = "", disabled, ...restProps } = props;

  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        embla__button embla__button--prev group
        inline-flex items-center gap-2
        text-xs md:text-sm tracking-wide
        transition-colors duration-200
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      {...restProps}
    >
      <div
        className={`
          w-[28px] h-[28px] md:w-[32px] md:h-[32px]
          rounded-full border border-black
          flex justify-center items-center
          bg-white
          transition-all duration-200
          ${disabled ? "" : "group-hover:-translate-x-0.5 group-hover:bg-black"}
        `}
      >
        <span
          className={`
            text-[12px]
            transition-colors duration-200
            ${disabled ? "text-black" : "group-hover:text-white"}
          `}
        >
          ←
        </span>
      </div>
      <span className="hidden md:inline-block">Prev</span>
      {children}
    </button>
  );
};

export const NextButton = (props) => {
  const { children, className = "", disabled, ...restProps } = props;

  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        embla__button embla__button--next group
        inline-flex items-center gap-2
        text-xs md:text-sm tracking-wide
        transition-colors duration-200
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      {...restProps}
    >
      <div
        className={`
          w-[28px] h-[28px] md:w-[32px] md:h-[32px]
          rounded-full border border-black
          flex justify-center items-center
          bg-white
          transition-all duration-200
          ${disabled ? "" : "group-hover:translate-x-0.5 group-hover:bg-black"}
        `}
      >
        <span
          className={`
            text-[12px]
            transition-colors duration-200
            ${disabled ? "text-black" : "group-hover:text-white"}
          `}
        >
          →
        </span>
      </div>
      <span className="hidden md:inline-block">Next</span>
      {children}
    </button>
  );
};
