import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// 🔥 保持您原本運作正常的 Google OAuth Hook
import { useGoogleLogin } from "@react-oauth/google";

// Google 圖示組件
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Spinner = ({ colorClass = "border-gray-400" }) => (
  <span
    className={`w-5 h-5 border-2 ${colorClass} border-t-transparent rounded-full animate-spin`}
  ></span>
);

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const isProcessing = useRef(false); // 資安防護：防禦暴力連點

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 資安防護：限制長度並即時過濾
    if (value.length > 255) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔥 保持您原本運作正常的 Google 登入攔截邏輯
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (isProcessing.current) return;
      isProcessing.current = true;
      setLoading(true);
      setErrorMsg("");

      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );

        if (!userInfoRes.ok) throw new Error("Google 授權驗證失敗");
        const googleUser = await userInfoRes.json();

        localStorage.setItem("google_avatar", googleUser.picture);
        localStorage.setItem("google_name", googleUser.name);
        localStorage.setItem("is_google_login", "true");

        const BACKEND_URL =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const res = await fetch(`${BACKEND_URL}/auth/customer/google`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (data.location) {
          window.location.href = data.location;
        } else {
          throw new Error("無法取得安全認證跳轉網址");
        }
      } catch (error) {
        console.error("Google 攔截登入失敗:", error);
        setErrorMsg(
          t("login.error_google") || "Google 登入過程發生異常，請稍後再試。",
        );
      } finally {
        setLoading(false);
        isProcessing.current = false;
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      setErrorMsg(t("login.error_cancel") || "Google 登入遭取消或發生錯誤");
    },
  });

  const handleMedusaLogin = async (e) => {
    e.preventDefault();
    if (isProcessing.current) return;

    // 資安防護：基本前端驗證與資料清洗 (Sanitization)
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg(t("login.error_required") || "請完整填寫帳號密碼");
      return;
    }

    isProcessing.current = true;
    setLoading(true);
    setErrorMsg("");

    const BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

    try {
      const res = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = await res.json();

      // 資安防護：模糊化錯誤訊息，避免駭客探測帳號是否存在
      if (!res.ok) {
        throw new Error(t("login.error_invalid") || "您輸入的帳號或密碼不正確");
      }

      if (data.token) {
        localStorage.removeItem("is_google_login");
        localStorage.removeItem("google_avatar");
        localStorage.removeItem("google_name");
        localStorage.setItem("medusa_auth_token", data.token);
      }

      router.push("/", "/", { locale: router.locale });
    } catch (error) {
      // 捕獲所有異常並顯示安全訊息
      setErrorMsg(error.message || "系統連線異常，請稍後再試");
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    alert("此功能需在 Medusa 後台設定郵件服務器後方可啟用。");
  };

  return (
    <>
      <Head>
        <title>{t("login.title")} | KÉSH de¹</title>
      </Head>

      <main className="min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-24 px-6 overflow-hidden">
        <div className="w-full max-w-[480px] relative">
          <AnimatePresence mode="wait">
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold tracking-widest uppercase mb-3">
                    {t("login.title")}
                  </h1>
                  <p className="text-gray-500 text-sm">{t("login.subtitle")}</p>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    disabled={loading}
                    className="flex items-center justify-center py-3.5 border border-gray-300 hover:border-black hover:bg-gray-50 transition-all rounded-sm group relative disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute left-6">
                      <GoogleIcon />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-black uppercase tracking-wide">
                      {t("login.google") || "Continue with Google"}
                    </span>
                  </button>
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-white px-4 text-gray-400">
                      or email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleMedusaLogin} className="space-y-6">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center rounded">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {t("login.email_label")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm"
                      placeholder={t("login.email_placeholder")}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t("login.password_label")}
                      </label>
                      <button
                        type="button"
                        onClick={() => setView("forgot-password")}
                        className="text-[10px] text-gray-400 hover:text-black underline"
                      >
                        {t("login.forgot_password")}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm pr-12"
                        placeholder={t("login.password_placeholder")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ef4628] text-white font-bold uppercase tracking-widest py-4 mt-8 rounded-sm hover:bg-black transition-colors flex justify-center items-center"
                  >
                    {loading ? (
                      <Spinner colorClass="border-white" />
                    ) : (
                      t("login.sign_in")
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                  {t("login.no_account")}{" "}
                  <Link
                    href="/register"
                    className="text-black font-bold underline underline-offset-4 hover:text-[#ef4628] transition-colors"
                  >
                    {t("login.register")}
                  </Link>
                </div>
              </motion.div>
            )}

            {view === "forgot-password" && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button
                  onClick={() => setView("login")}
                  className="flex items-center text-sm text-gray-500 hover:text-black transition-colors mb-6 group"
                >
                  <ArrowLeft
                    size={16}
                    className="mr-2 group-hover:-translate-x-1 transition-transform"
                  />{" "}
                  {t("login.back_to_login")}
                </button>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-widest uppercase mb-3">
                    {t("login.reset_title")}
                  </h1>
                </div>
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {t("login.email_label")}
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm"
                      placeholder={t("login.email_placeholder")}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-[#ef4628] transition-colors"
                  >
                    {t("login.reset_btn")}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: { ...(await serverSideTranslations(locale || "zh-TW", ["common"])) },
  };
}
