import React from "react";
import EmblaCarousel from "./EmblaCarousel";

const OPTIONS = { dragFree: true, loop: true };

// ✅ 接收從 Home 傳來的 products
const FeatureCarousel = ({ products }) => {
  
  // 如果 API 還沒回傳或發生錯誤，給一個空陣列避免報錯
  if (!products || products.length === 0) {
    return null; // 或者可以回傳一個 Loading 骨架屏
  }

  // 將 WooCommerce 的資料格式 轉換成 EmblaCarousel 需要的格式
  const slides = products.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    image: item.image || "/images/placeholder.jpg", // 若無圖片顯示佔位圖
    price: item.price,
    description: item.shortDesc || "Featured Chanel Item",
  }));

  return (
    <>
      <EmblaCarousel slides={slides} options={OPTIONS} />
    </>
  );
};

export default FeatureCarousel;