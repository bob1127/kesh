import React, { useState, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

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

export default function Register() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [step, setStep] = useState(1); // 1: 填資料, 2: 填驗證碼
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isProcessing = useRef(false);

  // 表單資料
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // 驗證碼相關狀態
  const [otpCode, setOtpCode] = useState("");
  const [otpHash, setOtpHash] = useState("");
  const [otpExpires, setOtpExpires] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value.length > 255) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const frontendCallbackUrl = "http://localhost:3000/auth/callback";
    try {
      const res = await fetch(
        `${BACKEND_URL}/auth/customer/google?callback_url=${encodeURIComponent(frontendCallbackUrl)}`,
      );
      const data = await res.json();
      if (data.location) window.location.href = data.location;
    } finally {
      isProcessing.current = false;
    }
  };

  // 🚀 第一階段：發送驗證碼到信箱
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (isProcessing.current) return;

    const cleanUsername = formData.username.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();

    if (!cleanUsername || !cleanEmail || !cleanPassword)
      return setErrorMsg("請完整填寫所有欄位");
    if (cleanPassword.length < 6) return setErrorMsg("密碼長度需至少 6 個字元");

    setErrorMsg("");
    setLoading(true);
    isProcessing.current = true;

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "發送失敗");

      // 儲存加密包並切換到步驟 2
      setOtpHash(data.hash);
      setOtpExpires(data.expires);
      setStep(2);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  // 🚀 第二階段：核對驗證碼並呼叫 Medusa 註冊
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (isProcessing.current) return;
    if (otpCode.length !== 6) return setErrorMsg("請輸入完整的 6 位數驗證碼");

    setErrorMsg("");
    setLoading(true);
    isProcessing.current = true;

    try {
      // 1. 先去自建的 API 核對驗證碼
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          otp: otpCode,
          hash: otpHash,
          expires: otpExpires,
        }),
      });

      if (!verifyRes.ok) {
        const vData = await verifyRes.json();
        throw new Error(vData.error || "驗證碼錯誤");
      }

      // 2. 驗證成功！開始正式呼叫 Medusa 註冊
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

      const authRes = await fetch(
        `${BACKEND_URL}/auth/customer/emailpass/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": API_KEY,
          },
          body: JSON.stringify({
            email: formData.email.toLowerCase(),
            password: formData.password,
          }),
        },
      );

      const authData = await authRes.json();
      if (!authRes.ok) throw new Error("註冊失敗，該信箱可能已被註冊");

      const token = authData.token;

      // 建立顧客檔案
      await fetch(`${BACKEND_URL}/store/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          first_name: formData.username.trim(),
        }),
      });

      localStorage.setItem("medusa_auth_token", token);
      alert("驗證成功！歡迎加入 KÉSH de¹");
      router.push("/", "/", { locale: router.locale });
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
        <title>Register | KÉSH de¹</title>
      </Head>
      <main className="min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-24 px-6 overflow-hidden">
        <div className="w-full max-w-[480px] relative">
          <AnimatePresence mode="wait">
            {/* 步驟 1：填寫資料 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold tracking-widest uppercase mb-3">
                    Create Account
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Join KÉSH de¹ for exclusive access.
                  </p>
                </div>

                <div className="flex flex-col gap-3 mb-8">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center py-3.5 border border-gray-300 hover:border-black hover:bg-gray-50 transition-all rounded-sm group relative"
                  >
                    <div className="absolute left-6">
                      <GoogleIcon />
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-black uppercase tracking-wide">
                      Continue with Google
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

                <form onSubmit={handleSendOTP} className="space-y-6">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center rounded">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm"
                      placeholder="Email Address"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm pr-12"
                        placeholder="Min. 6 characters"
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
                      "Next: Verify Email"
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-black font-bold underline underline-offset-4 hover:text-[#ef4628] transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </motion.div>
            )}

            {/* 步驟 2：填寫驗證碼 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-gray-500 hover:text-black transition-colors mb-6 group"
                >
                  <ArrowLeft
                    size={16}
                    className="mr-2 group-hover:-translate-x-1 transition-transform"
                  />{" "}
                  Back
                </button>

                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold tracking-widest uppercase mb-3">
                    Verify Email
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We've sent a 6-digit verification code to
                    <br />
                    <span className="font-bold text-black">
                      {formData.email}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center rounded">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 text-center">
                      Enter Code
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full border border-gray-300 px-4 py-4 text-center text-2xl tracking-[1em] font-bold outline-none focus:border-black transition-colors rounded-sm"
                      placeholder="------"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-bold uppercase tracking-widest py-4 mt-8 rounded-sm hover:bg-[#ef4628] transition-colors flex justify-center items-center"
                  >
                    {loading ? (
                      <Spinner colorClass="border-white" />
                    ) : (
                      "Verify & Register"
                    )}
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
