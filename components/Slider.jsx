"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const slides = [
  {
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_7.jpg",
  },
  {
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_29.jpg",
  },
  {
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_12.jpg",
  },
];

export default function Slider() {
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const titleRef = useRef(null);
  const indicatorsRef = useRef([]);
  const timerRef = useRef(null);

  useGSAP(
    () => {
      let currentIndex = 0;
      let isAnimating = false;

      const slideDuration = 4; // 自動輪播停留時間 (秒)
      const transitionDuration = 1.5; // 淡入淡出過場時間 (秒)
      const scaleDuration = 12; // 圖片持續收縮時間
      const scaleStart = 1.08; // 🔥 收縮幅度加大 (從 1.08 縮小到 1)

      function animateSlide(nextIndex) {
        if (isAnimating || nextIndex === currentIndex) return;
        isAnimating = true;

        const currentImg = imagesRef.current[currentIndex];
        const nextImg = imagesRef.current[nextIndex];

        // 這是「切換」的時間軸，不包含圖片縮放
        const tl = gsap.timeline({
          onComplete: () => {
            isAnimating = false;
            currentIndex = nextIndex;
            startAutoplay(); // 切換過場一結束，立刻開始倒數下一張
          },
        });

        // 圖片層級設定
        gsap.set(nextImg, { zIndex: 2 });
        gsap.set(currentImg, { zIndex: 1 });

        // 舊圖片淡出 (此時舊圖片的 scale 動畫仍在獨立運行，不會靜止)
        tl.to(
          currentImg,
          { opacity: 0, duration: transitionDuration, ease: "power2.inOut" },
          0,
        );

        // 新圖片設定為較明顯的放大 (1.08)，並淡入
        gsap.set(nextImg, { scale: scaleStart, opacity: 0 });
        tl.to(
          nextImg,
          { opacity: 1, duration: transitionDuration, ease: "power2.inOut" },
          0,
        );

        // 使用獨立的 gsap.to 控制收縮，讓它突破時間軸的限制，持續收縮！
        gsap.to(nextImg, { scale: 1, duration: scaleDuration, ease: "none" });

        // ==========================================
        // 文字乾淨切換 (無多餘特效，單純淡入淡出)
        // ==========================================
        if (titleRef.current) {
          const currentTitle = titleRef.current.querySelector(
            `div[data-index="${currentIndex}"]`,
          );
          const nextTitle = titleRef.current.querySelector(
            `div[data-index="${nextIndex}"]`,
          );

          // 隱藏所有其他文字層
          const allTitleDivs =
            titleRef.current.querySelectorAll(".title-group");
          gsap.set(allTitleDivs, { zIndex: 1 });
          gsap.set(nextTitle, { zIndex: 2 });

          // 舊文字淡出，新文字淡入
          tl.to(
            currentTitle,
            {
              autoAlpha: 0,
              duration: transitionDuration,
              ease: "power2.inOut",
            },
            0,
          );
          gsap.set(nextTitle, { autoAlpha: 0 });
          tl.to(
            nextTitle,
            {
              autoAlpha: 1,
              duration: transitionDuration,
              ease: "power2.inOut",
            },
            0,
          );
        }

        // ==========================================
        // 右側導覽圓點動畫
        // ==========================================
        indicatorsRef.current.forEach((ind, i) => {
          const ring = ind.querySelector(".ring");
          if (i === nextIndex) {
            gsap.to(ind, { opacity: 1, duration: 0.3 }, 0);
            gsap.to(
              ring,
              { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
              0,
            );
          } else {
            gsap.to(ind, { opacity: 0.4, duration: 0.3 }, 0);
            gsap.to(ring, { scale: 0, opacity: 0, duration: 0.3 }, 0);
          }
        });
      }

      function startAutoplay() {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          animateSlide((currentIndex + 1) % slides.length);
        }, slideDuration * 1000);
      }

      // ==========================================
      // 初始化第一張設定
      // ==========================================
      gsap.set(imagesRef.current, { opacity: 0 });
      gsap.set(imagesRef.current[0], {
        opacity: 1,
        scale: scaleStart,
        zIndex: 2,
      });

      // 第一張圖開始獨立的緩慢收縮
      gsap.to(imagesRef.current[0], {
        scale: 1,
        duration: scaleDuration,
        ease: "none",
      });

      // 導覽圓點初始化
      indicatorsRef.current.forEach((ind, i) => {
        const ring = ind.querySelector(".ring");
        if (i === 0) {
          gsap.set(ind, { opacity: 1 });
          gsap.set(ring, { scale: 1, opacity: 1 });
        } else {
          gsap.set(ind, { opacity: 0.4 });
          gsap.set(ring, { scale: 0, opacity: 0 });
        }
      });

      // 文字初始化 (直接顯示，無進場特效)
      if (titleRef.current) {
        const allTitleDivs = titleRef.current.querySelectorAll(".title-group");
        gsap.set(allTitleDivs, { autoAlpha: 0 });
        gsap.set(allTitleDivs[0], { autoAlpha: 1, zIndex: 2 });
      }

      startAutoplay();

      return () => {
        clearTimeout(timerRef.current);
      };
    },
    { scope: containerRef },
  );

  return (
    <>
      <style>{`
        .hero-container {
          position: relative;
          width: 100%;
          height: 100svh;
          overflow: hidden;
          background-color: #000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #fff;
        }

        .slide-image {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          will-change: transform, opacity;
        }
        .slide-image img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.25);
          z-index: 10;
          pointer-events: none;
        }

        /* 左上角 Logo */
        .top-left-logo {
          position: absolute;
          top: 2.5rem; left: 3rem;
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .top-left-logo .logo-main {
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }
        .top-left-logo .logo-sub {
          font-size: 0.6rem;
          letter-spacing: 0.15em;
          opacity: 0.8;
        }

        /* 右上角 藍色標籤 */
        .top-right-badge {
          position: absolute;
          top: 2.5rem; right: 0;
          z-index: 20;
          background-color: #2b65f6;
          padding: 0.6rem 1.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        /* 正中央 標題 */
        .center-title {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          text-align: center;
          width: 100%;
        }
        .title-group {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        }
        .title-group .ja {
          display: block;
          font-size: clamp(1.8rem, 3.5vw, 3rem);
          font-weight: 700;
          letter-spacing: 0.15em;
          margin-bottom: 1rem;
          text-shadow: 0px 4px 15px rgba(0, 0, 0, 0.4);
        }
        .title-group .en {
          display: block;
          font-size: clamp(1.2rem, 2vw, 1.8rem);
          font-weight: 700;
          letter-spacing: 0.05em;
          text-shadow: 0px 4px 15px rgba(0, 0, 0, 0.4);
        }

        /* 左下角 */
        .bottom-left-text {
          position: absolute;
          bottom: 2.5rem; left: 3rem;
          z-index: 20;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .bottom-left-text .underline {
          border-bottom: 1px solid #fff;
          padding-bottom: 2px;
          margin-right: 6px;
        }

        /* 右下角 Scroll */
        .bottom-right-scroll {
          position: absolute;
          bottom: 2.5rem; right: 3rem;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          opacity: 0.8;
        }
        .bottom-right-scroll .arrow-circle {
          width: 24px; height: 24px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.5rem;
        }

        /* 右側中央 導覽點 */
        .side-indicators {
          position: absolute;
          right: 3rem; top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .indicator-item {
          position: relative;
          width: 16px; height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .indicator-item .dot {
          width: 3px; height: 3px;
          background-color: #fff;
          border-radius: 50%;
        }
        .indicator-item .ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .top-left-logo { top: 1.5rem; left: 1.5rem; }
          .top-right-badge { top: 1.5rem; padding: 0.4rem 1rem; }
          .bottom-left-text { bottom: 1.5rem; left: 1.5rem; font-size: 0.65rem; }
          .bottom-right-scroll { display: none; }
          .side-indicators { right: 1.5rem; }
        }
      `}</style>

      <section className="hero-container" ref={containerRef}>
        <div className="images-wrapper">
          {slides.map((slide, idx) => (
            <div
              key={`img-${idx}`}
              className="slide-image"
              ref={(el) => (imagesRef.current[idx] = el)}
            >
              <img src={slide.image} alt="Hero Banner" />
            </div>
          ))}
        </div>
        <div className="overlay"></div>

        <div className="top-left-logo">
          <span className="logo-main">Taichung, Taiwan</span>
          <span className="logo-sub">KÉSH de¹ 凱仕國際精品</span>
        </div>

        <div className="top-right-badge">UPDATED. 2022.09.30 FRI — Taiwan</div>

        <div className="center-title" ref={titleRef}>
          {slides.map((slide, idx) => (
            <div key={`title-${idx}`} className="title-group" data-index={idx}>
              <span className="text-[50px] tracking-widest !font-normal">
                Exquisite Detail
              </span>
              <br></br>
              <span className="text-[32px] tracking-widest !font-normal">
                {" "}
                Exceptional Quality.
              </span>
            </div>
          ))}
        </div>

        <div className="bottom-left-text">
          <span className="underline">NEW WORK STYLE</span>
          <span>
            from <strong> by Kesh</strong>
          </span>
        </div>

        <div className="bottom-right-scroll">
          SCROLL FOR CONTENTS
          <div className="arrow-circle">↓</div>
        </div>

        <div className="side-indicators">
          {slides.map((_, idx) => (
            <div
              key={`ind-${idx}`}
              className="indicator-item"
              ref={(el) => (indicatorsRef.current[idx] = el)}
            >
              <div className="dot"></div>
              <div className="ring"></div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
