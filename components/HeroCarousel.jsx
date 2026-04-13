"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/dist/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

const PickleballAnimation = () => {
  const wrapperRef = useRef(null);
  const carouselImagesRef = useRef(null);
  const textTitleRef = useRef(null);
  const textCategoryRef = useRef(null);

  const stateRef = useRef({
    currentIndex: 0,
    isAnimating: false,
    slideOffset: 500,
    autoPlayTimer: null,
  });

  const carouselSlides = [
    {
      type: "video",
      src: "/images/index/shutterstock_3459837419.mp4",
      title: "",
      category: "",
    },
    {
      type: "image",
      src: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_7.jpg",
      title: "Luxury Boutique",
      category: "KÉSH de¹",
    },
  ];

  // Helper: 建立媒體元件 (影片或圖片)
  const createMediaElement = (slideData) => {
    const mediaEl =
      slideData.type === "video"
        ? document.createElement("video")
        : document.createElement("img");

    mediaEl.src = slideData.src;

    if (slideData.type === "video") {
      mediaEl.muted = true;
      mediaEl.loop = true;
      mediaEl.autoplay = true;
      mediaEl.setAttribute("playsinline", "");
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

  // 核心：切換動畫函式 (合併自動播放與手動點擊)
  const performTransition = (direction) => {
    if (stateRef.current.isAnimating || !carouselImagesRef.current) return;
    stateRef.current.isAnimating = true;

    // 1. 文字動畫
    const nextIndex = stateRef.current.currentIndex;
    const nextData = carouselSlides[nextIndex];

    if (textTitleRef.current && textCategoryRef.current) {
      gsap.to([textTitleRef.current, textCategoryRef.current], {
        y: -50,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          textTitleRef.current.innerText = nextData.title || "";
          textCategoryRef.current.innerText = nextData.category || "";
          gsap.set([textTitleRef.current, textCategoryRef.current], { y: 50 });
          if (nextData.title || nextData.category) {
            gsap.to([textTitleRef.current, textCategoryRef.current], {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.1,
            });
          }
        },
      });
    }

    // 2. 媒體切換動畫
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

    // 舊媒體視差退場
    if (currentMedia) {
      gsap.to(currentMedia, {
        x: direction === "right" ? -slideOffset : slideOffset,
        duration: 1.5,
        ease: "hop",
      });
    }

    // 新 Slide 進入動畫 (Clip Path)
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
          // 清理舊節點
          const allSlides =
            carouselImagesRef.current?.querySelectorAll(".img") || [];
          if (allSlides.length > 1) {
            for (let i = 0; i < allSlides.length - 1; i++)
              allSlides[i].remove();
          }
          stateRef.current.isAnimating = false;
        },
      },
    );
    // 新媒體視差歸位
    gsap.to(newMediaEl, { x: 0, duration: 1.5, ease: "hop" });
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    stateRef.current.autoPlayTimer = setInterval(() => {
      stateRef.current.currentIndex =
        (stateRef.current.currentIndex + 1) % carouselSlides.length;
      performTransition("right");
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (stateRef.current.autoPlayTimer)
      clearInterval(stateRef.current.autoPlayTimer);
  };

  const clickSlide = (direction) => {
    if (stateRef.current.isAnimating) return;
    stopAutoPlay(); // 點擊時先停止，動畫完再重啟

    if (direction === "next") {
      stateRef.current.currentIndex =
        (stateRef.current.currentIndex + 1) % carouselSlides.length;
      performTransition("right");
    } else {
      stateRef.current.currentIndex =
        (stateRef.current.currentIndex - 1 + carouselSlides.length) %
        carouselSlides.length;
      performTransition("left");
    }
    startAutoPlay();
  };

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current) return;

    if (!CustomEase.get("hop")) {
      CustomEase.create(
        "hop",
        "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1",
      );
    }

    // 初始化第一張
    if (carouselImagesRef.current) {
      carouselImagesRef.current.innerHTML = "";
      const initContainer = document.createElement("div");
      initContainer.className = "img";
      Object.assign(initContainer.style, {
        position: "absolute",
        width: "100%",
        height: "100%",
      });
      initContainer.appendChild(createMediaElement(carouselSlides[0]));
      carouselImagesRef.current.appendChild(initContainer);
    }

    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  return (
    <>
      <style jsx>{`
        #integrated-wrapper {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background: #000;
          font-family: "DM Sans", sans-serif;
        }
        .carousel {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .carousel-images {
          position: absolute;
          inset: 0;
          opacity: 0.8;
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
          color: rgba(255, 255, 255, 0.7);
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
          padding: 1.5rem;
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
        }
      `}</style>

      <div id="integrated-wrapper" ref={wrapperRef}>
        <div className="carousel">
          <div className="carousel-images" ref={carouselImagesRef}></div>
          <div className="slide-info">
            <p ref={textCategoryRef}></p>
            <h1 ref={textTitleRef}></h1>
          </div>
          <div className="slider-controls">
            <button className="control-btn" onClick={() => clickSlide("prev")}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="m3.3 12 8.7 8.7 1.5-1.5L6.3 12l7.2-7.2-1.5-1.5L3.3 12Z" />
              </svg>
            </button>
            <button className="control-btn" onClick={() => clickSlide("next")}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M20.7 12l-8.7-8.7-1.5 1.5 7.2 7.2-7.2 7.2 1.5 1.5 8.7-8.7Z" />
              </svg>
            </button>
          </div>
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
