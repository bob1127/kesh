"use client";

import { useEffect, useRef, useState } from "react";

export default function MiniMapGallery({
  images: rawImages = [],
  currentIndex = 0,
  onClose,
}) {
  const images = rawImages.filter(
    (src) => typeof src === "string" && src.trim() !== ""
  );

  const containerRef = useRef(null);
  const itemsRef = useRef(null);
  const indicatorRef = useRef(null);
  const previewImageRef = useRef(null);
  const itemRefs = useRef([]);
  const animationFrameRef = useRef(null);

  const translateRef = useRef({ current: 0, target: 0, max: 0 });
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const dimensionsRef = useRef({
    itemSize: 0,
    indicatorSize: 0,
  });
  const activeItemOpacity = 0.3;
  const isClickMoveRef = useRef(false);

  const lerp = (start, end, factor) => start + (end - start) * factor;

  const updateDimensions = () => {
    const newIsHorizontal = window.innerWidth <= 900;
    const firstItem = itemRefs.current[0];
    if (!firstItem || !indicatorRef.current) return;

    const itemSize = newIsHorizontal
      ? firstItem.offsetWidth
      : firstItem.offsetHeight;
    const indicatorSize = newIsHorizontal
      ? indicatorRef.current.offsetWidth
      : indicatorRef.current.offsetHeight;

    dimensionsRef.current = { itemSize, indicatorSize };

    const totalSize = itemSize * images.length;
    translateRef.current.max = Math.max(0, totalSize - indicatorSize);
    setIsHorizontal(newIsHorizontal);
  };

  const getItemInIndicator = () => {
    itemRefs.current.forEach((item) => {
      const img = item?.querySelector("img");
      if (img) img.style.opacity = "1";
    });

    const indicatorStart = -translateRef.current.current;
    const indicatorEnd = indicatorStart + dimensionsRef.current.indicatorSize;

    let maxOverlap = 0;
    let selectedIndex = 0;

    itemRefs.current.forEach((_, index) => {
      const itemStart = index * dimensionsRef.current.itemSize;
      const itemEnd = itemStart + dimensionsRef.current.itemSize;
      const overlap = Math.max(
        0,
        Math.min(indicatorEnd, itemEnd) - Math.max(indicatorStart, itemStart)
      );
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        selectedIndex = index;
      }
    });

    const img = itemRefs.current[selectedIndex]?.querySelector("img");
    if (img) img.style.opacity = activeItemOpacity;

    return selectedIndex;
  };

  const updatePreviewImage = (index) => {
    if (images[index] && previewImageRef.current) {
      previewImageRef.current.src = images[index];
    }
    setCurrentImageIndex(index);
  };

  const animate = () => {
    const factor = isClickMoveRef.current ? 0.08 : 0.06;
    translateRef.current.current = lerp(
      translateRef.current.current,
      translateRef.current.target,
      factor
    );

    const transform = isHorizontal
      ? `translateX(${translateRef.current.current}px)`
      : `translateY(${translateRef.current.current}px)`;

    if (itemsRef.current) itemsRef.current.style.transform = transform;
    updatePreviewImage(getItemInIndicator());

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleItemClick = (index) => {
    isClickMoveRef.current = true;
    const offset =
      -index * dimensionsRef.current.itemSize +
      (dimensionsRef.current.indicatorSize - dimensionsRef.current.itemSize) /
        2;
    translateRef.current.target = Math.max(
      Math.min(offset, 0),
      -translateRef.current.max
    );
  };

  useEffect(() => {
    const container = containerRef.current;

    const handleWheel = (e) => {
      e.preventDefault();
      isClickMoveRef.current = false;
      const delta = e.deltaY;
      translateRef.current.target = Math.max(
        Math.min(translateRef.current.target - delta * 0.6, 0),
        -translateRef.current.max
      );
    };

    let touchStart = 0;
    const handleTouchStart = (e) => {
      touchStart = isHorizontal ? e.touches[0].clientX : e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const delta = isHorizontal
        ? touchStart - e.touches[0].clientX
        : touchStart - e.touches[0].clientY;

      translateRef.current.target = Math.max(
        Math.min(translateRef.current.target - delta, 0),
        -translateRef.current.max
      );
      touchStart = isHorizontal ? e.touches[0].clientX : e.touches[0].clientY;
      e.preventDefault();
    };

    const handleResize = () => {
      updateDimensions();
    };

    container?.addEventListener("wheel", handleWheel, { passive: false });
    container?.addEventListener("touchstart", handleTouchStart);
    container?.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    window.addEventListener("resize", handleResize);

    updateDimensions();
    updatePreviewImage(currentIndex);

    // ✅ 初始定位黑框（核心修正）
    const offset =
      -currentIndex * dimensionsRef.current.itemSize +
      (dimensionsRef.current.indicatorSize - dimensionsRef.current.itemSize) /
        2;

    // 限制 offset 最大不能超過 0（即：不能滾到 0 號圖前的空白）
    const safeOffset = Math.min(0, Math.max(offset, -translateRef.current.max));

    translateRef.current.target = safeOffset;
    translateRef.current.current = safeOffset;

    translateRef.current.current = translateRef.current.target;
    const transform = isHorizontal
      ? `translateX(${translateRef.current.current}px)`
      : `translateY(${translateRef.current.current}px)`;
    if (itemsRef.current) itemsRef.current.style.transform = transform;

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      container?.removeEventListener("wheel", handleWheel);
      container?.removeEventListener("touchstart", handleTouchStart);
      container?.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isHorizontal]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#f1efe7] z-50 overflow-hidden"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-black text-2xl z-50"
      >
        ✕
      </button>
      <div className="absolute top-[45%] left-1/2 w-[75%] h-[50%] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
        <img
          ref={previewImageRef}
          src={images[currentImageIndex]}
          alt="preview"
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className={`absolute flex items-center ${
          isHorizontal
            ? "bottom-20 left-1/2 -translate-x-1/2 h-[80px] flex-row"
            : "right-20 top-1/2 -translate-y-1/2 w-[80px] flex-col"
        }`}
      >
        <div
          className={`${
            isHorizontal ? "w-[60px] h-full" : "w-full h-[60px]"
          } border border-black z-10`}
          ref={indicatorRef}
        ></div>
        <div
          className={`flex ${isHorizontal ? "flex-row" : "flex-col"}`}
          ref={itemsRef}
        >
          {images.map((src, index) => (
            <div
              key={src + index}
              className={`${
                isHorizontal ? "w-[60px] h-full" : "h-[60px] w-full"
              } p-1 cursor-pointer`}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={() => handleItemClick(index)}
            >
              <img
                src={src}
                alt={`img-${index}`}
                className="w-full h-full object-cover transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
