import React from "react";
import EmblaCarousel from "./EmblaCarousel";

const OPTIONS = { dragFree: true, loop: true };

// ✅ 接收從 Home 傳來的 products
const FeatureCarousel = ({ products }) => {
  
  // 如果 API 還沒回傳或發生錯誤，給一個空陣列避免報錯
  if (!products || products.length === 0) {
    return null; // 或者可以回傳一個 Loading 骨架屏
  }

  // 將商品資料格式轉換成 EmblaCarousel 需要的格式
  const slides = products.map((item) => ({
    id: item.id,
    slug: item.slug || item.handle,
    title: item.title,
    image: item.image || "/images/placeholder.jpg",
    price: item.price,
    description: item.shortDesc || "Featured Item",
  }));

  return (
    <>
      <EmblaCarousel slides={slides} options={OPTIONS} />
    </>
  );
};

export default FeatureCarousel;