// components/Layout.js
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "@/components/Navbar/Navbar.jsx"; 
import Banner from "@/components/banner";
import Footer from "@/components/ui/footer.jsx";
import Head from "next/head";
import CartSidebar from "@/components/CartSidebar"; 
import { ReactLenis } from "@studio-freight/react-lenis";

export default function Layout({ children }) {
  
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  }, []);

  // === SEO & 結構化資料設定 ===
  const siteUrl = "https://www.kesh-de1.com";
  const siteName = "KÉSH de¹ 凱仕國際精品";
  const siteTitle = "KÉSH de¹ 凱仕國際精品｜台中二手精品買賣 ";
  const siteDescription =
    "KÉSH de¹ 凱仕國際精品位於台中，專營 Hermès、Chanel、Louis Vuitton、Dior 等國際精品品牌，提供二手精品買賣、 所有商品皆經專業鑑定與品況分級，僅販售 100% 正品。";
  const siteImage = `${siteUrl}/default-og-image.jpg`; 
  const storePhone = "0938-535-870";

  // 🔥 補回完整的店家結構化資料
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteName,
    url: siteUrl,
    image: siteImage,
    telephone: storePhone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "中清路一段 428 號",
      addressLocality: "台中市北區",
      addressRegion: "台中市",
      postalCode: "404",
      addressCountry: "TW",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "13:00",
        closes: "20:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/hello.cieman",
    ],
    priceRange: "$$-$$$$",
    description: siteDescription,
  };

  // 🔥 補回完整的網站結構化資料
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
     <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content="KÉSH de¹, 凱仕國際精品, 台中精品, 二手精品,  Hermès, Chanel, Louis Vuitton, Dior, Gucci, Loewe, Celine, YSL, Goyard" />
        <meta name="author" content="KÉSH de¹ Boutique" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="canonical" href={siteUrl} />

        {/* 🔥 加入了 key 的 OG Tags，確保商品頁能正確覆蓋 */}
        <meta property="og:locale" content="zh_TW" />
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:title" content={siteTitle} key="ogtitle" />
        <meta property="og:description" content={siteDescription} key="ogdesc" />
        <meta property="og:url" content={siteUrl} key="ogurl" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:image" content={siteImage} key="ogimage" />
        <meta property="og:image:secure_url" content={siteImage} key="ogimagesecure" />

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content={siteTitle} key="twtitle" />
        <meta name="twitter:description" content={siteDescription} key="twdesc" />
        <meta name="twitter:image" content={siteImage} key="twimage" />

        {/* 渲染結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </Head>

      <Navbar />
      <CartSidebar />

      <ReactLenis root>
        <div className="flex flex-col justify-between">
           <main>
             {children}
           </main>
           <div>
             <Banner />
             <Footer />
           </div>
        </div>
      </ReactLenis>
    </>
  );
}