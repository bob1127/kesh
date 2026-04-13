import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import https from "https";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// --- 1. Hero 文章組件 ---
const HeroPost = ({ post, t }) => {
  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mb-16 md:mb-24 group cursor-pointer relative"
    >
      <Link
        href={`/news/${post.slug}`}
        className="block relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-gray-100"
      >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
        </div>

        <div className="absolute bottom-0 left-0 md:left-auto md:right-[10%] md:bottom-[10%] w-full md:w-[500px] bg-[#ef4628]/90 text-white p-8 md:p-12 backdrop-blur-sm transition-all duration-300">
          <div className="flex justify-between items-start mb-4 border-b border-white/30 pb-4">
            <span className="text-xs font-bold tracking-[0.2em] uppercase">
              {t("news.badge_latest")}
            </span>
            <span className="text-sm font-mono">{post.date}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold uppercase leading-tight mb-4 line-clamp-2">
            {post.title}
          </h2>
          <div
            className="text-sm md:text-base font-light opacity-90 line-clamp-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
          <div className="mt-6 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            {t("news.read_more")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- 2. 一般文章卡片 ---
const NewsCard = ({ post, index, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col"
    >
      <Link href={`/news/${post.slug}`} className="block h-full flex flex-col">
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 mb-5">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            unoptimized={true}
          />
          <div className="absolute top-0 right-0 bg-white px-3 py-1 text-xs font-mono font-medium text-black">
            {post.date}
          </div>
        </div>

        <div className="flex flex-col flex-grow border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[#ef4628] uppercase tracking-widest">
              {t("news.badge_news")}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 uppercase group-hover:text-[#ef4628] transition-colors line-clamp-2">
            {post.title}
          </h3>

          <div
            className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4 flex-grow"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />

          <div className="mt-auto">
            <span className="inline-block border-b border-black pb-0.5 text-[10px] font-bold tracking-widest uppercase group-hover:border-[#ef4628] group-hover:text-[#ef4628] transition-colors">
              {t("news.view_details")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- 🔥 主頁面 ---
export default function NewsPage({ posts }) {
  const { t } = useTranslation("common");

  // 將第一篇文章設為 Hero，其餘為 Grid
  const heroPost = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <>
      <Head>
        <title>{t("news.seo_title")}</title>
        <meta name="description" content={t("news.seo_desc")} />
      </Head>

      <main className="bg-white min-h-screen pt-24 pb-20">
        {/* 頁面標題區 */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-2">
              {t("news.page_title")}
            </h1>
            <p className="text-sm text-gray-500 tracking-widest uppercase">
              {t("news.page_subtitle")}
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-xs font-mono text-gray-400">
              {t("news.updated")} {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {t("news.no_posts")}
            </div>
          ) : (
            <>
              {/* 傳遞 t 給子元件 */}
              <HeroPost post={heroPost} t={t} />

              {gridPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {gridPosts.map((post, index) => (
                    <NewsCard key={post.id} post={post} index={index} t={t} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 底部裝飾 */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24">
          <div className="w-full h-[1px] bg-gray-200"></div>
          <div className="flex justify-between items-center py-6">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              {t("news.footer_official")}
            </span>
            <Link
              href="/shop"
              className="text-[10px] font-bold uppercase tracking-widest hover:text-[#ef4628]"
            >
              {t("news.footer_store")}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

// --- 🔥 SSG 抓取 WordPress 文章 ---
export async function getStaticProps({ locale }) {
  const currentLang = locale || "zh-TW";
  const WC_URL = process.env.WC_SITE_URL;

  if (!WC_URL) {
    return {
      props: {
        posts: [],
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
      revalidate: 60,
    };
  }

  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    // 💡 提示：如果你的 WordPress 外掛支援透過 lang 參數篩選語言 (例如 WPML 或 Polylang REST API)，
    // 可以將網址改為：`${WC_URL}/wp-json/wp/v2/posts?_embed&per_page=12&status=publish&lang=${currentLang}`
    const res = await fetch(
      `${WC_URL}/wp-json/wp/v2/posts?_embed&per_page=12&status=publish`,
      { agent },
    );

    if (!res.ok) throw new Error("Failed to fetch posts");

    const data = await res.json();

    const formattedPosts = data.map((post) => {
      let imageUrl = "/images/placeholder.jpg";
      if (
        post._embedded &&
        post._embedded["wp:featuredmedia"] &&
        post._embedded["wp:featuredmedia"][0]
      ) {
        let src = post._embedded["wp:featuredmedia"][0].source_url;
        if (src.startsWith("http://")) {
          src = src.replace("http://", "https://");
        }
        imageUrl = src;
      }

      const dateObj = new Date(post.date);
      const formattedDate = dateObj
        .toLocaleDateString("en-CA")
        .replace(/-/g, ".");

      return {
        id: post.id,
        slug: post.slug,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered,
        date: formattedDate,
        image: imageUrl,
      };
    });

    return {
      props: {
        posts: formattedPosts,
        // 🔥 注入多語系檔案
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("News fetch error:", error);
    return {
      props: {
        posts: [],
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
      revalidate: 60,
    };
  }
}
