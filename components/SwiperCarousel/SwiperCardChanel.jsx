"use client";

import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Card } from "@nextui-org/react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const images = [
  "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_18.jpg",
  "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_15.jpg",
  "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_4.jpg",
  "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_2.jpg",
];

export default function ProjectSwiper() {
  return (
    <div className="relative w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        // 1. 設定速度：1500ms 讓滑動過程變慢，更有高級感
        speed={1500}
        // 2. 自動播放：稍微拉長 delay，配合慢速滑動
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true, // 滑鼠放上去時暫停，體驗更好
        }}
        loop={true}
        centeredSlides={true}
        spaceBetween={16} // 讓 Swiper 控制間距，不要用 CSS 覆寫 margin
        breakpoints={{
          0: { slidesPerView: 1 },
          480: { slidesPerView: 1.2 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.5 },
          1024: { slidesPerView: 2.5 },
          1280: { slidesPerView: 2.5 },
        }}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        onSwiper={(swiper) => {
          setTimeout(() => {
            if (swiper.params.navigation) {
              const nav = swiper.params.navigation;
              // @ts-ignore
              nav.prevEl = document.querySelector(".custom-prev");
              // @ts-ignore
              nav.nextEl = document.querySelector(".custom-next");
              swiper.navigation.init();
              swiper.navigation.update();
            }
          });
        }}
        className="mx-auto !pb-10" // 增加底部 padding 避免陰影被切掉
      >
        {images.map((imgUrl, idx) => (
          <SwiperSlide
            key={idx}
            className="group relative overflow-hidden transition-all"
          >
            {/* 標題與按鈕區塊 (保持原本設計) */}
            <div className="title absolute top-5 left-5 z-[20] pointer-events-none">
              <span className="text-white text-[.9rem] drop-shadow-md">
                Project-0{idx + 1}
              </span>
            </div>
            
            <div className="title absolute bottom-5 right-5 z-[20]">
              <button className="relative h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 text-white hover:bg-white hover:text-black transition-colors duration-300">
                <span className="text-xs font-medium tracking-wider uppercase">
                  View More
                </span>
              </button>
            </div>

            {/* 圖片卡片 */}
            <div className="relative w-full overflow-hidden">
               {/* 黑色遮罩：Hover 時顯示 */}
              <div className="absolute z-10 w-full h-full inset-0 pointer-events-none bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out" />
              
              <Card
                className="!rounded-none border-none w-full h-[230px] md:h-[280px] lg:h-[320px] 2xl:h-[550px] max-h-[550px] bg-no-repeat bg-center bg-cover shadow-none transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${imgUrl}')` }}
              ></Card>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 關鍵 CSS 修改：
         1. 使用 cubic-bezier(0.65, 0, 0.35, 1) 這是經典的 "Ease-in-out Cubic"
            它會讓動畫：開始慢 -> 中間加速 -> 結束時非常緩慢的停下。
         2. 移除了原本的 !important margin 覆寫，這會破壞 Swiper 的流暢度。
      */}
      <style jsx global>{`
        .swiper-wrapper {
          transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1) !important;
        }
      `}</style>
    </div>
  );
}