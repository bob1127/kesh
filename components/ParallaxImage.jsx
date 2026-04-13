"use client";
import React, { useRef, useEffect, useMemo } from "react";
import { useLenis } from "@studio-freight/react-lenis";

const lerp = (start, end, factor) => start + (end - start) * factor;

const ParallaxImage = ({ src, alt }) => {
  const containerRef = useRef(null); // 新增：用來抓取外框位置
  const mediaRef = useRef(null); // 用來控制圖片/影片移動
  const bounds = useRef(null);
  const currentTranslateY = useRef(0);
  const targetTranslateY = useRef(0);
  const rafId = useRef(null);

  // 判斷是否為影片
  const isVideo = useMemo(() => {
    if (!src) return false;
    return src.match(/\.(mp4|webm|ogg|mov)$/i);
  }, [src]);

  useEffect(() => {
    const updateBounds = () => {
      // 修改：計算邊界時使用 containerRef (外框)，因為外框位置是固定的
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        bounds.current = {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
        };
      }
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);

    // 監聽載入事件確保佈局完成
    if (mediaRef.current) {
      mediaRef.current.addEventListener("load", updateBounds);
      mediaRef.current.addEventListener("loadedmetadata", updateBounds);
    }

    const animate = () => {
      if (mediaRef.current) {
        currentTranslateY.current = lerp(
          currentTranslateY.current,
          targetTranslateY.current,
          0.1
        );

        if (
          Math.abs(currentTranslateY.current - targetTranslateY.current) > 0.01
        ) {
          mediaRef.current.style.transform = `translateY(${currentTranslateY.current}px)`;
        }
      }
      rafId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateBounds);
      if (mediaRef.current) {
        mediaRef.current.removeEventListener("load", updateBounds);
        mediaRef.current.removeEventListener("loadedmetadata", updateBounds);
      }
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [src]);

  useLenis(({ scroll }) => {
    if (!bounds.current) return;
    const relativeScroll = scroll - bounds.current.top;
    targetTranslateY.current = relativeScroll * 0.1;
  });

  const commonStyles = {
    willChange: "transform",
    transform: "translateY(0)",
  };

  // 修改 CSS 重點：
  // 1. absolute inset-0: 脫離文檔流，填滿容器
  // 2. h-[120%]: 高度設為 120%，多出的 20% 用來做視差移動而不穿幫
  // 3. -top-[10%]: 往上拉 10%，讓圖片預設居中，上下各有多餘空間可移動
  // 4. object-cover: 強制填滿並裁切，不變形
  const commonClasses =
    "absolute -top-[10%] left-0 w-full h-[120%] object-cover block";

  return (
    // 外層容器：
    // h-full: 繼承父層高度 (例如 h-[50vh])
    // relative overflow-hidden: 裁切掉 h-[120%] 多出的部分
    <div ref={containerRef} className="w-full h-full overflow-hidden relative">
      {isVideo ? (
        <video
          ref={mediaRef}
          src={src}
          className={commonClasses}
          style={commonStyles}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          ref={mediaRef}
          src={src}
          alt={alt}
          className={commonClasses}
          style={commonStyles}
        />
      )}
    </div>
  );
};

export default ParallaxImage;
