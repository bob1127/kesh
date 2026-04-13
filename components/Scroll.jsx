"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const team = [
  {
    name: "Ava Sinclair",
    role: "Creative Director",
    img: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_4.jpg",
  },
  {
    name: "Liam Archer",
    role: "Brand Strategist",
     img: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_14.jpg",
  },
  {
    name: "Zoe Clementine",
    role: "Lead Designer",
     img: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_2.jpg",
  },
  {
    name: "Ethan Hawthorne",
    role: "Chief Innovation Officer",
    img: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_1.jpg",
  },
];

export default function TeamPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const infoRef = useRef(null);

  const slideRefs = useRef([]);
  const bgRefs = useRef([]);

  // 定義「完全顯示」的 ClipPath (稍微超出邊界，防止殘影)
  // 原本是 0% 0% ... 改成 -1% -1% 可以蓋得更死
  const CLIP_VISIBLE = "polygon(-1% -1%, 101% -1%, 101% 101%, -1% 101%)";
  // 定義「完全隱藏」的 ClipPath (藏在下方)
  const CLIP_HIDDEN = "polygon(-1% 100%, 101% 100%, 101% 100%, -1% 100%)";

  useEffect(() => {
    // 1. 初始化狀態

    // 第一張：全顯
    gsap.set(slideRefs.current[0], { clipPath: CLIP_VISIBLE, zIndex: 1 });
    gsap.set(bgRefs.current[0], { clipPath: CLIP_VISIBLE, zIndex: 1 });

    // 第一張圖片：比例正常
    const firstImg = slideRefs.current[0].querySelector("img");
    gsap.set(firstImg, { scale: 1 });

    // 其他張：隱藏
    team.forEach((_, i) => {
      if (i !== 0) {
        gsap.set(slideRefs.current[i], { clipPath: CLIP_HIDDEN, zIndex: 0 });
        gsap.set(bgRefs.current[i], { clipPath: CLIP_HIDDEN, zIndex: 0 });
      }
    });

    // 背景跑馬燈邏輯 (維持不變)
    bgRefs.current.forEach((bg, i) => {
      const text = bg.querySelector("h1");
      if (text) {
        // 安全檢查
        const clone = text.cloneNode(true);
        bg.appendChild(clone);

        gsap.to([text, clone], {
          xPercent: -100,
          repeat: -1,
          duration: 20,
          ease: "none",
        });
        gsap.set(clone, {
          position: "absolute",
          left: "100%",
          top: "50%",
          y: "-50%",
        });
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % team.length;

    const currentSlide = slideRefs.current[currentIndex];
    const nextSlide = slideRefs.current[nextIndex];
    const currentBg = bgRefs.current[currentIndex];
    const nextBg = bgRefs.current[nextIndex];

    const currentImg = currentSlide.querySelector("img");
    const nextImg = nextSlide.querySelector("img");

    // 1. 層級設定
    // 下一張設為 10 (最上層)
    gsap.set([nextSlide, nextBg], { zIndex: 10 });
    // 上一張設為 1 (被覆蓋層)
    gsap.set([currentSlide, currentBg], { zIndex: 1 });

    // 2. 準備下一張圖片狀態
    // 先設定為放大狀態，等待縮小 (Zoom Out 效果)
    gsap.set(nextImg, { scale: 1.25, filter: "brightness(1)" });

    const tl = gsap.timeline({
      onComplete: () => {
        // 動畫結束後，瞬間清理戰場
        // 1. 把上一張 (current) 藏到底下
        gsap.set([currentSlide, currentBg], {
          clipPath: CLIP_HIDDEN,
          zIndex: 0,
        });

        // 2. 重置上一張圖片的特效，避免下次出現時狀態奇怪
        gsap.set(currentImg, { scale: 1.25, filter: "brightness(1)" });

        // 3. 更新 Index
        setCurrentIndex(nextIndex);
      },
    });

    const easeType = "power4.inOut";
    const duration = 1.6;

    // --- 動畫開始 ---

    // 1. 背景揭示 (稍微快一點點)
    tl.to(
      nextBg,
      {
        clipPath: CLIP_VISIBLE,
        duration: duration,
        ease: easeType,
      },
      0
    );

    // 2. 主圖揭示 (跟隨背景)
    tl.to(
      nextSlide,
      {
        clipPath: CLIP_VISIBLE,
        duration: duration,
        ease: easeType,
      },
      0.05
    );

    // 3. 圖片 Scale 效果 (Zoom Out) - 下一張圖
    tl.to(
      nextImg,
      {
        scale: 1,
        duration: duration * 1.2,
        ease: "power3.out",
      },
      0.05
    );

    // 4. 上一張圖的退場效果 (Parallax + Darken)
    // 讓它變暗並稍微移動，這樣即使邊緣有一點點露出來，也是暗的，看不清楚
    tl.to(
      currentImg,
      {
        scale: 1.1,
        filter: "brightness(0.4)", // 加深變暗程度，確保不搶戲
        duration: duration,
        ease: easeType,
      },
      0
    );

    // 文字動畫
    animateInfoText(nextIndex);
  };

  const animateInfoText = (nextIndex) => {
    const infoContainer = infoRef.current;
    if (!infoContainer) return;

    const nameEl = infoContainer.querySelector(".name");
    const roleEl = infoContainer.querySelector(".role");

    gsap.to([nameEl, roleEl], {
      y: -30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.in",
      onComplete: () => {
        nameEl.textContent = team[nextIndex].name;
        roleEl.textContent = team[nextIndex].role;

        gsap.fromTo(
          [nameEl, roleEl],
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
          }
        );
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[550px] sm:h-screen  max-h-[750px] mt-8 overflow-hidden relative bg-white text-black"
    >
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between z-50 mix-blend-difference text-white">
        <p className="text-lg font-semibold tracking-wider">Vertex Studio</p>
        <p className="text-lg font-semibold tracking-wider">Showreel</p>
      </nav>

      {/* Background Marquees */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none">
        {team.map((member, i) => (
          <div
            key={i}
            ref={(el) => (bgRefs.current[i] = el)}
            className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden"
            style={{ zIndex: i === 0 ? 1 : 0 }}
          >
            <div className="absolute top-1/2 w-full -translate-y-1/2 opacity-[0.08]">
              <h1 className="text-[20vh] md:text-[240px] whitespace-nowrap uppercase font-black tracking-tighter w-max px-4">
                {Array(4).fill(member.name).join(" — ")}
              </h1>
            </div>
          </div>
        ))}
      </div>

      {/* Main Image Block */}
      <div className="absolute top-1/2 left-1/2 w-[85vw] md:w-[500px] h-[60vh] md:h-[700px] -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative w-full h-[85%] overflow-hidden bg-gray-100">
          {team.map((member, i) => (
            <div
              key={i}
              ref={(el) => (slideRefs.current[i] = el)}
              className="absolute top-0 left-0 w-full h-full overflow-hidden"
              style={{ zIndex: i === 0 ? 1 : 0, willChange: "clip-path" }} // 效能優化
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-full h-full object-cover"
                style={{ willChange: "transform" }}
              />
            </div>
          ))}
        </div>

        {/* Info Text */}
        <div ref={infoRef} className="mt-8 text-center overflow-hidden">
          <p className="name text-3xl md:text-4xl font-light tracking-tight">
            {team[0].name}
          </p>
          <p className="role text-sm md:text-base text-gray-500 mt-2 uppercase tracking-widest">
            {team[0].role}
          </p>
        </div>
      </div>
    </div>
  );
}
