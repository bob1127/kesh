// pages/_app.js
import "../src/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { appWithTranslation } from "next-i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Script from "next/script"; // 🔥 1. 引入 next/script
import { cormorantGaramond, isChineseLocale } from "@/lib/fonts";

import { AuthProvider } from "../components/AuthProvider";
import { UserProvider } from "../components/context/UserContext";
import { CartProvider } from "../components/context/CartContext";

import Layout from "./Layout";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isZh = isChineseLocale(router.locale);

  return (
    <>
      {/* 🔥 2. 透過 next/script 載入 Tawk.to */}
      {/* 使用 lazyOnload 策略，確保不會阻擋網頁主要畫面的渲染 */}
      {/* <Script id="tawk-to" strategy="lazyOnload">
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/69f9b614eb897e1c397a7aec/1jnrmug7p';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
        `}
      </Script> */}

      {/* 原有的 Provider 與佈局 */}
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <div
          className={`${cormorantGaramond.variable} antialiased ${
            isZh ? "lang-zh" : "lang-en"
          }`}
        >
        <AuthProvider>
          <UserProvider>
            <CartProvider>
              <NextUIProvider>
                <Layout>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={router.asPath}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      <Component {...pageProps} />
                    </motion.div>
                  </AnimatePresence>
                </Layout>
              </NextUIProvider>
            </CartProvider>
          </UserProvider>
        </AuthProvider>
        </div>
      </GoogleOAuthProvider>
    </>
  );
}

export default appWithTranslation(MyApp);
