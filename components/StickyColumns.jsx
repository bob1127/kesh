"use client";

import { useEffect } from "react";
import gsap from "gsap";
import Lenis from "lenis";
import Image from "next/image";

export default function StickyColumns() {
  useEffect(() => {
    let ScrollTrigger, SplitText;

    const init = async () => {
      const st = await import("gsap/ScrollTrigger");
      const split = await import("gsap/SplitText");
      ScrollTrigger = st.ScrollTrigger;
      SplitText = split.SplitText;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      const initTextSplit = () => {
        const textElements = document.querySelectorAll(".col-3 h1, .col-3 p");
        textElements.forEach((el) => {
          const split = new SplitText(el, {
            type: "lines",
            linesClass: "line",
          });
          split.lines.forEach(
            (line) => (line.innerHTML = `<span>${line.textContent}</span>`)
          );
        });
      };

      initTextSplit();

      gsap.set(".col-3 .col-content-wrapper .line span", { y: "0%" });
      gsap.set(".col-3 .col-content-wrapper-2 .line span", { y: "-125%" });

      ScrollTrigger.create({
        trigger: ".sticky-cols",
        start: "top top",
        end: `+=${window.innerHeight * 5}px`,
        pin: true,
        pinSpacing: true,
      });

      let currentPhase = 0;

      ScrollTrigger.create({
        trigger: ".sticky-cols",
        start: "top top",
        end: `+=${window.innerHeight * 6}px`,
        onUpdate: (self) => {
          const progress = self.progress;

          if (progress >= 0.3 && currentPhase === 0) {
            currentPhase = 1;
            gsap.to(".col-1", { opacity: 0, scale: 0.75, duration: 0.75 });
            gsap.to(".col-2", { x: "0%", duration: 0.75 });
            gsap.to(".col-3", { y: "0%", duration: 0.75 });
            gsap.to(".col-img-1 img", { scale: 1.25, duration: 0.75 });
            gsap.to(".col-img-2", {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 0.75,
            });
            gsap.to(".col-img-2 img", { scale: 1, duration: 0.75 });
          }

          if (progress >= 0.6 && currentPhase === 1) {
            currentPhase = 2;
            gsap.to(".col-2", { opacity: 0, scale: 0.75, duration: 0.75 });
            gsap.to(".col-3", { x: "0%", duration: 0.75 });
            gsap.to(".col-4", { y: "0%", duration: 0.75 });
            gsap.to(".col-3 .col-content-wrapper .line span", {
              y: "-125%",
              duration: 0.75,
            });
            gsap.to(".col-3 .col-content-wrapper-2 .line span", {
              y: "0%",
              duration: 0.75,
              delay: 0.5,
            });
          }

          if (progress < 0.3 && currentPhase >= 1) {
            currentPhase = 0;
            gsap.to(".col-1", { opacity: 1, scale: 1, duration: 0.75 });
            gsap.to(".col-2", { x: "100%", duration: 0.75 });
            gsap.to(".col-3", { y: "100%", duration: 0.75 });
            gsap.to(".col-img-1 img", { scale: 1, duration: 0.75 });
            gsap.to(".col-img-2", {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 0.75,
            });
            gsap.to(".col-img-2 img", { scale: 1.25, duration: 0.75 });
          }

          if (progress < 0.6 && currentPhase === 2) {
            currentPhase = 1;
            gsap.to(".col-2", { opacity: 1, scale: 1, duration: 0.75 });
            gsap.to(".col-3", { x: "100%", duration: 0.75 });
            gsap.to(".col-4", { y: "100%", duration: 0.75 });
            gsap.to(".col-3 .col-content-wrapper .line span", {
              y: "0%",
              duration: 0.75,
              delay: 0.5,
            });
            gsap.to(".col-3 .col-content-wrapper-2 .line span", {
              y: "-125%",
              duration: 0.75,
            });
          }
        },
      });
    };

    init();

    return () => {
      ScrollTrigger?.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <section className="w-screen h-[100svh] bg-white text-black flex justify-center items-center">
        <h1 className="text-4xl font-medium leading-tight w-1/2 text-center">
          We create modern interiors that feel effortlessly personal.
        </h1>
      </section>

      <section className="sticky-cols relative w-screen h-[100svh] overflow-hidden bg-white text-black">
        <div className="sticky-cols-wrapper absolute w-full h-full">
          <div className="col col-1 absolute w-1/2 h-full flex items-center p-2">
            <div className="col-content w-full h-full p-2">
              <div className="col-content-wrapper bg-gray-100  h-full flex flex-col justify-between p-10">
                <h1 className="text-3xl font-medium w-3/5">
                  We design spaces where comfort meets quiet sophistication.
                </h1>
                <p className="text-base font-medium w-3/5">
                  Layered textures, rich tones, and thoughtful details come
                  together to create interiors that feel lived-in yet elevated.
                </p>
              </div>
            </div>
          </div>

          <div className="col col-2 absolute w-1/2 h-full translate-x-full">
            <div className="col-img-1 absolute w-full h-full">
              <div className="col-img-wrapper bg-gray-100  w-full h-full overflow-hidden relative">
                <Image src="/img_01.jpg" alt="" fill className="object-cover" />
              </div>
            </div>
            <div
              className="col-img-2 absolute w-full h-full"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              }}
            >
              <div className="col-img-wrapper bg-gray-100  w-full h-full overflow-hidden relative">
                <Image
                  src="/img_02.jpg"
                  alt=""
                  fill
                  className="object-cover scale-[1.25]"
                />
              </div>
            </div>
          </div>

          <div className="col col-3 absolute w-1/2 h-full translate-x-full translate-y-full p-2">
            <div className="col-content-wrapper bg-gray-100  h-full flex flex-col justify-between p-10">
              <h1 className="text-3xl font-medium w-full">
                Our interiors are crafted to feel as calm as they look.
              </h1>
              <p className="text-base font-medium w-full">
                Each space is designed with intentional balance between warmth
                and modernity, light and shadow, function and beauty.
              </p>
            </div>
            <div className="col-content-wrapper-2 absolute top-0 left-0 w-full h-full p-10 bg-gray-100  flex flex-col justify-between">
              <h1 className="text-3xl font-medium w-full">
                Every detail is chosen to bring ease and elegance into your
                space.
              </h1>
              <p className="text-base font-medium w-full">
                From custom furnishings to ambient lighting, we shape
                environments that reflect your lifestyle with timeless clarity.
              </p>
            </div>
          </div>

          <div className="col col-4 absolute w-1/2 h-full translate-x-full translate-y-full">
            <div className="col-img bg-gray-100  w-full h-full overflow-hidden relative">
              <Image src="/img_03.jpg" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="w-screen h-[100svh] bg-white text-black flex justify-center items-center">
        <h1 className="text-4xl font-medium leading-tight w-1/2 text-center">
          Timeless design begins with a conversation.
        </h1>
      </section>
    </>
  );
}
