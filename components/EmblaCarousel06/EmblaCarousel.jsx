import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
const EmblaCarousel = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  useEffect(() => {
    if (!emblaApi) return;
  }, [emblaApi]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing"
      ref={emblaRef}
    >
      <div
        className="flex max-w-[550px] touch-pan-y pb-8 touch-pinch-zoom"
        style={{ marginLeft: "-1rem" }}
      >
        {slides.map((slide, index) => (
          // 🔥 桌面版顯示 50% (露出兩個半)，手機版顯示 70% (露出一個半)
          <div
            className="flex-none min-w-0"
            key={index}
            style={{ flex: "0 0 55%", paddingLeft: "1rem" }}
          >
            <div className="flex flex-col items-center w-full group">
              {/* 商品圖片區 (淺灰底色，懸浮輕微放大) */}
              <div className="w-full aspect-[4/5] bg-[#f4f4f4] mb-5 overflow-hidden relative">
                <img
                  src={slide.image}
                  className="w-full h-full object-cover mix-blend-darken transition-transform duration-700 ease-out group-hover:scale-105"
                  alt={slide.title}
                />
              </div>

              {/* 商品資訊區 (還原圖片中的極簡排版) */}
              <div className="w-full text-center px-2">
                <h4 className="text-[10px] md:text-[11px] font-bold text-black uppercase tracking-widest line-clamp-1 mb-1.5">
                  {slide.title}
                </h4>

                <p className="text-[10px] md:text-[11px] font-bold text-gray-800 tracking-widest inline-block border-b border-gray-400 pb-[2px] mb-6">
                  {slide.price}
                </p>

                <Link
                  href={`/product/${slide.slug}`}
                  className="block w-full bg-black text-white text-[9px] md:text-[10px] font-bold tracking-[0.2em] py-3.5 hover:bg-gray-800 transition-colors uppercase"
                >
                  BUY NOW
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmblaCarousel;
