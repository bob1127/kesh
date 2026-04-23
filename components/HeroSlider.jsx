import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

// 註冊 CustomEase 插件
gsap.registerPlugin(CustomEase);

export default function HeroSlider({ carouselSlides = [] }) {
  const wrapperRef = useRef(null);
  const carouselImagesRef = useRef(null);
  const carouselTextRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);

  // 判斷是否需要輪播 (超過 1 張才輪播)
  const isSlidable = carouselSlides.length > 1;

  useEffect(() => {
    if (!carouselSlides || carouselSlides.length === 0) return;

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

      // 1. 動態建立文字元素
      const createCarouselTitles = () => {
        carouselTextElements = [];
        if (carouselTextRef.current) carouselTextRef.current.innerHTML = "";

        carouselSlides.forEach((slide) => {
          const slideTitleContainer = document.createElement("div");
          slideTitleContainer.className =
            "absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-4 opacity-0";

          const slideTitle = document.createElement("h2");
          slideTitle.className =
            "text-center text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-white drop-shadow-xl";

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
        const initialSlideImgContainer = document.createElement("div");
        initialSlideImgContainer.classList.add("carousel-img-container");
        const initialSlideImg = document.createElement("img");
        initialSlideImg.src = carouselSlides[0].image;
        initialSlideImgContainer.appendChild(initialSlideImg);
        carouselImagesRef.current.appendChild(initialSlideImgContainer);
      };

      // 2. 文字動畫特效
      const updateActiveTextSlide = () => {
        carouselTextElements.forEach((slideContainer, index) => {
          const words = slideContainer.querySelectorAll(".word");
          gsap.killTweensOf(words);
          gsap.killTweensOf(slideContainer);

          if (index !== currentIndex) {
            gsap.to(words, {
              filter: "blur(10px)",
              opacity: 0,
              y: -15,
              duration: 0.5,
              ease: "power2.in",
              stagger: 0.01,
            });
            gsap.to(slideContainer, { opacity: 0, duration: 0.6, delay: 0.2 });
            slideContainer.style.zIndex = 10;
          } else {
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
                delay: 0.4,
                ease: "power3.out",
                stagger: 0.03,
              },
            );
          }
        });
      };

      const animateSlide = (direction) => {
        if (isAnimating || !isSlidable) return;
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
        updateActiveTextSlide();
      };

      const startAutoPlay = () => {
        stopAutoPlay();
        if (!isSlidable) return; // 只有一張就不自動播放
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

        setTimeout(() => {
          updateActiveTextSlide();
        }, 100);

        startAutoPlay();

        // 綁定按鈕事件 (如果有按鈕才綁定)
        if (nextBtnRef.current) {
          nextBtnRef.current.addEventListener("click", () => {
            if (isAnimating || !isSlidable) return;
            stopAutoPlay();
            currentIndex = (currentIndex + 1) % carouselSlides.length;
            animateSlide("right");
            startAutoPlay();
          });
        }

        if (prevBtnRef.current) {
          prevBtnRef.current.addEventListener("click", () => {
            if (isAnimating || !isSlidable) return;
            stopAutoPlay();
            currentIndex =
              (currentIndex - 1 + carouselSlides.length) %
              carouselSlides.length;
            animateSlide("left");
            startAutoPlay();
          });
        }
      };

      initCarouselSystem();

      return () => {
        window.removeEventListener("resize", setSlideOffset);
        stopAutoPlay();
      };
    }, wrapperRef);

    return () => ctx.revert();
  }, [carouselSlides, isSlidable]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

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
          opacity: 0.65; 
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
            <div className="carousel-images" ref={carouselImagesRef}></div>
            <div ref={carouselTextRef}></div>
          </div>

          {/* 🔥 防呆機制：只有圖片大於 1 張時，才顯示左右箭頭 */}
          {isSlidable && (
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
          )}
        </div>
      </div>
    </>
  );
}
