// 注意：如果是 Pages Router，這裡不需要 "use client"
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import https from "https"; // 用於後端 agent
import { motion } from "framer-motion";

// Components
import StickyColumns from "../../components/SwiperCarousel/SwiperCardChanel";
import GsapText from "@/components/RevealText/index";
import NewsCarousel from "../../components/EmblaCarouselFeatureCarousel/NewsCarousel";
import FeatureCarousel from "../../components/EmblaCarouselFeatureCarousel/index";

export default function Home({ chanelProducts }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  const backgroundImages = [
    "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251124_12.jpg",
    "/images/Premium_Handbags/LINE_ALBUM_美圖素材20251124_251125_1.jpg",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  // --- SEO JSON-LD ---
  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KÉSH de¹ 凱仕國際精品",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.cieman.com.tw",
  };

  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Chanel Items",
    itemListElement:
      chanelProducts?.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.title,
          image: product.image,
          description: product.shortDesc,
          sku: product.id,
          brand: { "@type": "Brand", name: "Chanel" },
          offers: {
            "@type": "Offer",
            priceCurrency: "TWD",
            price: product.rawPrice,
            availability: "https://schema.org/InStock",
          },
        },
      })) || [],
  };

  return (
    <>
      <Head>
        <title>KÉSH de¹ 凱仕國際精品 | Chanel, Hermes, LV 二手精品買賣</title>
        <meta
          name="description"
          content="KÉSH de¹ 專營 Chanel、Hermès、Louis Vuitton 等國際精品買賣、 專業鑑定。精選香奈兒 CF、Boy、19 包款，100% 正品保證。"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
        />
      </Head>

      <main className="py-20">
        <section className="">
          <StickyColumns />
        </section>

        <section className="my-20 max-w-[1200px] mx-auto">
          <div className="title flex justify-center flex-col items-center">
            <h1 className="text-[40px] font-normal uppercase">
              chanel<br></br>
            </h1>
            <p>品牌館</p>
          </div>
          <div className="brand-info">
            <p className="max-w-[500px] mx-auto text-center mt-4 text-gray-600">
              精選 Chanel 經典包款：CF、19、2.55、Boy、Coco Handle
              等。商品附完整品況描述與實拍照，透明公開、安心選購。
            </p>
          </div>
          <div className="chanel-feature-img"></div>
        </section>

        <section className="section_features py-10 overflow-hidden">
          <div className="title flex-col flex justify-center items-center ">
            <div className="relative group">
              <div className=" absolute left-1/2 z-50 -translate-x-1/2 bottom-[-30%] rotate-[90deg] bg-black group-hover:bg-[#6f6f6f] duration-400 h-[.5px] w-[70px]"></div>
              <div className="flex flex-col justify-center items-center pb-4">
                <h2 className="text-4xl ">FEATURE</h2>
                <p className="text-[14px] font-bold">精選商品</p>
              </div>
              {/* 改為連結到 Chanel 分類頁 */}
              <Link href="/category?brand=chanel" className="block">
                <div className="border py-3 duration-400 group-hover:text-[#ffffff] group-hover:bg-[#cbcbcb] px-5 border-[#6f6f6f] group-hover:border-[#c1c1c1] cursor-pointer">
                  PICK UP ITEMS
                </div>
              </Link>
            </div>
          </div>

          {/* ✅ 這裡傳入從後端抓到的 chanelProducts */}
          <div className="mt-8">
            <FeatureCarousel products={chanelProducts} />
          </div>
        </section>

        {/* --- 以下保持不變 --- */}
        <section className="section_category py-10 lg:py-20 h-auto">
          <div className="title flex-col flex justify-center items-center mb-8">
            <div className="relative group">
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

          <div className="category-products justify-center max-w-[1670px] mt-6 lg:mt-10 mx-auto px-4 lg:px-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
            {/* 保留原本的 Category Items */}
            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_necklace_bw.jpg"
                  className="w-full h-full object-cover absolute lg:group-hover:hidden"
                  width={800}
                  height={800}
                  alt="Handbags"
                />
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_necklace.jpg"
                  className="w-full h-full object-cover hidden lg:group-hover:block"
                  width={800}
                  height={800}
                  alt="Handbags"
                />
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Handbags</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_earring_bw.jpg"
                  className="w-full h-full object-cover absolute lg:group-hover:hidden"
                  width={800}
                  height={800}
                  alt="Jewelry"
                />
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_earring.jpg"
                  className="w-full h-full object-cover hidden lg:group-hover:block"
                  width={800}
                  height={800}
                  alt="Jewelry"
                />
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Jewelry</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_ring_bw.jpg"
                  className="w-full h-full object-cover absolute lg:group-hover:hidden"
                  width={800}
                  height={800}
                  alt="Shoes"
                />
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_ring.jpg"
                  className="w-full h-full object-cover hidden lg:group-hover:block"
                  width={800}
                  height={800}
                  alt="Shoes"
                />
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Shoes</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_blacelet_bw.jpg"
                  className="w-full h-full object-cover absolute lg:group-hover:hidden"
                  width={800}
                  height={800}
                  alt="Accessories"
                />
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_blacelet.jpg"
                  className="w-full h-full object-cover hidden lg:group-hover:block"
                  width={800}
                  height={800}
                  alt="Accessories"
                />
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Accessories</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>

            <div className="category-item w-full pt-4 lg:pt-10 group cursor-pointer">
              <div className="w-full aspect-[4/5] overflow-hidden relative">
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_bridal_bw.jpg"
                  className="w-full h-full object-cover absolute lg:group-hover:hidden"
                  width={800}
                  height={800}
                  alt="Wallets"
                />
                <Image
                  src="https://file002.shop-pro.jp/PA01372/068/ver2.0.0/cmn/img/assets/category_bridal.jpg"
                  className="w-full h-full object-cover hidden lg:group-hover:block"
                  width={800}
                  height={800}
                  alt="Wallets"
                />
              </div>
              <div className="flex py-3 lg:py-4 justify-between w-full items-center">
                <p className="text-sm lg:text-base">Wallets</p>
                <b className="text-xs lg:text-sm">NEWS</b>
              </div>
            </div>
          </div>
        </section>

        <section className="section-hero w-full aspect-[500/500] sm:aspect-[1024/576] xl:aspect-[1920/768] overflow-hidden relative">
          {backgroundImages.map((bg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 1 }}
              animate={{
                opacity: i === currentIndex ? 1 : 0,
                scale: i === currentIndex ? 1.15 : 1,
              }}
              transition={{
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 20, ease: "linear" },
              }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{ backgroundImage: `url(${bg})` }}
            />
          ))}
          <div className="bg-black opacity-40 w-full h-full absolute top-0 left-0 z-10" />
          <div className="hero-title w-1/3 absolute left-[10%] top-[60%] z-20">
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
                <div className="title flex-col flex justify-center items-center ">
                  <div className="relative group">
                    <div className="absolute left-1/2 z-50 -translate-x-1/2 bottom-[-30%] rotate-[90deg] bg-black group-hover:bg-[#6f6f6f] duration-400 h-[.5px] w-[70px]"></div>
                    <div className="flex flex-col justify-center items-center pb-4">
                      <h2 className="text-4xl ">NEWS</h2>
                      <p className="text-[14px] font-bold">消息新聞</p>
                    </div>
                    <div className="border py-3 duration-400 group-hover:text-[#ffffff] group-hover:bg-[#cbcbcb] px-5 border-[#6f6f6f] group-hover:border-[#c1c1c1]">
                      MORE INFO
                    </div>
                  </div>
                </div>
                <NewsCarousel />
              </section>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

