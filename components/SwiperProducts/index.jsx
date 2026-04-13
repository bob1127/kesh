"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 圖片資料
const slides = [
  {
    id: 1,
    image:
      "https://img07.shop-pro.jp/PA01372/068/etc_base64/MjRDVUxFVF9PTF90b3BfSGlyb3Rha2FfMDMyMQ.jpg?cmsp_timestamp=20240327182604",
    title: "NAOKO OGAWA", // 這張是很白的圖片，影片中的白色區塊就是它
    position: "bottom-right",
  },
  {
    id: 2,
    image:
      "https://img07.shop-pro.jp/PA01372/068/etc_base64/VE1fUENfMjAyNTA5XzI.jpg?cmsp_timestamp=20251027152717",
    title: "Hirotaka",
    position: "top-left",
  },
  {
    id: 3,
    image:
      "https://img07.shop-pro.jp/PA01372/068/etc_base64/MjNDVUxFVF9PTF90b3BfdGFsa2F0aXZlXzAyMjQ.jpg?cmsp_timestamp=20240818182413",
    title: "ALIITA",
    position: "bottom-right",
  },
  {
    id: 4,
    image:
      "https://img07.shop-pro.jp/PA01372/068/etc_base64/QUxMSVRBLTI.png?cmsp_timestamp=20250502093207",
    title: "NOUE",
    position: "center",
  },
];

// 定義一個「虛擬視窗」的範圍，只渲染當前索引 前後各2張 (共5張)
// 這樣足夠覆蓋螢幕，且不會有效能問題
const visibleRange = [-2, -1, 0, 1, 2];

const HeroSwiperInfinite = () => {
  // 初始索引設為一個較大的數字，確保往回滑也有足夠的緩衝
  const [index, setIndex] = useState(2000);
  const [isDragging, setIsDragging] = useState(false);

  // 計算真實的 active slide 索引 (用於下方進度條顯示)
  // 使用 ((n % m) + m) % m 公式處理負數
  const activeIndex = ((index % slides.length) + slides.length) % slides.length;

  const paginate = useCallback((direction) => {
    setIndex((prev) => prev + direction);
  }, []);

  // 自動播放
  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 4500); // 稍微調快一點點節奏
    return () => clearInterval(timer);
  }, [paginate, isDragging]);

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] bg-white overflow-hidden flex flex-col justify-center select-none">
      {/* 輪播核心區 */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 我們只 map "相對位置"，而不是 map 整個 slides array */}
        {visibleRange.map((offset) => {
          // 計算當前這個 offset 對應的「虛擬索引」
          const virtualIndex = index + offset;

          // 計算這個虛擬索引對應到原始資料的哪一張圖 (0, 1, 2, 3)
          const slideIndex =
            ((virtualIndex % slides.length) + slides.length) % slides.length;
          const slide = slides[slideIndex];

          // 核心狀態判定
          const isCenter = offset === 0;

          return (
            <motion.div
              // KEY 是最關鍵的！
              // 使用 virtualIndex 作為 key，讓 React 知道這是一個「全新的位置」，
              // 而不是試圖把舊的 DOM 瞬移過來。這解決了所有閃爍和回捲 bug。
              key={virtualIndex}
              className="absolute top-0 h-full w-[85%] md:w-[65%] shrink-0 will-change-transform"
              // 初始狀態：如果它剛進入視窗 (offset 2 或 -2)，給它一個初始位置
              initial={{ x: `${(offset + (offset > 0 ? 1 : -1)) * 100}%` }}
              // 動畫目標：根據 offset 移動
              // offset 0 = 中間, 1 = 右邊一個寬度, -1 = 左邊一個寬度
              animate={{
                x: `${offset * 100}%`,
                zIndex: isCenter ? 20 : 10, // 中間層級高
                scale: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 30, // 阻尼設高一點，讓滑動更穩，不要過度彈跳
                mass: 1,
              }}
              // 拖曳設定
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.05}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(e, { offset: dragOffset, velocity }) => {
                setIsDragging(false);
                const swipe = Math.abs(dragOffset.x) * velocity.x;
                // 判斷滑動方向
                if (swipe < -200 || dragOffset.x < -100) {
                  paginate(1);
                } else if (swipe > 200 || dragOffset.x > 100) {
                  paginate(-1);
                }
              }}
            >
              <div className="relative w-full h-full overflow-hidden">
                {/* 圖片 */}
                <div className="relative w-full h-full">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={isCenter} // 只有中間那張優先載入
                    className="object-cover"
                    draggable={false}
                    sizes="(max-width: 768px) 85vw, 65vw"
                  />
                </div>

                {/* 遮罩：兩側半透明白，中間全透明 */}
                <motion.div
                  className="absolute inset-0 bg-white pointer-events-none"
                  initial={false}
                  animate={{
                    opacity: isCenter ? 0 : 0.6,
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* 文字：根據 position 屬性擺放，並只在 isCenter 時顯示 */}
                <div
                  className={`absolute inset-0 p-8 md:p-16 flex pointer-events-none ${
                    slide.position === "center"
                      ? "justify-center items-center"
                      : slide.position === "top-left"
                      ? "justify-start items-start"
                      : "justify-end items-end"
                  }`}
                >
                  <motion.h2
                    className="text-2xl md:text-4xl font-serif tracking-widest text-gray-800 uppercase"
                    animate={{
                      opacity: isCenter ? 1 : 0,
                      y: isCenter ? 0 : 20,
                    }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {slide.title}
                  </motion.h2>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 底部進度條 - 樣式優化 */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center items-center z-30">
        <div className="flex gap-4 items-center">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                // 計算最短路徑跳轉
                let diff = idx - activeIndex;
                if (diff > slides.length / 2) diff -= slides.length;
                if (diff < -slides.length / 2) diff += slides.length;
                setIndex(index + diff);
              }}
              className="group py-4 cursor-pointer"
            >
              <div
                className={`h-[2px] transition-all duration-500 ease-out ${
                  idx === activeIndex
                    ? "w-10 bg-gray-800"
                    : "w-4 bg-gray-300 group-hover:bg-gray-400"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 左右箭頭 */}
      <div className="absolute inset-0 pointer-events-none flex justify-between items-center px-4 md:px-10 z-40">
        <button
          onClick={() => paginate(-1)}
          className="pointer-events-auto p-3 rounded-full hover:bg-white/80 transition-colors text-gray-500 hover:text-gray-900 bg-white/40 backdrop-blur-sm"
        >
          <ChevronLeft size={32} strokeWidth={1} />
        </button>
        <button
          onClick={() => paginate(1)}
          className="pointer-events-auto p-3 rounded-full hover:bg-white/80 transition-colors text-gray-500 hover:text-gray-900 bg-white/40 backdrop-blur-sm"
        >
          <ChevronRight size={32} strokeWidth={1} />
        </button>
      </div>
    </section>
  );
};

export default HeroSwiperInfinite;
