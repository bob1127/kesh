// pages/index.js
import React from "react";
import EmblaCarousel from "./EmblaCarousel"; // 請依照你的路徑調整
import https from "https"; // 記得引入這個

const OPTIONS = { dragFree: true, loop: true };

export default function Home({ carouselSlides }) {
  return (
    <main className="min-h-screen bg-white">
      {/* 這裡是你原本的 Header 或其他內容 */}
      
      <section className="py-10">
        <h2 className="text-center text-3xl font-bold mb-6 uppercase tracking-widest">
          Featured Collections
        </h2>
        
        {/* 將抓到的資料傳入 Carousel */}
        <EmblaCarousel slides={carouselSlides} options={OPTIONS} />
      </section>

      {/* 這裡是你原本的 Footer */}
    </main>
  );
}

// --- 🔥 SSG: 服務端抓取資料 ---
export async function getStaticProps() {
  const WC_URL = process.env.WC_SITE_URL;
  const CK = process.env.WC_CONSUMER_KEY;
  const CS = process.env.WC_CONSUMER_SECRET;

  // 1. 安全檢查
  if (!WC_URL || !CK || !CS) {
    console.error("❌ 環境變數缺失！");
    return { props: { carouselSlides: [] } };
  }

  // 2. 設定 Agent (沿用你的邏輯，解決 SSL 問題)
  const agent = new https.Agent({ rejectUnauthorized: false });
  // WooCommerce 驗證 Header (Basic Auth)
  const auth = Buffer.from(`${CK}:${CS}`).toString('base64');
  const headers = {
    "User-Agent": "Mozilla/5.0 (Next.js)",
    "Authorization": `Basic ${auth}`
  };

  try {
    // 3. 抓取資料：這裡設定 featured=true (精選商品) 且只抓 10 筆
    // 如果你想抓最新商品，把 featured=true 拿掉即可
// 👇 修改後 (拿掉 featured=true，只抓最新發布的 10 筆)
    console.log("🔍 正在嘗試抓取商品..."); // 加入 Log 方便觀察
    
    const res = await fetch(
      `${WC_URL}/wp-json/wc/v3/products?status=publish&per_page=10`, 
      { agent, headers }
    );

    // 👇 加入這段來檢查抓到幾筆
    const products = await res.json();
    console.log(`✅ 成功抓取到 ${products.length} 筆商品`);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    
 

    // 4. 資料格式化 (轉成 EmblaCarousel 看得懂的格式)
    const formattedSlides = products.map((p) => {
      
      // 圖片處理 (沿用你的 HTTPS 修正邏輯)
      let imageUrl = "/images/placeholder.jpg"; // 預設圖
      if (p.images && p.images.length > 0) {
          let src = p.images[0].src;
          if (src.startsWith('http://')) {
              src = src.replace('http://', 'https://');
          }
          imageUrl = src;
      }

      const price = `NT$ ${parseInt(p.price || 0).toLocaleString()}`;

      return {
        id: p.id,
        slug: p.slug, // 用來做連結
        title: p.name,
        description: price, // 將價格放在原本 description 的位置
        image: imageUrl,
        content: null, // 如果原本有特殊 content 邏輯可保留，這裡設 null 讓它跑圖片邏輯
      };
    });

    return {
      props: {
        carouselSlides: formattedSlides,
      },
      revalidate: 60, // 每 60 秒更新一次 (ISR)
    };

  } catch (error) {
    console.error("❌ Carousel Fetch Error:", error);
    return {
      props: { carouselSlides: [] },
      revalidate: 60,
    };
  }
}