import React from "react";
import EmblaCarousel from "./EmblaCarousel";

const OPTIONS = { dragFree: true, loop: true };

// 🔥 接收外部傳入的 products
const App = ({ products = [] }) => (
  <div className="w-full">
    {/* 將產品資料傳遞給輪播元件 */}
    <EmblaCarousel slides={products} options={OPTIONS} />
  </div>
);

export default App;
