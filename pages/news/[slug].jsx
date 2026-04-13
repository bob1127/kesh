import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import https from "https";
import { format } from "date-fns";

// --- 1. 推薦閱讀組件 (Recent Journal) ---
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

  // 用於存放動態抓取的標題與文章的 Ref
  const [headings, setHeadings] = useState([]);
  const contentRef = useRef(null);

  // 在客戶端渲染後，抓取文章內的 h2 並賦予 id
  useEffect(() => {
    if (contentRef.current) {
      // 抓取內容區塊中所有的 h2 標籤
      const h2Elements = Array.from(contentRef.current.querySelectorAll("h2"));

      const newHeadings = h2Elements.map((h2, index) => {
        const id = `heading-${index}`;
        h2.id = id; // 動態為 DOM 元素加上 id，作為錨點
        return {
          id: id,
          text: h2.innerText,
        };
      });

      setHeadings(newHeadings);
    }
  }, [post]);

  // 平滑滾動處理函數 (可避免錨點跳轉被 fixed Header 蓋住)
  const scrollToHeading = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // 若你的導覽列(Navbar)高度不同，請修改 -100 這個數值
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Head>
        <title>{post.title} | KÉSH de¹ Journal</title>
        <meta
          name="description"
          content={post.excerpt.replace(/<[^>]+>/g, "")}
        />
      </Head>

      <main className="bg-white min-h-screen pt-24 pb-20 font-sans text-[#1a1a1a]">
        {/* 1. Hero 圖片區 */}
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

        {/* 2. 標題與資訊區 */}
        <div className="max-w-[1000px] mx-auto px-6 mb-16 border-b border-gray-200 pb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* 左側：標題 */}
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

            {/* 右側：活動資訊 */}
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

        {/* 3. 文章內容與側邊欄區塊 */}
        <div className="max-w-[1000px] mx-auto px-6 mb-24 flex flex-col lg:flex-row gap-16 items-start">
          {/* 左側：Sticky 標題導覽列 */}
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

          {/* 右側：文章主要內容 */}
          <div className="flex-1 w-full max-w-[700px]">
            <article
              ref={contentRef}
              className="prose prose-stone max-w-none 
                    
                    /* --- <p> 標籤優化 --- */
                    prose-p:text-[15px] prose-p:leading-[1.8] prose-p:tracking-[0.03em] prose-p:text-gray-700 
                    
                    /* --- <h2> 標籤優化 --- */
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-16 prose-h2:mb-8 prose-h2:tracking-wider prose-h2:text-gray-900 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4
                    
                    /* --- <b> / <strong> 標籤優化 --- */
                    prose-strong:font-bold prose-strong:text-black prose-strong:tracking-wide
                    [&>p>b]:font-bold [&>p>b]:text-black [&>p>b]:tracking-wide
                    
                    /* --- 圖片與連結優化 --- */
                    prose-img:w-full prose-img:aspect-[4/3] prose-img:object-cover prose-img:my-12 prose-img:bg-gray-50 prose-img:rounded-md
                    prose-a:text-[#ef4628] prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 底部 Icon */}
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

        {/* 4. 店家資訊卡 */}
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
                我們致力於打造最優質的二手精品交易平台，提供透明的報價與專業的鑑定服務。
                每一件商品都經過嚴格把關，讓您買得安心，賣得放心。
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

        {/* 5. 底部導航與推薦 (Recent Journal) */}
        <div className="max-w-[1200px] mx-auto px-6 pb-20 border-t border-gray-200 pt-16">
          {/* Back Button */}
          <div className="flex justify-center mb-16">
            <Link
              href="/news"
              className="px-8 py-3 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Back to Journal
            </Link>
          </div>

          {/* Recent Journal Title */}
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-normal uppercase tracking-wide">
              Recent Journal
            </h2>
            <span className="bg-[#1c1c1c] text-white text-[10px] rounded-full px-3 py-1 font-bold">
              News
            </span>
          </div>

          {/* Recent Journal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {recentPosts.map((item) => (
              <RecentJournalCard key={item.id} post={item} />
            ))}
          </div>

          {/* Tags */}
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

// --- 🔥 SSG: 預先生成路徑 ---
export async function getStaticPaths() {
  const WC_URL = process.env.WC_SITE_URL;
  if (!WC_URL) return { paths: [], fallback: "blocking" };

  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    const res = await fetch(
      `${WC_URL}/wp-json/wp/v2/posts?per_page=10&status=publish`,
      { agent },
    );
    const posts = await res.json();

    const paths = posts.map((post) => ({
      params: { slug: post.slug },
    }));

    return { paths, fallback: "blocking" };
  } catch (err) {
    return { paths: [], fallback: "blocking" };
  }
}

// --- 🔥 ISR: 抓取文章內容 ---
export async function getStaticProps({ params }) {
  const WC_URL = process.env.WC_SITE_URL;
  const slug = params.slug;

  if (!WC_URL) return { notFound: true };

  const agent = new https.Agent({ rejectUnauthorized: false });

  try {
    // 1. 抓取當前文章 (依 Slug)
    const res = await fetch(
      `${WC_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      { agent },
    );
    const posts = await res.json();

    if (!posts || posts.length === 0) {
      return { notFound: true };
    }

    const p = posts[0];

    // 格式化當前文章
    const formattedPost = {
      id: p.id,
      title: p.title.rendered,
      content: p.content.rendered,
      excerpt: p.excerpt.rendered,
      date: new Date(p.date).toLocaleDateString("en-CA").replace(/-/g, "."),
      image:
        p._embedded && p._embedded["wp:featuredmedia"]
          ? p._embedded["wp:featuredmedia"][0].source_url.replace(
              "http://",
              "https://",
            )
          : "/images/placeholder.jpg",
    };

    // 2. 抓取近期文章 (排除自己，取 3 篇)
    const recentRes = await fetch(
      `${WC_URL}/wp-json/wp/v2/posts?per_page=3&exclude=${p.id}&_embed`,
      { agent },
    );
    const recentData = await recentRes.json();

    const formattedRecent = recentData.map((rp) => ({
      id: rp.id,
      slug: rp.slug,
      title: rp.title.rendered,
      excerpt: rp.excerpt.rendered,
      date: new Date(rp.date).toLocaleDateString("en-CA").replace(/-/g, "."),
      image:
        rp._embedded && rp._embedded["wp:featuredmedia"]
          ? rp._embedded["wp:featuredmedia"][0].source_url.replace(
              "http://",
              "https://",
            )
          : "/images/placeholder.jpg",
    }));

    return {
      props: {
        post: formattedPost,
        recentPosts: formattedRecent,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Post detail error:", error);
    return { notFound: true };
  }
}
