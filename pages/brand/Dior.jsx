"use client";
import StickyColumns from "../../components/SwiperCarousel/SwiperCardDior";

import GsapText from "@/components/RevealText/index";
import Link from "next/link";
import Image from "next/image";
import NewsCarousel from "../../components/EmblaCarouselFeatureCarousel/NewsCarousel"; // 檔案路徑依你的實際放置調整

import React from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import Slider from "../../components/FullSlider/Slider";
import FeatureCarousel from "../../components/EmblaCarouselFeatureCarousel/index";
export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const backgroundImages = [
    "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_12.jpg",
    "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_1.jpg",
  ];
  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(currentIndex); // 保留上一張索引
      setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <>
      <main className="py-20">
        <section className="">
          <StickyColumns />
        </section>

        <section className="my-20 max-w-[1200px] mx-auto">
          <div className="title flex justify-center flex-col items-center">
            <h1 className="text-[40px] font-normal">
              Dior<br></br>
            </h1>
            <p>品牌館</p>
          </div>
          <div className="brand-info">
            <p className="max-w-[500px] mx-auto text-center">
              Lady Dior、Caro、Bobby、Book Tote
              等系列皆可選購。透明品況、完整細節，是日常搭配與收藏的最佳選擇。
            </p>
          </div>
          <div className="chanel-feature-img"></div>
        </section>
        <section className="section_features py-10 overflow-hidden">
          <div className="title  flex-col flex  justify-center items-center ">
            <div className="relative group">
              <div className=" absolute left-1/2 z-50 -translate-x-1/2 bottom-[-30%] rotate-[90deg] bg-black group-hover:bg-[#6f6f6f] duration-400 h-[.5px] w-[70px]"></div>
              <div className="flex flex-col justify-center items-center pb-4">
                <h2 className="text-4xl ">FEATURE</h2>
                <p className="text-[14px] font-bold">精選商品</p>
              </div>
              <div className="border py-3 duration-400 group-hover:text-[#ffffff] group-hover:bg-[#cbcbcb] px-5 border-[#6f6f6f] group-hover:border-[#c1c1c1]">
                PICK UP ITEMS
              </div>
            </div>
          </div>
          <FeatureCarousel />
        </section>
        <section className="section_category py-10 lg:py-20 h-auto">
          <div className="title flex-col flex justify-center items-center mb-8">
            <div className="relative group">
              {/* 裝飾線：手機版縮短一點 w-[50px] -> lg:w-[70px] */}
              <div className="absolute left-1/2 z-50 -translate-x-1/2 bottom-[-20px] lg:bottom-[-30%] rotate-[90deg] bg-black group-hover:bg-[#6f6f6f] duration-400 h-[.5px] w-[50px] lg:w-[70px]"></div>
              <div className="flex flex-col justify-center items-center pb-4">
                <h2 className="text-3xl lg:text-4xl">CATEGORY</h2>
                <p className="text-[12px] lg:text-[14px] font-bold mt-1">
                  商品種類
                </p>
              </div>
              <div className="border py-2 lg:py-3 text-[12px] lg:text-base text-center duration-400 group-hover:text-[#ffffff] group-hover:bg-[#cbcbcb] px-4 lg:px-5 border-[#6f6f6f] group-hover:border-[#c1c1c1] cursor-pointer">
                PICK UP ITEMS
              </div>
            </div>
          </div>

          {/* 列表區：改用 Grid 佈局，實現手機版一排兩個 */}
          <div className="category-products justify-center max-w-[1670px] mt-6 lg:mt-10 mx-auto px-4 lg:px-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
            {/* Item 1 */}
            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <div className="absolute h-full block lg:group-hover:hidden transition-all duration-500 w-full top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_necklace_bw.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Handbags"
                  />
                </div>
                <div className="absolute h-full w-full hidden lg:group-hover:block transition-all duration-500 top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_necklace.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Handbags"
                  />
                </div>
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Handbags</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            {/* Item 2 */}
            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <div className="absolute h-full block lg:group-hover:hidden transition-all duration-500 w-full top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_earring_bw.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Jewelry"
                  />
                </div>
                <div className="absolute h-full w-full hidden lg:group-hover:block transition-all duration-500 top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_earring.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Jewelry"
                  />
                </div>
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Jewelry</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            {/* Item 3 */}
            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <div className="absolute h-full block lg:group-hover:hidden transition-all duration-500 w-full top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_ring_bw.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Shoes"
                  />
                </div>
                <div className="absolute h-full w-full hidden lg:group-hover:block transition-all duration-500 top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_ring.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Shoes"
                  />
                </div>
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Shoes</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            {/* Item 4 */}
            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <div className="absolute h-full block lg:group-hover:hidden transition-all duration-500 w-full top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_blacelet_bw.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Accessories"
                  />
                </div>
                <div className="absolute h-full w-full hidden lg:group-hover:block transition-all duration-500 top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_blacelet.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Accessories"
                  />
                </div>
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Accessories</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            {/* Item 5 */}
            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <div className="absolute h-full block lg:group-hover:hidden transition-all duration-500 w-full top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_bridal_bw.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Wallets"
                  />
                </div>
                <div className="absolute h-full w-full hidden lg:group-hover:block transition-all duration-500 top-0 left-0 z-20">
                  <Image
                    src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_bridal.jpg"
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    alt="Wallets"
                  />
                </div>
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Wallets</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>
          </div>
        </section>
        <section className="section-hero w-full aspect-[500/500] sm:aspect-[1024/576] xl:aspect-[1920/768] overflow-hidden relative">
          {/* 背景圖片群組 */}
          {backgroundImages.map((bg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: i === currentIndex ? 1 : 0,
                scale: i === currentIndex ? 1.15 : 1, // 放大範圍加大
              }}
              transition={{
                opacity: { duration: 1.5, ease: "easeInOut" }, // 切換用淡入淡出
                scale: { duration: 20, ease: "linear" }, // 放大效果持續 20 秒
              }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{
                backgroundImage: `url(${bg})`,
              }}
            />
          ))}

          {/* 黑色遮罩 */}
          <div className="bg-black opacity-40 w-full h-full absolute top-0 left-0 z-10" />

          {/* 文字區塊 */}
          <div className="hero-title  w-1/3 absolute left-[10%] top-[60%] z-20">
            <div className=" px-4">
              <GsapText
                text="Built for Living."
                id="gsap-intro"
                fontSize="2.6rem"
                fontWeight="200"
                color="#fff"
                lineHeight="60px"
                className=" !text-white tracking-widest inline-block mb-0 h-auto"
              />
            </div>
            <div className=" px-4">
              <GsapText
                text="Yi Yuan"
                id="gsap-intro"
                fontSize="1.5rem"
                fontWeight="200"
                color="#fff"
                lineHeight="30px"
                className="text-center !text-white tracking-widest inline-block mb-0 h-auto"
              />
            </div>
          </div>
        </section>
        <section className="w-full pt-20 bg-[#bcbcba] section-content overflow-hidden">
          <div className="max-w-[550px] mx-auto flex px-6 justify-center items-center flex-col">
            <h2 className="text-[2rem] tracking-wider font-bold text-stone-700">
              PHILOSOPHY
            </h2>
            <p className="leading-loose tracking-wider text-[14px] text-stone-600">
              アイデンティティとしての装身具をテーマに、日本人女性としての美しさと、西洋の古典ジュエリー技法を研究するアトリエです。一過性のファッションとしてではなく、大人になった自分の分身のような存在になれることを目指しています。
            </p>
            <Link href="#">
              <p className="text-[14px] text-stone-600 border-b-1 border-stone-600 font-bold">
                Read More
              </p>
            </Link>
          </div>
          <section className="section-footer p-3 lg:p-10 2xl:p-20">
            <div className="mx-auto w-[90%] 2xl:w-[80%] py-20">
              <section className=" w-full mt-4 ]">
                <div className="title  flex-col flex  justify-center items-center ">
                  <div className="relative group">
                    <div className=" absolute left-1/2 z-50 -translate-x-1/2 bottom-[-30%] rotate-[90deg] bg-black group-hover:bg-[#6f6f6f] duration-400 h-[.5px] w-[70px]"></div>
                    <div className="flex flex-col justify-center items-center pb-4">
                      <h2 className="text-4xl ">NEWS</h2>
                      <p className="text-[14px] font-bold">消息新聞</p>
                    </div>
                    <div className="border py-3 duration-400 group-hover:text-[#ffffff] group-hover:bg-[#cbcbcb] px-5 border-[#6f6f6f] group-hover:border-[#c1c1c1]">
                      MORE INFO
                    </div>
                  </div>
                </div>
                {/* ✅ 改用輪播 */}
                <NewsCarousel />
              </section>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
