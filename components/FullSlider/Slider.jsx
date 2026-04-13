"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const slides = [
  {
    title:
      "Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.",
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_13.jpg",
  },
  {
    title:
      "A car slices through the desert, shadow chasing the wind as clouds of dust rise behind, blurring the horizon into gold and thunder.",
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_6.jpg",
  },
  {
    title:
      "Reflections ripple across mirrored faces, each one a fragment of identity, caught between defiance, doubt, and the silence of thought.",
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_16.jpg",
  },
  {
    title:
      "Soft light spills through the café windows as morning settles into wood and metal, capturing the rhythm of quiet human routine.",
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_7.jpg",
  },
  {
    title:
      "Every serve becomes a battle between focus and instinct, movement flowing like rhythm as the court blurs beneath the sunlight.",
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_8.jpg",
  },
  {
    title:
      "Amber light spills over the stage as guitars cry into smoke and shadow, where music and motion merge into pure energy.",
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_13.jpg",
  },
  {
    title:
      "Dust erupts beneath his stride as sweat glints under floodlights, every step pushing closer to victory, grit, and pure determination.",
    image: "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_15.jpg",
  },
];

export default function Slider() {
  const sliderRef = useRef(null);
  const sliderImagesRef = useRef(null);
  const sliderTitleRef = useRef(null);
  const sliderIndicesRef = useRef(null);
  const progressBarRef = useRef(null);

  useGSAP(
    () => {
      let activeSlide = 0;
      let currentSplit = null;

      const pinDistance = window.innerHeight * slides.length;

      function createIndices() {
        if (sliderIndicesRef.current) {
          sliderIndicesRef.current.innerHTML = "";

          slides.forEach((_, index) => {
            const indexNum = (index + 1).toString().padStart(2, "0");
            const indicatorElement = document.createElement("p");
            indicatorElement.dataset.index = index;
            indicatorElement.innerHTML = `<span class="marker"></span><span class="index">${indexNum}</span>`;
            sliderIndicesRef.current.appendChild(indicatorElement);

            if (index === 0) {
              gsap.set(indicatorElement.querySelector(".index"), {
                opacity: 1,
              });
              gsap.set(indicatorElement.querySelector(".marker"), {
                scaleX: 1,
              });
            } else {
              gsap.set(indicatorElement.querySelector(".index"), {
                opacity: 0.35,
              });
              gsap.set(indicatorElement.querySelector(".marker"), {
                scaleX: 0,
              });
            }
          });
        }
      }

      function animateNewSlide(index) {
        if (!sliderImagesRef.current || !sliderTitleRef.current) return;

        const newSliderImage = document.createElement("img");
        newSliderImage.src = slides[index].image;
        newSliderImage.alt = `Slide ${index + 1}`;

        gsap.set(newSliderImage, {
          opacity: 0,
          scale: 1.1,
        });

        sliderImagesRef.current.appendChild(newSliderImage);

        gsap.to(newSliderImage, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        });

        gsap.to(newSliderImage, {
          scale: 1,
          duration: 1,
          ease: "power2.out",
        });

        const allImages = sliderImagesRef.current.querySelectorAll("img");
        if (allImages.length > 3) {
          const removeCount = allImages.length - 3;
          for (let i = 0; i < removeCount; i++) {
            sliderImagesRef.current.removeChild(allImages[i]);
          }
        }

        animateNewTitle(index);
        animateIndicators(index);
      }

      function animateIndicators(index) {
        if (!sliderIndicesRef.current) return;

        const indicators = sliderIndicesRef.current.querySelectorAll("p");

        indicators.forEach((indicator, i) => {
          const markerElement = indicator.querySelector(".marker");
          const indexElement = indicator.querySelector(".index");

          if (i === index) {
            gsap.to(indexElement, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            });

            gsap.to(markerElement, {
              scaleX: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          } else {
            gsap.to(indexElement, {
              opacity: 0.5,
              duration: 0.3,
              ease: "power2.out",
            });

            gsap.to(markerElement, {
              scaleX: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        });
      }

      function animateNewTitle(index) {
        if (!sliderTitleRef.current) return;

        if (currentSplit) {
          currentSplit.revert();
        }

        sliderTitleRef.current.innerHTML = `<h1>${slides[index].title}</h1>`;

        currentSplit = new SplitText(
          sliderTitleRef.current.querySelector("h1"),
          {
            type: "lines",
            linesClass: "line",
            mask: "lines",
          }
        );

        gsap.set(currentSplit.lines, {
          yPercent: 100,
          opacity: 0,
        });

        gsap.to(currentSplit.lines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
        });
      }

      createIndices();

      ScrollTrigger.create({
        trigger: sliderRef.current,
        start: "top top",
        end: `+=${pinDistance}px`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, {
              scaleY: self.progress,
            });
          }

          const currentSlide = Math.floor(self.progress * slides.length);

          if (activeSlide !== currentSlide && currentSlide < slides.length) {
            activeSlide = currentSlide;
            animateNewSlide(activeSlide);
          }
        },
      });

      return () => {
        if (currentSplit) currentSplit.revert();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    },
    { scope: sliderRef }
  );

  return (
    <section className="slider" ref={sliderRef}>
      <div className="slider-images" ref={sliderImagesRef}>
        <img src="/slider_img_1.jpg" alt="Slide 1" />
      </div>

      <div className="slider-title" ref={sliderTitleRef}>
        <h1>
          Under the soft hum of streetlights she watches the world ripple
          through glass, her calm expression mirrored in the fragments of
          drifting light.
        </h1>
      </div>

      <div className="slider-indicator">
        <div className="slider-indices" ref={sliderIndicesRef}></div>

        <div className="slider-progress-bar">
          <div className="slider-progress" ref={progressBarRef}></div>
        </div>
      </div>
    </section>
  );
}
