"use client";

import { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const imageData = [
  "/assets/img-1.png",
  "/assets/img-2.png",
  "/assets/img-3.png",
  "/assets/img-4.png",
  "/assets/img-5.png",
  "/assets/img-6.png",
];

const titles = [
  "Vaccum",
  "Ember",
  "Scratch",
  "Azure",
  "Synthesis",
  "Euphoria",
  "The End",
];

export default function ScrollAnimation() {
  useEffect(() => {
    function addImageScaleAnimation() {
      gsap.utils.toArray("section").forEach((section, index) => {
        const image = document.querySelector(`#preview-${index + 1} img`);
        const startCondition = index === 0 ? "top top" : "bottom bottom";

        gsap.to(image, {
          scrollTrigger: {
            trigger: section,
            start: startCondition,
            end: () => {
              const vh = window.innerHeight;
              const endValue =
                section.offsetTop + section.offsetHeight - vh + vh * 0.5;
              return `+=${endValue}`;
            },
            scrub: 1,
          },
          scale: 3,
          ease: "none",
        });
      });
    }

    function animateClipPath(
      sectionId,
      previewId,
      startClipPath,
      endClipPath,
      start = "top center",
      end = "bottom top"
    ) {
      const section = document.querySelector(sectionId);
      const preview = document.querySelector(previewId);

      ScrollTrigger.create({
        trigger: section,
        start,
        end,
        onEnter: () => {
          gsap.to(preview, {
            scrollTrigger: {
              trigger: section,
              start,
              end,
              scrub: 0.125,
            },
            clipPath: endClipPath,
            ease: "none",
          });
        },
      });
    }

    addImageScaleAnimation();

    animateClipPath(
      "#section-1",
      "#preview-1",
      "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
    );

    const totalSections = 7;
    for (let i = 2; i <= totalSections; i++) {
      const currentSection = `#section-${i}`;
      const prevPreview = `#preview-${i - 1}`;
      const currentPreview = `#preview-${i}`;

      animateClipPath(
        currentSection,
        prevPreview,
        "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        "top bottom",
        "center center"
      );

      if (i < totalSections) {
        animateClipPath(
          currentSection,
          currentPreview,
          "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          "center center",
          "bottom top"
        );
      }
    }
  }, []);

  return (
    <div className="w-full h-full  font-sans relative">
      {/* 固定 intro 文字 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 text-center text-black text-xs uppercase space-y-1">
        <p>This message stays right here,</p>
        <p>no matter where you go,</p>
        <p>it won't move an inch,</p>
        <p>even if you scroll up or down.</p>
      </div>

      {/* section 區塊 */}
      <div className="z-10 relative">
        {titles.map((title, index) => (
          <section
            key={index}
            id={`section-${index + 1}`}
            className="my-[150vh] text-center"
          >
            <h1 className="text-black text-[14vw] font-light tracking-tight uppercase">
              {title}
            </h1>
          </section>
        ))}
        <div className="w-full h-[200px]" />
      </div>

      {/* 預覽圖疊在中間 */}
      <div className="fixed w-[500px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {imageData.map((src, index) => (
          <div
            key={index}
            id={`preview-${index + 1}`}
            className="absolute w-full h-full overflow-hidden"
            style={{
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            }}
          >
            <Image
              src={src}
              alt={`Image ${index + 1}`}
              width={500}
              height={700}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        ))}
      </div>
    </div>
  );
}
