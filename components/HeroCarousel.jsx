"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/dist/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

const FALLBACK_SLIDES = [
  {
    type: "image",
    src: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_7.jpg",
    title: "LUXURY BOUTIQUE",
    category: "KÉSH DE¹",
    alt: "KÉSH de¹ Luxury Boutique",
  },
];

const PickleballAnimation = () => {
  const wrapperRef = useRef(null);
  const carouselImagesRef = useRef(null);
  const textTitleRef = useRef(null);
  const textCategoryRef = useRef(null);

  // 先用本地圖立刻呈現，避免黑底 Loading
  const [slides, setSlides] = useState(FALLBACK_SLIDES);

  const isFetched = useRef(false);

  const stateRef = useRef({
    currentIndex: 0,
    isAnimating: false,
    slideOffset: 500,
    autoPlayTimer: null,
  });

  // ==========================================
  // 1. API 抓取輪播（失敗則維持本地預設圖）
  // ==========================================
  useEffect(() => {
    if (typeof window === "undefined" || isFetched.current) return;
    isFetched.current = true;

    const fetchSlides = async () => {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
      const targetUrl = `${BACKEND_URL}/store/custom/hero-slides?t=${Date.now()}`;

      try {
        const headers = { "Content-Type": "application/json" };
        if (API_KEY) headers["x-publishable-api-key"] = API_KEY;

        const res = await fetch(targetUrl, { headers, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        let fetchedSlides = [];

        if (data.slides && Array.isArray(data.slides)) {
          fetchedSlides = data.slides.filter((s) => s.mediaUrl || s.src);
        } else if (Array.isArray(data)) {
          fetchedSlides = data.filter((s) => s.mediaUrl || s.src);
        }

        if (fetchedSlides.length === 0) {
          throw new Error("後台 API 沒有回傳有效的輪播圖片");
        }

        setSlides(fetchedSlides);
      } catch (error) {
        console.error(
          "⚠️ 無法取得後台輪播圖，維持預設圖片:",
          error.message,
        );
      }
    };

    fetchSlides();
  }, []);

  // ==========================================
  // Helper: 建立媒體元件
  // ==========================================
  const createMediaElement = (slideData) => {
    const mediaEl =
      slideData.type === "video"
        ? document.createElement("video")
        : document.createElement("img");

    mediaEl.src = slideData.mediaUrl || slideData.src;

    if (slideData.type === "image") {
      mediaEl.alt =
        slideData.alt || slideData.title || "KÉSH de¹ Luxury Boutique";
    }

    if (slideData.type === "video") {
      mediaEl.muted = true;
      mediaEl.loop = true;
      mediaEl.autoplay = true;
      mediaEl.setAttribute("playsinline", "");
      mediaEl.setAttribute("aria-label", slideData.alt || "KÉSH de¹ Video");
      mediaEl.onloadeddata = () => {
        mediaEl.play().catch((e) => console.warn("Autoplay blocked", e));
      };
    }

    Object.assign(mediaEl.style, {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    });
    return mediaEl;
  };

  // ==========================================
  // 核心：切換動畫函式
  // ==========================================
  const performTransition = (direction) => {
    if (
      stateRef.current.isAnimating ||
      !carouselImagesRef.current ||
      slides.length === 0
    )
      return;
    stateRef.current.isAnimating = true;

    const nextIndex = stateRef.current.currentIndex;
    const nextData = slides[nextIndex];

    const nextTitle = nextData.title || "LUXURY BOUTIQUE";
    const nextCategory = nextData.category || "KÉSH DE¹";

    // 1. 執行文字滑出與滑入動畫
    if (textTitleRef.current && textCategoryRef.current) {
      gsap.to([textCategoryRef.current, textTitleRef.current], {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        stagger: 0.1,
        onComplete: () => {
          textTitleRef.current.innerText = nextTitle;
          textCategoryRef.current.innerText = nextCategory;
          gsap.set([textCategoryRef.current, textTitleRef.current], { y: 30 });
          gsap.to([textCategoryRef.current, textTitleRef.current], {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
          });
        },
      });
    }

    // 2. 執行圖片切換動畫
    const slideOffset = window.innerWidth < 1000 ? 100 : 500;
    const currentSlide =
      carouselImagesRef.current.querySelector(".img:last-child");
    const currentMedia = currentSlide?.querySelector("img, video");

    const newSlideContainer = document.createElement("div");
    newSlideContainer.className = "img";
    Object.assign(newSlideContainer.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 2,
    });

    const newMediaEl = createMediaElement(nextData);
    gsap.set(newMediaEl, {
      x: direction === "right" ? slideOffset : -slideOffset,
    });
    newSlideContainer.appendChild(newMediaEl);
    carouselImagesRef.current.appendChild(newSlideContainer);

    if (currentMedia) {
      gsap.to(currentMedia, {
        x: direction === "right" ? -slideOffset : slideOffset,
        duration: 1.5,
        ease: "hop",
      });
    }

    gsap.fromTo(
      newSlideContainer,
      {
        clipPath:
          direction === "right"
            ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
            : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "hop",
        onComplete: () => {
          if (!carouselImagesRef.current) return;
          const allSlides =
            carouselImagesRef.current.querySelectorAll(".img") || [];
          if (allSlides.length > 1) {
            for (let i = 0; i < allSlides.length - 1; i++)
              allSlides[i].remove();
          }
          stateRef.current.isAnimating = false;
        },
      },
    );
    gsap.to(newMediaEl, { x: 0, duration: 1.5, ease: "hop" });
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (slides.length > 1) {
      stateRef.current.autoPlayTimer = setInterval(() => {
        stateRef.current.currentIndex =
          (stateRef.current.currentIndex + 1) % slides.length;
        performTransition("right");
      }, 5000);
    }
  };

  const stopAutoPlay = () => {
    if (stateRef.current.autoPlayTimer)
      clearInterval(stateRef.current.autoPlayTimer);
  };

  const clickSlide = (direction) => {
    if (stateRef.current.isAnimating || slides.length <= 1) return;
    stopAutoPlay();

    if (direction === "next") {
      stateRef.current.currentIndex =
        (stateRef.current.currentIndex + 1) % slides.length;
      performTransition("right");
    } else {
      stateRef.current.currentIndex =
        (stateRef.current.currentIndex - 1 + slides.length) % slides.length;
      performTransition("left");
    }
    startAutoPlay();
  };

  // ==========================================
  // 3. GSAP 動畫初始化（有 slides 就立刻出圖，不卡黑畫面）
  // ==========================================
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !wrapperRef.current ||
      slides.length === 0
    )
      return;

    stopAutoPlay();
    stateRef.current.currentIndex = 0;
    stateRef.current.isAnimating = false;

    if (!CustomEase.get("hop")) {
      CustomEase.create(
        "hop",
        "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1",
      );
    }

    if (carouselImagesRef.current) {
      // 清掉舊層，避免 fallback / API 圖疊出殘影
      gsap.killTweensOf(carouselImagesRef.current.querySelectorAll(".img, img, video"));
      carouselImagesRef.current.innerHTML = "";
      const initContainer = document.createElement("div");
      initContainer.className = "img";
      Object.assign(initContainer.style, {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        background: "#111",
      });
      const media = createMediaElement(slides[0]);
      if (media.tagName === "IMG") {
        media.setAttribute("fetchpriority", "high");
        media.decoding = "async";
      }
      initContainer.appendChild(media);
      carouselImagesRef.current.appendChild(initContainer);

      if (textTitleRef.current && textCategoryRef.current) {
        textTitleRef.current.innerText = slides[0].title || "LUXURY BOUTIQUE";
        textCategoryRef.current.innerText = slides[0].category || "KÉSH DE¹";

        gsap.fromTo(
          [textCategoryRef.current, textTitleRef.current],
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power2.out", stagger: 0.2 },
        );
      }
    }

    startAutoPlay();

    return () => stopAutoPlay();
  }, [slides]);

  return (
    <>
      <style jsx>{`
        #integrated-wrapper {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background-color: #111;
          font-family: inherit;
        }
        .carousel {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .carousel-images {
          position: absolute;
          inset: 0;
          opacity: 1;
          background: #111;
        }
        .carousel-images :global(.img) {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #111;
        }
        .carousel-images :global(img),
        .carousel-images :global(video) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .slide-info {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 20;
          text-align: center;
          pointer-events: none;
          width: 80%;
        }
        .slide-info p {
          font-size: 1rem;
          letter-spacing: 0.2rem;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
        }
        .slide-info h1 {
          font-size: 4rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          line-height: 1.1;
        }
        .slider-controls {
          position: absolute;
          width: 100%;
          top: 50%;
          transform: translateY(-50%);
          padding: 0 5%;
          display: flex;
          justify-content: space-between;
          z-index: 30;
          pointer-events: none;
        }
        .control-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3.25rem;
          height: 3.25rem;
          padding: 0;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
        }
        .control-btn:hover {
          background: #fff;
          transform: scale(1.1);
        }
        .control-btn svg {
          width: 1.25rem;
          height: 1.25rem;
          fill: #fff;
          transition: fill 0.3s;
        }
        .control-btn:hover svg {
          fill: #000;
        }
        footer {
          position: absolute;
          bottom: 0;
          width: 100%;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          color: #fff;
          z-index: 20;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        }
        @media (max-width: 768px) {
          .slide-info h1 {
            font-size: 2.5rem;
          }
          .slider-controls {
            padding: 0 3%;
          }
          .control-btn {
            width: 2.25rem;
            height: 2.25rem;
          }
          .control-btn svg {
            width: 0.9rem;
            height: 0.9rem;
          }
        }
      `}</style>

      <div id="integrated-wrapper" ref={wrapperRef}>
        <div className="carousel">
          <div className="carousel-images" ref={carouselImagesRef}></div>
          <div className="slide-info">
            <p ref={textCategoryRef}></p>
            <h1 ref={textTitleRef}></h1>
          </div>

          {slides.length > 1 && (
            <div className="slider-controls">
              <button
                className="control-btn"
                onClick={() => clickSlide("prev")}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="m3.3 12 8.7 8.7 1.5-1.5L6.3 12l7.2-7.2-1.5-1.5L3.3 12Z" />
                </svg>
              </button>
              <button
                className="control-btn"
                onClick={() => clickSlide("next")}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M20.7 12l-8.7-8.7-1.5 1.5 7.2 7.2-7.2 7.2 1.5 1.5 8.7-8.7Z" />
                </svg>
              </button>
            </div>
          )}

          <footer>
            <p>KESH LUXURY CO., LTD</p>
            <p>Brand Philosophy</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PickleballAnimation;
