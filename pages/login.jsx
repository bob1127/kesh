import React, { useState, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// 🔵 Google 圖示組件
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

// 🟢 LINE 圖示組件
const LineIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#06C755">
    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.298.079.76.038 1.057l-.239 1.442c-.063.385-.296 1.442 1.265.783 1.562-.659 8.438-4.966 10.87-8.006 1.139-1.42 1.745-2.834 1.745-4.436z" />
    <path
      fill="#FFF"
      d="M5.385 13.06h-1.57A.428.428 0 013.4 12.63V7.936a.428.428 0 01.415-.428h1.57c.236 0 .428.192.428.428v4.268h2.083c.236 0 .428.192.428.428v.428a.428.428 0 01-.428.428zM10.426 13.06h-1.57a.428.428 0 01-.428-.428V7.936a.428.428 0 01.428-.428h1.57c.236 0 .428.192.428.428v4.696a.428.428 0 01-.428.428zM16.666 13.06h-1.57a.428.428 0 01-.428-.428V9.736l-2.028 2.927a.428.428 0 01-.352.185h-1.129a.428.428 0 01-.428-.428V7.936a.428.428 0 01.428-.428h1.57c.236 0 .428.192.428.428v2.896l2.028-2.927a.428.428 0 01.352-.185h1.129c.236 0 .428.192.428.428v4.696a.428.428 0 01-.428.428zM20.6 8.364h-2.083v1.285h2.083c.236 0 .428.192.428.428v.428a.428.428 0 01-.428.428H18.51v1.285H20.6c.236 0 .428.192.428.428v.428a.428.428 0 01-.428.428h-2.511a.428.428 0 01-.428-.428V7.936a.428.428 0 01.428-.428H20.6c.236 0 .428.192.428.428v.428a.428.428 0 01-.428.428z"
    />
  </svg>
);

