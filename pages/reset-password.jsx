"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

const Spinner = ({ colorClass = "border-gray-400" }) => (
  <span
    className={`w-5 h-5 border-2 ${colorClass} border-t-transparent rounded-full animate-spin`}
  ></span>
);

export default function ResetPassword() {
  const router = useRouter();
  // 如果你需要抓取 URL 上的 token (例如 /reset-password?token=abc)
  // const searchParams = useSearchParams();
  // const token = searchParams.get("token");

  const [view, setView] = useState("form"); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. 前端基礎驗證
    if (formData.password.length < 8) {
      setErrorMsg("密碼長度至少需要 8 個字元。");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("兩次輸入的密碼不一致，請重新確認。");
      return;
    }

    setLoading(true);

    try {
      // 2. 串接後端 API (將 token 與新密碼送給後端)
      // 例如: await fetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password: formData.password }) })

      // 模擬 API 延遲
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. 成功後切換至成功畫面
      setView("success");
    } catch (error) {
      setErrorMsg("重設密碼失敗，連結可能已失效。請重新申請。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-24 px-6 overflow-hidden">
      <div className="w-full max-w-[480px] relative">
        <AnimatePresence mode="wait">
          {/* ================= 重設密碼表單 ================= */}
          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-widest uppercase mb-3">
                  Set New Password
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  請為您的 KÉSH de¹ 帳號設定新的密碼。
                  <br />
                  密碼長度建議至少 8 個字元。
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs text-center rounded">
                    {errorMsg}
                  </div>
                )}

                {/* 新密碼 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    新密碼 (New Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm pr-12"
                      placeholder="請輸入新密碼"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 確認新密碼 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    確認新密碼 (Confirm Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors rounded-sm pr-12"
                      placeholder="請再次輸入新密碼"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1 transition-colors"
                    >
                      {showConfirmPassword ? (
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
                  className="w-full bg-[#ef4628] text-white font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-black transition-colors flex justify-center items-center mt-4"
                >
                  {loading ? <Spinner colorClass="border-white" /> : "確認重設"}
                </button>
              </form>
            </motion.div>
          )}

          {/* ================= 成功畫面 ================= */}
          {view === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h1 className="text-2xl font-bold tracking-widest uppercase mb-4">
                Password Updated
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                您的密碼已成功更新！
                <br />
                為了保護您的帳戶安全，請使用新密碼重新登入。
              </p>

              <Link
                href="/login"
                className="w-full inline-flex border border-black bg-black text-white font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-gray-800 transition-colors justify-center items-center"
              >
                前往登入
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
