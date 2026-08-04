// pages/search.jsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { tFallback } from "@/lib/t-fallback";
import { getCorrectAmount } from "@/lib/price";

function TypeTag({ kind, label }) {
  const isArticle = kind === "article";
  return (
    <span
      className={`inline-block text-[10px] font-bold tracking-[0.12em] px-1.5 py-0.5 border ${
        isArticle
          ? "border-[#ef4628]/40 text-[#ef4628] bg-[#ef4628]/5"
          : "border-gray-300 text-gray-700 bg-white"
      }`}
    >
      {label}
    </span>
  );
}

export default function SearchResults({ products, articles, keyword }) {
  const { t } = useTranslation("common");
  const hasResults = products.length > 0 || articles.length > 0;
  const tagProduct = tFallback(t, "search_page.tag_product", "產品");
  const tagArticle = tFallback(t, "search_page.tag_article", "文章");

  return (
    <>
      <Head>
        <title>{keyword} - 搜尋結果 | KÉSH de¹</title>
      </Head>

      <main className="min-h-screen bg-white pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <div className="mb-12 border-b border-gray-200 pb-6">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-2">
              {t("search_page.title") || "Search Results"}
            </h1>
            <p className="text-gray-500 text-sm">
              {t("search_page.showing_results_for")}{" "}
              <span className="font-bold text-black">"{keyword}"</span>
            </p>
          </div>

          {hasResults ? (
            <div className="space-y-16">
              {products.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <TypeTag kind="product" label={tagProduct} />
                    <h2 className="text-sm font-bold tracking-widest text-black">
                      {tFallback(t, "search_page.products_heading", "產品")}
                    </h2>
                    <span className="text-xs text-gray-400">
                      ({products.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {products.map((product) => (
                      <Link
                        href={`/product/${product.slug}`}
                        key={product.id}
                        className="group block"
                      >
                        <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden mb-4">
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            unoptimized={true}
                          />
                          <div className="absolute top-3 left-3">
                            <TypeTag kind="product" label={tagProduct} />
                          </div>
                        </div>
                        <div className="flex flex-col items-start space-y-1">
                          <span className="text-[11px] md:text-[12px] text-gray-500 uppercase tracking-[0.15em] font-medium">
                            {product.price}
                          </span>
                          <h3 className="text-[14px] md:text-[15px] text-black font-normal tracking-wide leading-relaxed group-hover:text-gray-600 transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {articles.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <TypeTag kind="article" label={tagArticle} />
                    <h2 className="text-sm font-bold tracking-widest text-black">
                      {tFallback(t, "search_page.articles_heading", "文章")}
                    </h2>
                    <span className="text-xs text-gray-400">
                      ({articles.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                      <Link
                        href={`/news/${article.slug}`}
                        key={article.id}
                        className="group flex gap-4 p-4 border border-gray-200 hover:border-gray-400 transition-colors"
                      >
                        <div className="relative w-20 h-20 bg-gray-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {article.image ? (
                            <Image
                              src={article.image}
                              alt={article.title}
                              fill
                              className="object-cover"
                              unoptimized={true}
                            />
                          ) : (
                            <FileText size={22} className="text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <TypeTag kind="article" label={tagArticle} />
                          <h3 className="mt-2 text-[15px] text-black font-medium leading-snug line-clamp-2 group-hover:text-[#ef4628] transition-colors">
                            {article.title}
                          </h3>
                          {article.excerpt ? (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {article.excerpt}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-32">
              <h2 className="text-xl text-gray-500 mb-4">
                {t("search_page.no_results") || "找不到符合的結果："} "
                {keyword}"
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                {t("search_page.try_again") ||
                  "請嘗試使用其他關鍵字或英文品牌名稱進行搜尋。"}
              </p>
              <Link
                href="/category"
                className="inline-block border border-black text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
              >
                {t("mega.view_all") || "查看全部"}
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ query, locale }) {
  const rawKeyword = query.q || "";
  const keyword = decodeURIComponent(rawKeyword);
  const currentLang = locale || "zh-TW";
  const metaLang = currentLang === "zh-TW" ? "zh" : currentLang;

  if (!keyword.trim()) {
    return {
      props: {
        products: [],
        articles: [],
        keyword: "",
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  }

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "https://kesh-backend-production.up.railway.app";
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers["x-publishable-api-key"] = API_KEY;

  try {
    const qLower = keyword.trim().toLowerCase();

    const [productsRes, postsRes] = await Promise.all([
      fetch(
        `${BACKEND_URL}/store/products?q=${encodeURIComponent(keyword)}&limit=20&fields=id,title,handle,thumbnail,metadata,*variants,*variants.prices`,
        { headers },
      ),
      fetch(`${BACKEND_URL}/store/custom/posts`, { headers }),
    ]);

    const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
    const postsData = postsRes.ok ? await postsRes.json() : { posts: [] };

    const getProductTitle = (p) => {
      const meta = p.metadata || {};
      if (metaLang === "en" && meta.title_en?.trim()) return meta.title_en;
      if (metaLang === "ko" && meta.title_ko?.trim()) return meta.title_ko;
      return p.title || "";
    };

    const formattedProducts = (productsData.products || []).map((p) => {
      const priceObj = p.variants?.[0]?.prices?.[0];
      const amount = priceObj
        ? getCorrectAmount(priceObj.amount, priceObj.currency_code)
        : 0;

      return {
        id: p.id,
        slug: p.handle,
        title: getProductTitle(p),
        price: amount ? `NT$ ${Math.round(amount).toLocaleString()}` : "",
        image: p.thumbnail || "/images/placeholder.jpg",
      };
    });

    const getLocalized = (post, field) => {
      if (metaLang === "en" && post[`${field}_en`]?.trim())
        return post[`${field}_en`];
      if (metaLang === "ko" && post[`${field}_ko`]?.trim())
        return post[`${field}_ko`];
      return post[field] || "";
    };

    const formattedArticles = (postsData.posts || [])
      .filter((post) => post.is_active !== false)
      .filter((post) => {
        const haystack = [
          post.title,
          post.title_en,
          post.title_ko,
          post.excerpt,
          post.excerpt_en,
          post.excerpt_ko,
          post.slug,
          post.seo_keywords,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(qLower);
      })
      .map((post) => ({
        id: post.id,
        slug: post.slug,
        title: getLocalized(post, "title"),
        excerpt: getLocalized(post, "excerpt"),
        image: post.thumbnail || null,
      }));

    return {
      props: {
        products: formattedProducts,
        articles: formattedArticles,
        keyword,
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  } catch (error) {
    console.error("[Search SSR] Error:", error);
    return {
      props: {
        products: [],
        articles: [],
        keyword,
        ...(await serverSideTranslations(currentLang, ["common"])),
      },
    };
  }
}
