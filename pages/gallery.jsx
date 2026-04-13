"use client";
import { useEffect, useRef, useState } from "react";
import Layout from "./Layout.js";
import MiniMapGallery from "../components/MiniMapGallery.jsx";

export default function Home() {
  const [showGallery, setShowGallery] = useState(false);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 點擊圖片時觸發
  const handleImageClick = (e) => {
    const clickedSrc = e.target.src;

    const allImages = Array.from(
      document.querySelectorAll('img[data-gallery="true"]')
    )
      .filter((img) => img.src?.startsWith("http"))
      .map((img) => img.src);

    const index = allImages.indexOf(clickedSrc);
    setImages(allImages);
    setCurrentIndex(index >= 0 ? index : 0);
    setShowGallery(true);
  };

  useEffect(() => {
    const imgs = Array.from(
      document.querySelectorAll('img[data-gallery="true"]')
    );

    imgs.forEach((img) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", handleImageClick);
    });

    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("click", handleImageClick);
      });
    };
  }, []);

  return (
    <Layout>
      <div className="px-4 md:px-10">
        <section className="hero min-h-screen pt-[150px] flex justify-center items-end">
          <div className="flex flex-col max-w-[1920px] w-[80%]">
            <div className="title mb-4">
              <h1 className="text-7xl">Gallery</h1>
              <div className="max-w-[550px]">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </div>
            </div>
            <div className="w-2/3 h-[calc(100vh-150px-100px)] border border-black rounded-lg overflow-hidden">
              <video
                src="https://corp.drenty.jp/wp-content/themes/drenty-corporatesite/assets/images/page/gallery/panel_01.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="column-01 flex justify-center items-start">
          <div className="flex flex-col max-w-[1920px] border w-[80%]">
            <div className="flex flex-col md:flex-row justify-end">
              <div className="w-full md:w-1/4 flex flex-col justify-end p-4">
                <h2 className="text-3xl">KUNPU MATCHA</h2>
                <p className="mt-5 leading-relaxed">
                  宇治抹茶独特の苦みと甘みが、さっくりとしたラングドシャ的食感をより一層引き立てる。
                </p>
              </div>
              <div className="w-full md:w-1/3 h-[300px] md:h-[450px] overflow-hidden">
                <img
                  src="https://www.tsi-holdings.com/assets/img/page/index/mv_01.jpg"
                  alt="gallery-img"
                  data-gallery="true"
                  className="w-auto h-full object-cover mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="column-01 flex justify-center items-start">
          <div className="flex max-w-[1920px] justify-between border w-[80%]">
            <div className="w-1/4">
              <img
                src="https://corp.drenty.jp/wp-content/themes/drenty-corporatesite/assets/images/page/gallery/panel_03.webp"
                alt="gallery-img"
                data-gallery="true"
                width={800}
                height={600}
              />
              <h2 className="text-xl mt-2">CACAO RARE CAKE</h2>
              <p className="text-sm mt-2">
                濃厚でとろけるビターチョコレートが同時に堪能できる、チョコレート専門店ならではの贅沢なケーキ。
              </p>
            </div>
            <div className="w-1/3">
              <img
                src="https://www.dot-st.com/static/docs/lowrysfarm/pages/girls_market_2025/assets/img/lowrysfarm_new_bag_to_your_liking/ph6.jpg"
                alt="gallery-img"
                data-gallery="true"
                width={800}
                height={600}
              />
              <h2 className="text-xl mt-2">CACAO RARE CAKE</h2>
              <p className="text-sm mt-2">
                濃厚でとろけるビターチョコレートが同時に堪能できる、チョコレート専門店ならではの贅沢なケーキ。
              </p>
            </div>
          </div>
        </section>
      </div>

      {showGallery && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm minimap-popup">
          <MiniMapGallery
            images={images}
            currentIndex={currentIndex}
            onClose={() => setShowGallery(false)}
          />
        </div>
      )}
    </Layout>
  );
}
