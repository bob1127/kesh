import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

// 🔥 引入多語系翻譯需要的套件
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  buildArticleJsonLd,
  fetchProductsForArticle,
  getArticleUrl,
  getOgLocale,
  stripHtml,
} from "@/lib/news-article-seo";
import { getSchemaBrand, getSchemaBreadcrumbLabels } from "@/lib/schema-i18n";

// --- 1. 推薦閱讀組件 ---
const RecentJournalCard = ({ post, t }) => (
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
      <span className="border-b border-gray-300 pb-0.5">
        {t("news.category", "News")}
      </span>
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
export default function NewsDetail({ post, recentPosts, relatedProducts = [] }) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const locale = router.locale || "zh-TW";
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
      <div className="min-h-screen flex items-center justify-center tracking-widest uppercase text-gray-500">
        Loading...
      </div>
    );
  if (!post) return null;

  const siteUrl =
    process.env.NEXT_PUBLIC_STORE_URL || "https://www.kesh-de1.com";
  const postUrl = getArticleUrl(siteUrl, locale, post.slug);
  const metaTitle = post.seo_title || `${post.title} | KÉSH de¹ Journal`;
  const metaDesc =
    post.seo_description || stripHtml(post.excerpt) || post.title;
  const ogLocale = getOgLocale(locale);
  const locales = ["zh-TW", "en", "ko"];

  const getLocalizedUrl = (loc) => getArticleUrl(siteUrl, loc, post.slug);

  const brand = getSchemaBrand(t);
  const breadcrumbs = getSchemaBreadcrumbLabels(t, locale);

  const jsonLd = buildArticleJsonLd({
    post,
    locale,
    siteUrl,
    relatedProducts,
    labels: {
      home: breadcrumbs.home,
      news: breadcrumbs.news,
      siteName: brand.siteName,
      siteDescription: brand.siteDescription,
    },
  });

  return (
    <>
      <Head>
        <title key="title">{metaTitle}</title>
        <meta name="description" content={metaDesc} key="desc" />
        {post.seo_keywords && (
          <meta name="keywords" content={post.seo_keywords} key="keywords" />
        )}
        <meta name="author" content={brand.siteName} key="author" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1"
          key="robots"
        />
        <link rel="canonical" href={postUrl} key="canonical" />

        {locales.map((loc) => (
          <link
            key={`hreflang-${loc}`}
            rel="alternate"
            hrefLang={loc}
            href={getLocalizedUrl(loc)}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={getLocalizedUrl("zh-TW")}
          key="hreflang-default"
        />

        <meta property="og:locale" content={ogLocale} key="oglocale" />
        {locales
          .filter((loc) => loc !== locale)
          .map((loc) => (
            <meta
              key={`og-alt-${loc}`}
              property="og:locale:alternate"
              content={getOgLocale(loc)}
            />
          ))}
        <meta property="og:type" content="article" key="ogtype" />
        <meta property="og:site_name" content={brand.siteName} key="ogsite" />
        <meta property="og:title" content={metaTitle} key="ogtitle" />
        <meta property="og:description" content={metaDesc} key="ogdesc" />
        <meta property="og:image" content={post.image} key="ogimage" />
        <meta property="og:image:secure_url" content={post.image} key="ogimagesecure" />
        <meta property="og:url" content={postUrl} key="ogurl" />

        <meta property="article:published_time" content={post.raw_created_at} key="pubtime" />
        <meta property="article:modified_time" content={post.raw_updated_at} key="modtime" />
        <meta property="article:author" content="KÉSH de¹" key="articleauthor" />
        <meta
          property="article:section"
          content={t("news.category", "News")}
          key="articlesection"
        />
        {post.seo_keywords?.split(/[,，、]/).map((kw, i) => (
          <meta
            key={`tag-${i}`}
            property="article:tag"
            content={kw.trim()}
          />
        ))}

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content={metaTitle} key="twtitle" />
        <meta name="twitter:description" content={metaDesc} key="twdesc" />
        <meta name="twitter:image" content={post.image} key="twimage" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          key="jsonld-graph"
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

        <div className="max-w-[1000px] mx-auto px-6 mb-20 border-b border-gray-200 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="flex-1 max-w-[720px]">
              <span className="inline-block border-b border-black text-[11px] font-bold uppercase tracking-[0.22em] mb-5">
                {t("news.category", "News")}
              </span>
              <h1 className="text-[1.75rem] md:text-[2.15rem] font-bold leading-[1.55] mb-4 tracking-[0.06em] text-black">
                {post.title}
              </h1>
              <p className="text-[12px] text-gray-400 uppercase tracking-[0.2em] font-light">
                KÉSH de¹ OFFICIAL JOURNAL
              </p>
              <p className="text-[12px] font-mono mt-5 text-gray-500 tracking-[0.04em]">
                {post.date}
              </p>
            </div>
            <div className="w-full md:w-[280px] text-[12px] text-gray-500 space-y-5 pt-2 tracking-[0.04em] leading-[1.85]">
              <div className="flex justify-end gap-4 mb-6">
                <span className="uppercase tracking-[0.18em] text-[10px]">
                  {t("news.share", "Share :")}
                </span>
                <a href="#" className="hover:text-black">
                  FB
                </a>
                <a href="#" className="hover:text-black">
                  TW
                </a>
              </div>
              <div className="space-y-1.5 border-l border-gray-200 pl-4">
                <p className="font-bold text-gray-900 tracking-[0.08em]">
                  {t("news.editor", "Editor")}
                </p>
                <p>KÉSH de¹</p>
              </div>
              <div className="space-y-1.5 border-l border-gray-200 pl-4">
                <p className="font-bold text-gray-900 tracking-[0.08em]">
                  {t("news.category_label", "Category")}
                </p>
                <p>{t("news.category_value", "Fashion / Events")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-6 mb-28 flex flex-col lg:flex-row gap-16 lg:gap-20 items-start">
          <aside className="hidden lg:block w-52 sticky top-32 shrink-0">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-7 border-b border-gray-200 pb-3 text-black">
              {t("news.toc", "Table of Contents")}
            </h3>
            {headings.length > 0 ? (
              <ul className="space-y-5 border-l border-gray-200 pl-4">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => scrollToHeading(e, heading.id)}
                      className="text-[13px] text-gray-500 hover:text-[#ef4628] transition-colors line-clamp-3 leading-[1.9] tracking-[0.04em] font-normal block"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 leading-[1.8] tracking-[0.04em]">
                {t("news.no_outline", "No outlines available.")}
              </p>
            )}
          </aside>

          <div className="flex-1 w-full max-w-[700px]">
            <article
              ref={contentRef}
              className="prose prose-stone max-w-none
  prose-headings:text-black prose-headings:font-semibold
  prose-p:text-[15.5px] md:prose-p:text-[16px] prose-p:leading-[2] prose-p:tracking-[0.06em] prose-p:text-stone-800 prose-p:my-[1.35em]
  prose-li:text-[15.5px] md:prose-li:text-[16px] prose-li:leading-[1.95] prose-li:tracking-[0.05em] prose-li:text-stone-800
  prose-ul:my-[1.5em] prose-ul:space-y-3 prose-ol:my-[1.5em] prose-ol:space-y-3
  prose-h1:mt-[2.75em] prose-h1:mb-[0.85em] prose-h1:text-[1.65rem] prose-h1:leading-[1.55] prose-h1:tracking-[0.08em] prose-h1:font-bold
  prose-h2:mt-[2.75em] prose-h2:mb-[1em] prose-h2:text-[1.45rem] md:prose-h2:text-[1.55rem] prose-h2:leading-[1.6] prose-h2:tracking-[0.08em] prose-h2:font-bold prose-h2:pb-4 prose-h2:border-b prose-h2:border-gray-100
  prose-h3:mt-[2.1em] prose-h3:mb-[0.75em] prose-h3:text-[1.2rem] prose-h3:leading-[1.65] prose-h3:tracking-[0.07em] prose-h3:font-bold
  prose-h4:mt-[1.75em] prose-h4:mb-[0.65em] prose-h4:text-[1.05rem] prose-h4:leading-[1.7] prose-h4:tracking-[0.06em] prose-h4:font-bold
  prose-strong:font-semibold prose-strong:text-black prose-strong:tracking-[0.04em]
  [&>p>b]:font-semibold [&>p>b]:text-black
  prose-blockquote:border-l prose-blockquote:border-stone-300 prose-blockquote:pl-5 prose-blockquote:my-[1.75em] prose-blockquote:text-stone-600 prose-blockquote:leading-[1.95] prose-blockquote:tracking-[0.05em]
  prose-img:w-full prose-img:h-auto prose-img:mt-8 prose-img:mb-3 prose-img:rounded-sm
  prose-a:text-[#ef4628] prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
  [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-sm [&_iframe]:my-8
  [text-rendering:optimizeLegibility]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="flex justify-end mt-20">
              <div
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#ef4628] transition-colors"
              >
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
                {t(
                  "news.about_desc",
                  "我們致力於打造最優質的二手精品交易平台，提供透明的報價與專業的鑑定服務。每一件商品都經過嚴格把關，讓您買得安心，賣得放心。",
                )}
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
              {t("news.back_btn", "Back to Journal")}
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-normal uppercase tracking-wide">
              {t("news.recent", "Recent Journal")}
            </h2>
            <span className="bg-[#1c1c1c] text-white text-[10px] rounded-full px-3 py-1 font-bold">
              {t("news.category", "News")}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {recentPosts.map((item) => (
              <RecentJournalCard key={item.id} post={item} t={t} />
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
  const locales = ["zh-TW", "en", "ko"];

  try {
    const res = await fetch(`${BACKEND_URL}/store/custom/posts`, {
      headers: { "x-publishable-api-key": PUB_KEY },
    });
    const data = await res.json();

    const activeSlugs = (data.posts || [])
      .filter((p) => p.is_active && p.slug)
      .map((post) => post.slug);

    // 明確產出三語系路徑，避免某一語系漏建後被永久 404 快取
    const paths = locales.flatMap((locale) =>
      activeSlugs.map((slug) => ({ params: { slug }, locale })),
    );

    return { paths, fallback: "blocking" };
  } catch (err) {
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params, locale }) {
  const slug = params.slug;
  const currentLang = locale || "zh-TW";

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  const headers = { "x-publishable-api-key": PUB_KEY };

  try {
    const res = await fetch(
      `${BACKEND_URL}/store/custom/posts?t=${Date.now()}`,
      { headers },
    );
    if (!res.ok) {
      // 暫時性後端錯誤：短 TTL 404，避免永久卡死
      return { notFound: true, revalidate: 60 };
    }
    const data = await res.json();
    const allPosts = (data.posts || []).filter((p) => p.is_active);

    const currentPostRaw = allPosts.find((p) => p.slug === slug);
    if (!currentPostRaw) {
      // 文章尚不存在／未發布：60 秒後可再試（ISR），避免「建好後仍永久 404」
      return { notFound: true, revalidate: 60 };
    }

    const isEn = currentLang === "en";
    const isKo = currentLang === "ko";

    const getLocalizedField = (post, baseField) => {
      const valEn = post[`${baseField}_en`];
      const valKo = post[`${baseField}_ko`];
      const valZh = post[baseField];

      if (isEn && valEn !== null && valEn !== undefined && valEn.trim() !== "")
        return valEn;
      if (isKo && valKo !== null && valKo !== undefined && valKo.trim() !== "")
        return valKo;
      return valZh || "";
    };

    const localizedContent = getLocalizedField(currentPostRaw, "content");

    let relatedProductsRaw = [];
    try {
      relatedProductsRaw = await fetchProductsForArticle(
        localizedContent,
        BACKEND_URL,
        headers,
      );
    } catch (relatedErr) {
      console.error("Related products fetch failed:", relatedErr);
    }

    // Next.js getStaticProps：不可傳 undefined（僅允許 null 或省略）
    const relatedProducts = relatedProductsRaw.map((p) => ({
      ...p,
      brand: p.brand ?? null,
      price: p.price ?? null,
      description: p.description ?? null,
      thumbnail: p.thumbnail ?? null,
      image: p.image ?? null,
    }));

    const formattedPost = {
      id: currentPostRaw.id,
      slug: currentPostRaw.slug,
      title: getLocalizedField(currentPostRaw, "title"),
      content: localizedContent,
      excerpt: getLocalizedField(currentPostRaw, "excerpt"),
      seo_title: getLocalizedField(currentPostRaw, "seo_title"),
      seo_description: getLocalizedField(currentPostRaw, "seo_description"),
      seo_keywords: getLocalizedField(currentPostRaw, "seo_keywords"),
      structured_data: getLocalizedField(currentPostRaw, "structured_data"),

      date: new Date(currentPostRaw.created_at)
        .toLocaleDateString("en-CA")
        .replace(/-/g, "."),
      raw_created_at: new Date(currentPostRaw.created_at).toISOString(),
      raw_updated_at: new Date(
        currentPostRaw.updated_at || currentPostRaw.created_at,
      ).toISOString(),
      image: currentPostRaw.thumbnail || "/images/placeholder.jpg",
    };

    const recentPostsRaw = allPosts
      .filter((p) => p.id !== currentPostRaw.id)
      .slice(0, 3);
    const formattedRecent = recentPostsRaw.map((rp) => ({
      id: rp.id,
      slug: rp.slug,
      title: getLocalizedField(rp, "title"),
      excerpt: getLocalizedField(rp, "excerpt"),
      date: new Date(rp.created_at)
        .toLocaleDateString("en-CA")
        .replace(/-/g, "."),
      image: rp.thumbnail || "/images/placeholder.jpg",
    }));

    return {
      props: {
        post: formattedPost,
        recentPosts: formattedRecent,
        relatedProducts,
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Post detail error:", error);
    // 暫時錯誤也不要永久 404
    return { notFound: true, revalidate: 60 };
  }
}
