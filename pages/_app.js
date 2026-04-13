// pages/_app.js
import "../src/globals.css"; 
import { NextUIProvider } from "@nextui-org/react";
import { appWithTranslation } from "next-i18next";
import { GoogleOAuthProvider } from '@react-oauth/google'; // 🔥 1. 引入 Google Provider

import { AuthProvider } from "../components/AuthProvider";
import { UserProvider } from "../components/context/UserContext"; 
import { CartProvider } from "../components/context/CartContext"; 

import Layout from "./Layout"; 
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    // 🔥 2. 用 GoogleOAuthProvider 包住最外層，並填入您的 Client ID
   // 確保這裡是讀取 NEXT_PUBLIC_ 開頭的變數
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
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
    </GoogleOAuthProvider>
  );
}

export default appWithTranslation(MyApp);