// --- 🔥 後端邏輯：SSG + ISR ---
export async function getStaticProps() {
  const WC_URL = process.env.WC_SITE_URL;
  const CK = process.env.WC_CONSUMER_KEY;
  const CS = process.env.WC_CONSUMER_SECRET;
  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    // 1. 抓取 Chanel 分類 ID
    const catRes = await fetch(
      `${WC_URL}/wp-json/wc/v3/products/categories?consumer_key=${CK}&consumer_secret=${CS}&slug=chanel`,
      { agent },
    );
    const categories = await catRes.json();
    const chanelId = categories.length > 0 ? categories[0].id : null;

    let productsData = [];

    // 2. 抓取該分類下最新 10 筆商品 (orderby=date)
    if (chanelId) {
      const prodRes = await fetch(
        `${WC_URL}/wp-json/wc/v3/products?consumer_key=${CK}&consumer_secret=${CS}&category=${chanelId}&per_page=10&orderby=date&order=desc&status=publish`,
        { agent },
      );
      productsData = await prodRes.json();
    }

    // 3. 格式化資料
    const formattedProducts = Array.isArray(productsData)
      ? productsData.map((p) => {
          // 處理描述：去除 HTML 標籤並截斷
          const cleanDesc =
            (p.short_description || p.description || "")
              .replace(/<[^>]+>/g, "")
              .slice(0, 60) + "...";
          return {
            id: p.id,
            slug: p.slug, // 重要：用於連結
            title: p.name.toUpperCase(),
            price: `NT$ ${parseInt(p.price || 0).toLocaleString()}`,
            rawPrice: parseInt(p.price || 0), // 給 Schema 用
            image: p.images.length > 0 ? p.images[0].src : null,
            shortDesc: cleanDesc,
          };
        })
      : [];

    return {
      props: {
        chanelProducts: formattedProducts,
      },
      // ISR: 每 60 秒更新一次
      revalidate: 60,
    };
  } catch (error) {
    console.error("Home Data Fetch Error:", error);
    return { props: { chanelProducts: [] }, revalidate: 60 };
  }
}
