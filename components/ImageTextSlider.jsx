"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageReveal from "./ImageReveal";
// 🔥 1. 引入 useTranslation
import { useTranslation } from "next-i18next";

// ✅ 修改：將純圖片的設定抽離出來，不再包含文字
const imageConfig = [
  {
    translationKey: "item1", // 用來對應 JSON 裡面的 key
    mainImages: [
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_2.jpg",
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_5.jpg",
    ],
    subImages: [
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_9.jpg",
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_18.jpg",
    ],
  },
  {
    translationKey: "item2",
    mainImages: [
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_14.jpg",
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_4.jpg",
    ],
    subImages: [
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_8.jpg",
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_13.jpg",
    ],
  },
  {
    translationKey: "item3",
    mainImages: [
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_27.jpg",
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_26.jpg",
    ],
    subImages: [
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_28.jpg",
      "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_23.jpg",
    ],
  },
];

export default function ImageTextSlider({
  autoplay = true,
  interval = 5000,
  pauseOnHover = true,
}) {
  // 🔥 2. 初始化翻譯 Hook
  const { t } = useTranslation("common");

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const isHoveringRef = useRef(false);

  const total = imageConfig.length;

  const go = useCallback(
    (dir = 1) => {
      setIndex((p) => {
        const next = (p + dir + total) % total;
        return next;
      });
    },
    [total],
  );

  const next = useCallback(() => {
    go(1);
    restartTimer();
  }, [go]);

  const prev = useCallback(() => {
    go(-1);
    restartTimer();
  }, [go]);

  const startTimer = useCallback(() => {
    if (!autoplay || interval <= 0) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      if (pauseOnHover && isHoveringRef.current) return;
      go(1);
    }, interval);
  }, [autoplay, interval, pauseOnHover, go]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restartTimer = useCallback(() => {
    clearTimer();
    startTimer();
  }, [clearTimer, startTimer]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  const onMouseEnter = () => {
    if (!pauseOnHover) return;
    isHoveringRef.current = true;
  };
  const onMouseLeave = () => {
    if (!pauseOnHover) return;
    isHoveringRef.current = false;
  };

  // 🔥 3. 取得當前的圖片設定與對應的翻譯資料
  const currentConfig = imageConfig[index];
  const [leftSrc, rightSrc] = currentConfig.mainImages;

  // 組合翻譯 Key，例如: "guarantees.item1"
  const tKey = `guarantees.${currentConfig.translationKey}`;

  return (
    <div
      className="relative w-[95%] mx-auto lg:flex-row flex-col flex section-part gap-6"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className=" w-full lg:w-[65%] grid py-3 grid-cols-2 gap-4">
        <div className="relative aspect-[3/3.5] overflow-hidden">
          <ImageReveal
            key={`slide-${index}-left`}
            src={leftSrc}
            alt={`${t(`${tKey}.title`)}-left`}
            className="h-full"
            delay={0}
            duration={2.2}
            fromScale={1.28}
            toScale={1}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="relative aspect-[3/3.5] overflow-hidden">
          <ImageReveal
            key={`slide-${index}-right`}
            src={rightSrc}
            alt={`${t(`${tKey}.title`)}-right`}
            className="h-full"
            delay={0.12}
            duration={2.2}
            fromScale={1.28}
            toScale={1}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </div>

      <div className=" w-full lg:w-[35%] py-3 px-3 sm:px-10 flex flex-col items-start justify-end relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={tKey}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="title flex justify-between w-full">
              <div>
                {/* 🔥 4. 使用翻譯變數渲染文字 */}
                <h3 className="font-bold text-[1.8rem]">
                  {t(`${tKey}.title`)}
                </h3>
                <p className="text-[.85rem] text-gray-600">
                  {t(`${tKey}.subtitle`)}
                </p>
              </div>
              <div className="text-[.8rem] text-gray-600 tracking-wider">
                {t(`${tKey}.price`)}
              </div>
            </div>

            <div className="content mt-8">
              <h4 className="font-bold text-[1.4rem]">
                {t(`${tKey}.description`)}
              </h4>
              <p className="tracking-wider text-[.9rem] my-3 leading-loose text-gray-700">
                {t(`${tKey}.detail`)}
              </p>
            </div>

            <div className="img-wrap flex flex-row mt-4">
              {currentConfig.subImages.filter(Boolean).map((img, i) => (
                <div key={i} className="w-1/2 px-1">
                  <Image
                    src={img}
                    alt={`sub-${i + 1}`}
                    width={400}
                    height={300}
                    className="w-full object-cover aspect-[4/3]"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-0 right-0 flex gap-2">
          <button
            onClick={prev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="上一個"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="下一個"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
