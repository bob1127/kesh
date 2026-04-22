import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

// 🔥 引入多語系翻譯需要的套件
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// --- 1. 推薦閱讀組件 ---
const RecentJournalCard = ({ post }) => (
  <Link href={`/news/${post.slug}`} className="block group">
    <div className="relative w-full aspect-[4/3] bg-gray-100 mb-4 overflow-hidden">
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        unoptimized={true}
      />
    </div>
    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-2 uppercase tracking-wider">
      <span className="border-b border-gray-300 pb-0.5">News</span>
      <span>{post.date}</span>
    </div>
    <h3 className="text-sm font-bold uppercase leading-snug mb-2 group-hover:text-[#ef4628] transition-colors line-clamp-2">
      {post.title}
    </h3>
    <div
      className="text-xs text-gray-400 line-clamp-3 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: post.excerpt }}
    />
  </Link>
);

// --- 🔥 主頁面: News 內頁 ---
export default function NewsDetail({ post, recentPosts }) {
  const router = useRouter();
  const { t } = useTranslation("common"); // 引入翻譯 Hook
  const [headings, setHeadings] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const h2Elements = Array.from(contentRef.current.querySelectorAll("h2"));
      const newHeadings = h2Elements.map((h2, index) => {
        const id = `heading-${index}`;
        h2.id = id;
        return { id: id, text: h2.innerText };
      });
      setHeadings(newHeadings);
    }
  }, [post]);

  const scrollToHeading = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (router.isFallback)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!post) return null;

  const siteUrl =
    process.env.NEXT_PUBLIC_STORE_URL || "https://www.kesh-de1.com";
  const postUrl = `${siteUrl}/news/${post.slug}`;
  const metaDesc =
    post.seo_description || post.excerpt?.replace(/<[^>]+>/g, "");

  // 🔥 SEO 結構化資料 1：文章標記 (BlogPosting)
  const schemaArticle = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    headline: post.seo_title || post.title,
    description: metaDesc,
    image: post.image !== "/images/placeholder.jpg" ? [post.image] : [],
    datePublished: post.raw_created_at,
    dateModified: post.raw_updated_at || post.raw_created_at,
    author: { "@type": "Organization", name: "KÉSH de¹ 編輯部", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "KÉSH de¹ 凱仕國際精品",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/company-logo/KESH%20Logo.png`,
      },
    },
  };

  // 🔥 SEO 結構化資料 2：麵包屑導覽 (BreadcrumbList)
  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首頁", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "最新消息",
        item: `${siteUrl}/news`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <Head>
        <title>{post.seo_title || `${post.title} | KÉSH de¹ Journal`}</title>
        <meta name="description" content={metaDesc} />
        {post.seo_keywords && (
          <meta name="keywords" content={post.seo_keywords} />
        )}

        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={post.image} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="article" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticle) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }}
        />
      </Head>

      <main className="bg-white min-h-screen pt-24 pb-20 font-sans text-[#1a1a1a]">
        <div className="w-full max-w-[1200px] mx-auto px-0 md:px-6 mb-12">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100 overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              unoptimized={true}
            />
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-6 mb-16 border-b border-gray-200 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <span className="inline-block border-b border-black text-xs font-bold uppercase tracking-widest mb-4">
                News
              </span>
              <h1 className="text-3xl md:text-4xl font-bold uppercase leading-tight mb-2 tracking-wide">
                {post.title}
              </h1>
              <p className="text-sm text-gray-400 uppercase tracking-widest font-light">
                KÉSH de¹ OFFICIAL JOURNAL
              </p>
              <p className="text-xs font-mono mt-4 text-gray-500">
                {post.date}
              </p>
            </div>
            <div className="w-full md:w-[280px] text-xs text-gray-500 space-y-4 pt-2">
              <div className="flex justify-end gap-4 mb-6">
                <span className="uppercase tracking-widest text-[10px]">
                  Share :
                </span>
                <a href="#" className="hover:text-black">
                  FB
                </a>
                <a href="#" className="hover:text-black">
                  TW
                </a>
              </div>
              <div className="space-y-1 border-l-2 border-gray-100 pl-4">
                <p className="font-bold text-gray-900">發佈單位</p>
                <p>KÉSH de¹ 編輯部</p>
              </div>
              <div className="space-y-1 border-l-2 border-gray-100 pl-4">
                <p className="font-bold text-gray-900">分類</p>
                <p>Fashion / Events</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-6 mb-24 flex flex-col lg:flex-row gap-16 items-start">
          <aside className="hidden lg:block w-48 sticky top-32 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-3">
              Table of Contents
            </h3>
            {headings.length > 0 ? (
              <ul className="space-y-4 border-l-2 border-gray-100 pl-4">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => scrollToHeading(e, heading.id)}
                      className="text-[13px] text-gray-500 hover:text-[#ef4628] transition-colors line-clamp-2 leading-relaxed font-medium block"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">No outlines available.</p>
            )}
          </aside>

          <div className="flex-1 w-full max-w-[700px]">
            <article
              ref={contentRef}
              className="prose prose-stone max-w-none prose-p:text-[15px] prose-p:leading-[1.8] prose-p:tracking-[0.03em] prose-p:text-gray-700 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-16 prose-h2:mb-8 prose-h2:tracking-wider prose-h2:text-gray-900 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4 prose-strong:font-bold prose-strong:text-black prose-strong:tracking-wide [&>p>b]:font-bold [&>p>b]:text-black [&>p>b]:tracking-wide prose-img:w-full prose-img:aspect-[4/3] prose-img:object-cover prose-img:my-12 prose-img:bg-gray-50 prose-img:rounded-md prose-a:text-[#ef4628] prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="flex justify-end mt-16">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#ef4628] transition-colors">
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-16 mb-24">
          <div className="max-w-[800px] mx-auto px-6 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-gray-200 shrink-0">
              <span className="font-bold text-xs text-center leading-tight">
                KÉSH
                <br />
                de¹
              </span>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4">
                KÉSH de¹ 凱仕國際精品
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-lg">
                我們致力於打造最優質的二手精品交易平台，提供透明的報價與專業的鑑定服務。每一件商品都經過嚴格把關，讓您買得安心，賣得放心。
              </p>
              <div className="text-[10px] text-gray-400 space-y-1">
                <p>
                  Official HP :{" "}
                  <a href="/" className="underline hover:text-black">
                    www.kesh-de1.com
                  </a>
                </p>
                <p>
                  Instagram :{" "}
                  <a href="#" className="underline hover:text-black">
                    @kesh_de1
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 pb-20 border-t border-gray-200 pt-16">
          <div className="flex justify-center mb-16">
            <Link
              href="/news"
              className="px-8 py-3 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Back to Journal
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-normal uppercase tracking-wide">
              Recent Journal
            </h2>
            <span className="bg-[#1c1c1c] text-white text-[10px] rounded-full px-3 py-1 font-bold">
              News
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {recentPosts.map((item) => (
              <RecentJournalCard key={item.id} post={item} />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Feature",
              "Information",
              "Interview",
              "Life Style",
              "News",
              "Season Visual",
              "Styling",
            ].map((tag) => (
              <span
                key={tag}
                className="bg-[#1c1c1c] text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#ef4628] transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  try {
    const res = await fetch(`${BACKEND_URL}/store/custom/posts`, {
      headers: { "x-publishable-api-key": PUB_KEY },
    });
    const data = await res.json();
    const paths = (data.posts || [])
      .filter((p) => p.is_active)
      .map((post) => ({
        params: { slug: post.slug },
      }));
    return { paths, fallback: "blocking" };
  } catch (err) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params, locale }) {
  const slug = params.slug;
  const currentLang = locale || "zh-TW"; // 確保拿到當前語系

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  const headers = { "x-publishable-api-key": PUB_KEY };

  try {
    const res = await fetch(`${BACKEND_URL}/store/custom/posts`, { headers });
    const data = await res.json();
    const allPosts = (data.posts || []).filter((p) => p.is_active);

    const currentPostRaw = allPosts.find((p) => p.slug === slug);
    if (!currentPostRaw) return { notFound: true };

    const formattedPost = {
      id: currentPostRaw.id,
      title: currentPostRaw.title,
      content: currentPostRaw.content,
      excerpt: currentPostRaw.excerpt || "",
      seo_title: currentPostRaw.seo_title || null,
      seo_description: currentPostRaw.seo_description || null,
      seo_keywords: currentPostRaw.seo_keywords || null,
      date: new Date(currentPostRaw.created_at)
        .toLocaleDateString("en-CA")
        .replace(/-/g, "."),
      raw_created_at: currentPostRaw.created_at,
      raw_updated_at: currentPostRaw.updated_at || currentPostRaw.created_at,
      image: currentPostRaw.thumbnail || "/images/placeholder.jpg",
    };

    const recentPostsRaw = allPosts
      .filter((p) => p.id !== currentPostRaw.id)
      .slice(0, 3);
    const formattedRecent = recentPostsRaw.map((rp) => ({
      id: rp.id,
      slug: rp.slug,
      title: rp.title,
      excerpt: rp.excerpt || "",
      date: new Date(rp.created_at)
        .toLocaleDateString("en-CA")
        .replace(/-/g, "."),
      image: rp.thumbnail || "/images/placeholder.jpg",
    }));

    return {
      props: {
        post: formattedPost,
        recentPosts: formattedRecent,
        // 🔥 關鍵修復：補回多語系載入檔案 (加入 navbar, footer 等等)
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Post detail error:", error);
    return { notFound: true };
  }
}