// 🔵 Facebook 圖示組件
const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

  // 登入表單
  const [formData, setFormData] = useState({ email: "", password: "" });

  // 忘記密碼專用狀態
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpHash, setOtpHash] = useState("");
  const [otpExpires, setOtpExpires] = useState("");

  const isProcessing = useRef(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value.length > 255) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // 1. 社群登入邏輯
  // ==========================================
  const handleLineLogin = () => {
    if (isProcessing.current) return;
    const LINE_CLIENT_ID = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    if (!LINE_CLIENT_ID)
      return setErrorMsg("系統設定異常：找不到 LINE Channel ID");

    const REDIRECT_URI = encodeURIComponent(
      `${window.location.origin}/auth/line/callback`,
    );
    const STATE = Math.random().toString(36).substring(7);
    localStorage.setItem("line_oauth_state", STATE);
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=profile%20openid%20email`;
  };

  const handleGoogleLogin = () => {
    if (isProcessing.current) return;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID)
      return setErrorMsg("系統設定異常：找不到 Google Client ID");

    const REDIRECT_URI = encodeURIComponent(
      `${window.location.origin}/auth/callback`,
    );
    const STATE = Math.random().toString(36).substring(7);
    localStorage.setItem("google_oauth_state", STATE);
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=email%20profile`;
  };

  const handleFacebookLogin = () => {
    if (isProcessing.current) return;
    const FB_CLIENT_ID = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID;
    if (!FB_CLIENT_ID) return setErrorMsg("系統設定異常：找不到 FB Client ID");

    const REDIRECT_URI = encodeURIComponent(
      `${window.location.origin}/auth/facebook/callback`,
    );
    const STATE = Math.random().toString(36).substring(7);
    localStorage.setItem("facebook_oauth_state", STATE);
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=email,public_profile`;
  };

  // ==========================================
  // 2. 手動 Email 登入
  // ==========================================
  const handleMedusaLogin = async (e) => {
    e.preventDefault();
    if (isProcessing.current) return;

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
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

    try {
      const res = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(t("login.error_invalid") || "您輸入的帳號或密碼不正確");

      if (data.token) {
        // 🔥 手動登入成功，徹底清除所有社群登入標記
        localStorage.removeItem("is_google_login");
        localStorage.removeItem("is_facebook_login");
        localStorage.removeItem("is_line_login");
        localStorage.removeItem("google_avatar");
        localStorage.removeItem("google_name");
        localStorage.removeItem("facebook_avatar");
        localStorage.removeItem("facebook_name");
        localStorage.removeItem("google_oauth_state");
        localStorage.removeItem("facebook_oauth_state");
        localStorage.removeItem("line_oauth_state");

        localStorage.setItem("medusa_auth_token", data.token);
      }

      // ✅ 關鍵修改：將 router.push 改為硬重載跳轉
      window.location.href =
        router.locale === "zh-TW" || !router.locale ? "/" : `/${router.locale}`;
    } catch (error) {
      setErrorMsg(error.message || "系統連線異常，請稍後再試");
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  // ==========================================
  // 3. 忘記密碼 - 發送驗證碼
  // ==========================================
  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    if (isProcessing.current) return;
    if (!forgotEmail.trim()) return setErrorMsg("請填寫 Email");

    setErrorMsg("");
    setLoading(true);
    isProcessing.current = true;

    try {
      const res = await fetch("/api/auth/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發送失敗");

      setOtpHash(data.hash);
      setOtpExpires(data.expires);
      setForgotStep(2);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  // ==========================================
  // 4. 忘記密碼 - 驗證與重設
  // ==========================================
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (isProcessing.current) return;
    if (forgotOtp.length !== 6) return setErrorMsg("請輸入 6 位數驗證碼");
    if (newPassword.length < 6) return setErrorMsg("新密碼需至少 6 個字元");

    setErrorMsg("");
    setLoading(true);
    isProcessing.current = true;

    try {
      const res = await fetch("/api/auth/verify-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: forgotOtp,
          hash: otpHash,
          expires: otpExpires,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "重設密碼失敗");

      alert("密碼已成功重設！請使用新密碼登入。");
      setForgotStep(1);
      setForgotEmail("");
      setForgotOtp("");
      setNewPassword("");
      setView("login");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  return (
    <>
      <Head>
        <title>{t("login.title")} | KÉSH de¹</title>
      </Head>

      <main className="min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-24 px-6 overflow-hidden">
        <div className="w-full max-w-[480px] relative">
          <AnimatePresence mode="wait">
            {/* 🔴 登入主畫面 */}
            {view === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold tracking-widest uppercase mb-3">
                    {t("login.title")}
                  </h1>
                  <p className="text-gray-500 text-sm">{t("login.subtitle")}</p>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                  {/* 社群登入按鈕 */}
                  <button
                    type="button"
                    onClick={handleLineLogin}
                    disabled={loading}
                    className="flex items-center justify-center py-3.5 border border-[#06C755] bg-[#06C755] hover:bg-[#05b34c] transition-all rounded-sm group relative disabled:opacity-50"
                  >
                    <div className="absolute left-6">
                      <LineIcon />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wide">
                      Continue with LINE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex items-center justify-center py-3.5 border border-gray-300 hover:border-black hover:bg-gray-50 transition-all rounded-sm group relative disabled:opacity-50"
                  >
                    <div className="absolute left-6">
                      <GoogleIcon />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-black uppercase tracking-wide">
                      Continue with Google
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    className="flex items-center justify-center py-3.5 border border-[#1877F2] bg-white hover:bg-blue-50 transition-all rounded-sm group relative disabled:opacity-50"
                  >
                    <div className="absolute left-6">
                      <FacebookIcon />
                    </div>
                    <span className="text-sm font-bold text-[#1877F2] uppercase tracking-wide">
                      Continue with Facebook
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
                        onClick={() => {
                          setView("forgot-password");
                          setErrorMsg("");
                        }}
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

            {/* 🔴 忘記密碼畫面 */}
            {view === "forgot-password" && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button
                  onClick={() => {
                    setView("login");
                    setForgotStep(1);
                    setErrorMsg("");
                  }}
                  className="flex items-center text-sm text-gray-500 hover:text-black transition-colors mb-6 group"
                >
                  <ArrowLeft
                    size={16}
                    className="mr-2 group-hover:-translate-x-1 transition-transform"
                  />{" "}
                  {t("login.back_to_login")}
                </button>

                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-widest uppercase mb-3">
                    {t("login.reset_title") || "重設密碼"}
                  </h1>
                </div>

                {/* 🔥 社群登入的強力防呆警告 */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs p-4 rounded-sm mb-6 leading-relaxed">
                  <p className="font-bold mb-1">💡 社群登入用戶請注意</p>
                  如果您最初是使用{" "}
                  <span className="font-bold">
                    LINE、Google 或 Facebook
                  </span>{" "}
                  註冊，請直接返回上一頁點擊對應的彩色按鈕即可登入。
                  <span className="font-bold underline text-[#ef4628]">
                    請勿在此重設密碼
                  </span>
                  ，以免破壞您的社群綁定狀態！
                </div>

                {errorMsg && (
                  <div className="p-3 mb-6 bg-red-50 border border-red-200 text-red-600 text-xs text-center rounded">
                    {errorMsg}
                  </div>
                )}

                {forgotStep === 1 ? (
                  <form onSubmit={handleSendResetOTP} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t("login.email_label")}
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm"
                        placeholder={t("login.email_placeholder")}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-[#ef4628] transition-colors flex justify-center"
                    >
                      {loading ? (
                        <Spinner colorClass="border-white" />
                      ) : (
                        "發送重設驗證碼"
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyAndReset} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 text-center">
                        輸入 6 位數驗證碼
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        required
                        value={forgotOtp}
                        onChange={(e) =>
                          setForgotOtp(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full border border-gray-300 px-4 py-4 text-center text-2xl tracking-[1em] font-bold outline-none focus:border-black transition-colors rounded-sm"
                        placeholder="------"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        設定新密碼
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm"
                        placeholder="請輸入至少 6 個字元"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-[#ef4628] transition-colors flex justify-center"
                    >
                      {loading ? (
                        <Spinner colorClass="border-white" />
                      ) : (
                        "確認重設密碼"
                      )}
                    </button>
                  </form>
                )}
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
