import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

const FullScreenSlider = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(0);

  const slidesRef = useRef([]);
  const progressBarRef = useRef(null);
  const ctxRef = useRef(null);
  const timerRef = useRef(null);

  const slideDuration = 5000;
  const transitionDuration = 1.5;

  // 1. 初始化
  useEffect(() => {
    if (slidesRef.current[0]) {
      gsap.set(slidesRef.current[0], {
        clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
        zIndex: 2,
      });
      slidesRef.current.forEach((slide, i) => {
        if (i !== 0 && slide) {
          gsap.set(slide, {
            clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
            zIndex: 1,
          });
        }
      });
      gsap.set(".slide-text-group", { y: 0, opacity: 1 });
    }
  }, []);

  // 2. 啟動進度條
  const startProgressBar = useCallback(() => {
    if (timerRef.current) timerRef.current.kill();

    timerRef.current = gsap.fromTo(
      progressBarRef.current,
      { width: "0%" },
      {
        width: "100%",
        duration: slideDuration / 1000,
        ease: "none",
        onComplete: () => {
          goToNextSlide();
        },
      }
    );
  }, [slideDuration]);

  // 3. 換頁邏輯
  const goToNextSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;

    const currentIdx = indexRef.current;
    const nextIdx = (currentIdx + 1) % slides.length;

    const currentSlide = slidesRef.current[currentIdx];
    const nextSlide = slidesRef.current[nextIdx];

    if (!currentSlide || !nextSlide) return;

    startProgressBar();

    const tl = gsap.timeline({
      onStart: () => {
        gsap.set(nextSlide, { zIndex: 2 });
        gsap.set(currentSlide, { zIndex: 1 });
      },
      onComplete: () => {
        indexRef.current = nextIdx;
        setCurrentIndex(nextIdx);
        gsap.set(currentSlide, {
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        });
      },
    });

    // --- 動畫流程 ---

    // 1. 文字退場
    tl.to(
      ".slide-text-group",
      {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
      },
      0
    );

    // 2. 舊圖退場 (舊圖稍微放大淡出)
    const currentImg = currentSlide.querySelector("img");
    tl.to(
      currentImg,
      {
        scale: 1.15, // 輕微放大，營造流動感
        duration: transitionDuration,
        ease: "power2.inOut",
      },
      0
    );

    // 3. 新圖進場
    const nextImg = nextSlide.querySelector("img");

    // ★ 動畫修正：因為是 object-cover，我們改用 Scale 為主
    // 這樣在不同裝置上都不會露出黑邊
    gsap.set(nextImg, { scale: 1.15 });

    tl.fromTo(
      nextSlide,
      { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
      {
        clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
        duration: transitionDuration,
        ease: "power4.inOut",
      },
      0
    );

    // 新圖從 1.15 倍縮回 1 倍 (緩慢聚焦效果)
    tl.to(
      nextImg,
      {
        scale: 1,
        duration: transitionDuration,
        ease: "power2.out",
      },
      0
    );

    // 4. 文字進場
    tl.to(
      ".slide-text-group",
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      },
      "-=0.5"
    );
  }, [slides, startProgressBar, transitionDuration]);

  // 4. Mount 後啟動
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    ctxRef.current = gsap.context(() => {
      startProgressBar();
    });
    return () => {
      if (ctxRef.current) ctxRef.current.revert();
      if (timerRef.current) timerRef.current.kill();
    };
  }, [slides, startProgressBar]);

  if (!slides || slides.length === 0) return <div>No Slides</div>;

  const currentSlideData = slides[currentIndex] || slides[0];

  return (
    <div className="relative w-screen h-[95vh] overflow-hidden bg-black">
      {/* 裝飾文字 */}
      <div className="txt w-full text-[rgb(213,213,213)] pointer-events-none">
        <p className="text-[#f3f3f3] leading-[15px] z-[50] w-1/2 absolute bottom-[50px] left-[126px] font-light">
          Lorem ipsum, dolor sit amet <br /> consectetur adipisicing elit.
        </p>
      </div>

      {/* 中央資訊區 */}
      <div className="slider-content z-[40] pointer-events-none slide-text-group">
        <div className="slide-name absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-white uppercase text-lg mix-blend-difference">
          <div className="flex flex-col items-center">
            <div>{currentSlideData.name}</div>
          </div>
        </div>
        <div className="slide-year absolute top-1/2 right-1/5 transform -translate-x-1/2 -translate-y-1/2 text-white uppercase text-[32px] mix-blend-difference">
          <div className="flex flex-col items-center">
            <div>{currentSlideData.year}</div>
          </div>
        </div>
      </div>

      {/* 圖片區域 */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            ref={(el) => (slidesRef.current[idx] = el)}
            className="slide absolute top-0 left-0 w-full h-full bg-black"
            style={{
              clipPath:
                idx === 0
                  ? "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)"
                  : "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
              zIndex: idx === 0 ? 2 : 1,
            }}
          >
            {/* 修改關鍵：
              1. w-full h-full: 確保容器被填滿 (解決手機黑邊)
              2. object-cover: 確保圖片填滿容器不變形 (解決黑邊)
              3. object-center: 確保包包主體在中間 (解決過度裁切)
              4. md:object-cover: 電腦版也維持滿版
            */}
            <img
              src={slide.src}
              alt={slide.name}
              className="w-full h-full object-cover object-center relative block"
            />
          </div>
        ))}
      </div>

      {/* Timeline (奢華版) */}
      <div className="progress-container absolute bottom-8 right-8 z-[60] flex items-center gap-4 px-5 py-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 hover:bg-black/40">
        <span className="text-xs font-light tracking-widest text-white/80 select-none">
          {String(currentIndex + 1).padStart(2, "0")}
        </span>
        <div className="relative w-32 h-[1px] bg-white/20">
          <div
            ref={progressBarRef}
            className="absolute top-0 left-0 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: "0%" }}
          ></div>
        </div>
        <span className="text-xs font-light tracking-widest text-white/40 select-none">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

export default FullScreenSlider;
