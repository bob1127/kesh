import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { ReactLenis } from "@studio-freight/react-lenis";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import {
  SITE_URL,
  getLocalizedUrl,
  getOgLocale,
} from "@/lib/sitelinks-seo";
import { getSchemaBrand, getServiceAreaServed } from "@/lib/schema-i18n";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function ServicesPage() {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  const brand = getSchemaBrand(t);
  const seo = t("services.seo", { returnObjects: true });
  const page = t("services.page", { returnObjects: true });
  const blocks = page.blocks || [];
  const tags = (page.tags || "").split(/[,，、]/).filter(Boolean);

  const canonicalUrl = getLocalizedUrl(SITE_URL, locale, "/services");
  const ogLocale = getOgLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.title,
    description: seo.desc,
    url: canonicalUrl,
    inLanguage:
      locale === "en" ? "en-US" : locale === "ko" ? "ko-KR" : "zh-TW",
    provider: {
      "@type": "Organization",
      name: brand.siteName,
      url: getLocalizedUrl(SITE_URL, locale || "zh-TW", "/"),
    },
    areaServed: getServiceAreaServed(locale || "zh-TW"),
    serviceType: tags.slice(0, 8),
  };

  return (
    <ReactLenis root>
      <Head>
        <title key="title">{seo.title}</title>
        <meta name="description" content={seo.desc} key="description" />
        <meta name="keywords" content={seo.keywords} key="keywords" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:locale" content={ogLocale} key="oglocale" />
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:title" content={seo.title} key="ogtitle" />
        <meta property="og:description" content={seo.desc} key="ogdesc" />
        <meta property="og:url" content={canonicalUrl} key="ogurl" />
        <meta
          property="og:image"
          content={`${SITE_URL}/default-og-image.jpg`}
          key="ogimage"
        />

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content={seo.title} key="twtitle" />
        <meta name="twitter:description" content={seo.desc} key="twdesc" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="bg-white min-h-screen pt-32 pb-24 text-gray-900">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <motion.header
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-14 md:mb-20 border-b border-gray-100 pb-12"
          >
            <p className="text-[#ef4628] text-xs font-bold tracking-[0.2em] uppercase mb-4">
              KÉSH de¹ Services
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-medium tracking-wide mb-4">
              {page.h1}
            </h1>
            {page.h2 ? (
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {page.h2}
              </p>
            ) : null}
            {page.positioning ? (
              <p className="text-sm text-gray-500 max-w-3xl mx-auto mt-6 leading-relaxed">
                {page.positioning}
              </p>
            ) : null}
          </motion.header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {blocks.map((block, idx) => (
              <motion.article
                key={block.id || idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeInUp}
                className="p-8 border border-gray-100 rounded-sm hover:border-gray-200 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-3 tracking-wide">
                  {block.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {block.desc}
                </p>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-16 md:mt-24 text-center bg-[#fafafa] px-8 py-12 rounded-sm"
          >
            <h2 className="text-xl font-serif mb-4">{page.cta_title}</h2>
            <p className="text-sm text-gray-600 mb-8 max-w-lg mx-auto">
              {page.cta_desc}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-[#ef4628] text-white text-xs font-bold tracking-widest uppercase rounded-full hover:opacity-90 transition-opacity"
              >
                {page.cta_contact}
              </Link>
              <Link
                href="/authenticity"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-800 text-xs font-bold tracking-widest uppercase rounded-full hover:bg-white transition-colors"
              >
                {page.cta_authenticity}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </ReactLenis>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "zh-TW", ["common"])),
    },
  };
}
