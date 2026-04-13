"use client";
import { useEffect, useRef } from "react";
import {
  motion,
  useAnimation,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import SwiperEsim from "./EmblaCarousel01/index";
export default function IntroHero() {
  const logoControls = useAnimation();
  const phonesControls = useAnimation();
  const titleControls = useAnimation();
  const textControls = useAnimation();
  const ref = useRef(null);

  // ✅ Step 1: 滾動監聽 & 平滑 spring 包裝
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 15,
    mass: 0.3,
  });

  // ✅ Step 2: 計算三張圖片的 transform Y
  const y1 = useTransform(smoothProgress, [0, 1], ["20px", "-40px"]);
  const y2 = useTransform(smoothProgress, [0, 1], ["60px", "-20px"]);
  const y3 = useTransform(smoothProgress, [0, 1], ["100px", "0px"]);

  // ✅ 初始動畫流程
  useEffect(() => {
    async function sequence() {
      await logoControls.start({
        scale: 1,
        y: 0,
        opacity: 1,
        transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
      });

      await Promise.all([
        logoControls.start({
          scale: 0.5,
          y: "-160px",
          transition: { duration: 1.1, ease: [0.33, 1, 0.68, 1] },
        }),
        phonesControls.start({
          opacity: 1,
          y: -160,
          scale: 1,
          transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] },
        }),
        titleControls.start({
          opacity: 1,
          y: -160,
          scale: 1,
          transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] },
        }),
      ]);

      textControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 },
      });
    }

    sequence();
  }, []);

  return (
    <>
      {/* 第一段區塊 */}
      <section className="relative bg-white flex flex-col items-center justify-center">
        {/* LOGO */}
        <motion.div
          className="z-10 text-4xl flex flex-col justify-center items-center font-extrabold mb-4"
          initial={{ scale: 2.2, y: 0, opacity: 0 }}
          animate={logoControls}
        >
          <div className="logo bg-[#1757ff] text-white rounded-[20px] flex justify-center items-center w-[180px] h-[180px] shadow-xl">
            ESIM
          </div>
          <span className="text-[26px]">IOS</span>
        </motion.div>
        {/* Title */}
        <motion.div
          className="font-bold text-neutral-800 text-[45px] mb-6"
          initial={{ opacity: 0, y: 0, scale: 0.95 }}
          animate={titleControls}
        >
          LET&apos;S GET ESIM
        </motion.div>

        {/* 手機群動畫 */}
        <motion.div
          className="relative flex gap-4 z-0"
          initial={{ opacity: 0, y: 100, scale: 1.1 }}
          animate={phonesControls}
        >
          <div className="group relative">
            <img
              src="/images/step/step01.png"
              alt="Phone 1"
              className="w-[80px] md:w-[220px] translate-x-[20px]"
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-800 text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Step 1：點擊設定裡的行動服務選項
            </div>
          </div>
          <div className="group relative">
            <img
              src="/images/step/step02.png"
              alt="Phone 1"
              className="w-[80px] md:w-[220px] translate-x-[20px]"
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-800 text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Step 2：點擊加入eSIM
            </div>
          </div>
          <div className="group relative">
            <img
              src="/images/step/step03.png"
              alt="Phone 1"
              className="w-[80px] md:w-[220px] translate-x-[20px]"
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-800 text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Step 3：掃描QR Code
            </div>
          </div>
        </motion.div>

        {/* 底部文字 */}
        <motion.div
          className="absolute bottom-10 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={textControls}
        >
          <h1 className="text-3xl font-bold">選擇您的旅遊地區</h1>
          <p className="text-neutral-600 mt-2">Powered by Motion + Tailwind</p>
        </motion.div>
      </section>

      {/* 第二段區塊 - 改為非 sticky + 流暢滾動 */}
      <section
        ref={ref}
        className="bg-white mt-[80px] pt-[60px] pb-[160px] flex flex-col items-center"
      >
        <h2 className="text-4xl font-bold mb-12 text-center">
          eSIM Tutorail <br />
          出國當日可於有網路的狀態下完成1-7步驟
        </h2>
        <div className="flex gap-8">
          {/* Step 1 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step01.png"
              alt="Phone 1"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y1 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 1：點擊設定裡的行動服務選項
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step02.png"
              alt="Phone 2"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y2 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 2：選擇加入 eSIM
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step03.png"
              alt="Phone 3"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y3 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 3：掃描 QR Code 完成設定
            </div>
          </div>
        </div>
      </section>
      <section
        ref={ref}
        className="bg-white mt-[80px] pt-[60px] pb-[160px] flex flex-col items-center"
      >
        <h2 className="text-4xl font-bold mb-12 text-center">
          啟用eSIM <br /> eSIm 安裝及設定
        </h2>
        <div className="flex gap-8">
          {/* Step 1 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step01.png"
              alt="Phone 1"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y1 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 1：點擊設定裡的行動服務選項
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step02.png"
              alt="Phone 2"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y2 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 2：選擇加入 eSIM
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step03.png"
              alt="Phone 3"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y3 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 3：掃描 QR Code 完成設定
            </div>
          </div>
          <div className="relative group">
            <motion.img
              src="/images/step/step03.png"
              alt="Phone 3"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y3 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 3：掃描 QR Code 完成設定
            </div>
          </div>
        </div>
      </section>
      <section
        ref={ref}
        className="bg-white mt-[80px] pt-[60px] pb-[160px] flex flex-col items-center"
      >
        <h2 className="text-4xl font-bold mb-12 text-center">
          切換eSIM <br /> 抵達目的地後再進行 ⑧~10步驟
        </h2>
        <div className="flex gap-8">
          {/* Step 1 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step01.png"
              alt="Phone 1"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y1 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 1：點擊設定裡的行動服務選項
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step02.png"
              alt="Phone 2"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y2 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 2：選擇加入 eSIM
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <motion.img
              src="/images/step/step03.png"
              alt="Phone 3"
              className="w-[200px] md:w-[280px] will-change-transform"
              style={{ y: y3 }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-white text-slate-800 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Step 3：掃描 QR Code 完成設定
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
