import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// 註冊 CustomEase 插件
gsap.registerPlugin(CustomEase);

export default function HeroSlider({
  // 透過 Props 傳入圖片與文字
  carouselSlides = [
    {
      title: "KÉSH de¹ 嚴選品質保證",
      image:
        "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_17.jpg",
    },
    {
      title: "探索更多經典包款與獨家限量",
      image:
        "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_22.jpg",
    },
  ],
}) {
  const wrapperRef = useRef(null);
  const carouselImagesRef = useRef(null);
  const carouselTextRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  useEffect(() => {
    // 創建 CustomEase
    CustomEase.create(
      "hop",
      "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1",
    );

    const ctx = gsap.context(() => {
      let currentIndex = 0;
      let isAnimating = false;
      let slideOffset = 500;
      let autoPlayTimer = null;
      let carouselTextElements = [];

      const setSlideOffset = () => {
        slideOffset = window.innerWidth < 1000 ? 100 : 500;
      };

      // 🔥 1. 動態建立文字元素 (逐字切割)
      const createCarouselTitles = () => {
        carouselTextElements = [];
        if (carouselTextRef.current) carouselTextRef.current.innerHTML = "";

        carouselSlides.forEach((slide) => {
          const slideTitleContainer = document.createElement("div");
          slideTitleContainer.className =
            "absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-4 opacity-0";

          const slideTitle = document.createElement("h2");
          // 移除了原本的 filter，改用乾淨的陰影確保白字可見
          slideTitle.className =
            "text-center text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-white drop-shadow-xl";

          // 將句子拆成每一個字元
          const chars = slide.title.split("");
          chars.forEach((char) => {
            if (char === " ") {
              slideTitle.appendChild(document.createTextNode(" "));
            } else {
              const span = document.createElement("span");
              span.className =
                "word inline-block will-change-[filter,opacity,transform]";
              span.textContent = char;
              span.style.opacity = 0;
              slideTitle.appendChild(span);
            }
          });

          slideTitleContainer.appendChild(slideTitle);
          carouselTextRef.current.appendChild(slideTitleContainer);
          carouselTextElements.push(slideTitleContainer);
        });
      };

      const createInitialSlide = () => {
        if (!carouselSlides || carouselSlides.length === 0) return;
        const initialSlideImgContainer = document.createElement("div");
        initialSlideImgContainer.classList.add("carousel-img-container");
        const initialSlideImg = document.createElement("img");
        initialSlideImg.src = carouselSlides[0].image;
        initialSlideImgContainer.appendChild(initialSlideImg);
        carouselImagesRef.current.appendChild(initialSlideImgContainer);
      };

      // 🔥 2. 清新乾淨的文字動畫特效
      const updateActiveTextSlide = () => {
        carouselTextElements.forEach((slideContainer, index) => {
          const words = slideContainer.querySelectorAll(".word");
          gsap.killTweensOf(words);
          gsap.killTweensOf(slideContainer);

          if (index !== currentIndex) {
            // 退場動畫：輕微模糊 + 向上微飄 + 淡出
            gsap.to(words, {
              filter: "blur(10px)",
              opacity: 0,
              y: -15,
              duration: 0.5,
              ease: "power2.in",
              stagger: 0.01, // 稍微錯開消失
            });
            gsap.to(slideContainer, { opacity: 0, duration: 0.6, delay: 0.2 });
            slideContainer.style.zIndex = 10;
          } else {
            // 進場動畫：延遲等舊字消失 -> 從模糊變清晰 + 向上微飄 + 淡入
            slideContainer.style.zIndex = 20;
            gsap.to(slideContainer, { opacity: 1, duration: 0.1 });

            gsap.fromTo(
              words,
              { filter: "blur(15px)", opacity: 0, y: 15 },
              {
                filter: "blur(0px)",
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 0.4, // 等待上一頁退場
                ease: "power3.out",
                stagger: 0.03, // 逐字間隔，數字越小越連貫
              },
            );
          }
        });
      };

      const animateSlide = (direction) => {
        if (isAnimating || carouselSlides.length <= 1) return;
        isAnimating = true;
        setSlideOffset();

        const currentSlide = carouselImagesRef.current.querySelector(
          ".carousel-img-container:last-child",
        );
        const currentSlideImage = currentSlide.querySelector("img");

        const newSlideImgContainer = document.createElement("div");
        newSlideImgContainer.classList.add("carousel-img-container");
        const newSlideImg = document.createElement("img");
        newSlideImg.src = carouselSlides[currentIndex].image;

        gsap.set(newSlideImg, {
          x: direction === "left" ? -slideOffset : slideOffset,
        });

        newSlideImgContainer.appendChild(newSlideImg);
        carouselImagesRef.current.appendChild(newSlideImgContainer);

        gsap.to(currentSlideImage, {
          x: direction === "left" ? slideOffset : -slideOffset,
          duration: 1.5,
          ease: "hop",
        });

        gsap.fromTo(
          newSlideImgContainer,
          {
            clipPath:
              direction === "left"
                ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
                : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.5,
            ease: "hop",
            onComplete: () => {
              const imgElements = carouselImagesRef.current.querySelectorAll(
                ".carousel-img-container",
              );
              if (imgElements.length > 1) {
                for (let i = 0; i < imgElements.length - 1; i++) {
                  imgElements[i].remove();
                }
              }
              isAnimating = false;
            },
          },
        );

        gsap.to(newSlideImg, { x: 0, duration: 1.5, ease: "hop" });

        // 呼叫文字動畫
        updateActiveTextSlide();
      };

      const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
          if (!isAnimating) {
            currentIndex = (currentIndex + 1) % carouselSlides.length;
            animateSlide("right");
          }
        }, 5000);
      };

      const stopAutoPlay = () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
      };

      const initCarouselSystem = () => {
        createCarouselTitles();
        createInitialSlide();
        setSlideOffset();
        window.addEventListener("resize", setSlideOffset);

        // 頁面載入時觸發第一張文字的進場動畫
        setTimeout(() => {
          updateActiveTextSlide();
        }, 100);

        startAutoPlay();

        nextBtnRef.current?.addEventListener("click", () => {
          if (isAnimating) return;
          stopAutoPlay();
          currentIndex = (currentIndex + 1) % carouselSlides.length;
          animateSlide("right");
          startAutoPlay();
        });

        prevBtnRef.current?.addEventListener("click", () => {
          if (isAnimating) return;
          stopAutoPlay();
          currentIndex =
            (currentIndex - 1 + carouselSlides.length) % carouselSlides.length;
          animateSlide("left");
          startAutoPlay();
        });
      };

      // 初始化
      initCarouselSystem();

      return () => {
        window.removeEventListener("resize", setSlideOffset);
        stopAutoPlay();
      };
    }, wrapperRef);

    return () => ctx.revert();
  }, [carouselSlides]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

        .integrated-wrapper {
          font-family: "Inter", sans-serif;
          width: 100%;
          height: 600px; 
          overflow: hidden;
          position: relative;
          background: #000;
        }

        .lacrapule-wrapper {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          overflow: hidden; z-index: 1;
        }

        .lacrapule-wrapper img {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover; will-change: transform; display: block;
        }

        .carousel {
          position: relative; width: 100%; height: 100%; overflow: hidden;
        }

        .carousel-images, .carousel-images .carousel-img-container {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        }

        .carousel-images .carousel-img-container { 
          will-change: clip-path, transform; 
        }

        .carousel-images { 
          opacity: 0.65; /* 讓圖片稍微變暗，確保白字清晰可見 */
        }

        /* 移除之前複雜的 filter CSS，改用乾淨的陰影 */
        .slide-title-container .title {
          text-shadow: 0px 4px 15px rgba(0,0,0,0.4);
        }

        .slider-controls {
          position: absolute; width: 100%; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          padding: 0 5%; display: flex; justify-content: space-between;
          z-index: 30; pointer-events: none;
        }
        
        .control-btn {
          pointer-events: auto; padding: 1.5rem;
          display: flex; align-items: center; justify-content: center;
          background-color: transparent;
          border: 1px dashed rgba(255, 255, 255, 0.5);
          border-radius: 1rem; cursor: pointer;
          transition: all 200ms ease-in-out;
        }

        .control-btn:hover { background-color: #fff; }
        .control-btn svg { width: 2.5rem; height: 2.5rem; stroke: #000; fill: #fff; transition: fill 200ms ease-in-out; }
        .control-btn:hover svg { fill: #000; }

        @media (max-width: 900px) {
          .integrated-wrapper { height: 400px; }
          .slider-controls { display: none !important; }
        }
      `}</style>

      <div className="integrated-wrapper rounded-xl shadow-lg" ref={wrapperRef}>
        <div className="lacrapule-wrapper relative">
          <div className="carousel">
            {/* 圖片容器 */}
            <div className="carousel-images" ref={carouselImagesRef}></div>
            {/* 動態文字容器 */}
            <div ref={carouselTextRef}></div>
          </div>

          <div className="slider-controls">
            <button className="control-btn prev-btn" ref={prevBtnRef}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
              >
                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
              </svg>
            </button>
            <button className="control-btn next-btn" ref={nextBtnRef}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
              >
                <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
