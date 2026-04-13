"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("正在與 Google 連線認證中...");

  useEffect(() => {
    // 確保網址載入完成，且有帶 code 參數回來
    if (!router.isReady) return;
    if (router.query.error) {
      setStatus("授權失敗或已取消，正在返回登入頁...");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    // 如果網址上沒有 code，就不執行
    if (!router.query.code) return;

    const completeGoogleLogin = async () => {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

      try {
        // 🔥 1. 把 Google 帶回來的 code 拿去換 Token
        const callbackRes = await fetch(
          `${BACKEND_URL}/auth/customer/google/callback${window.location.search}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": API_KEY,
            },
          },
        );

        const data = await callbackRes.json();

        if (!callbackRes.ok) {
          throw new Error(data.message || "驗證失敗");
        }

        // 🔥 2. 成功拿到 Token！立刻存起來
        const token = data.token;
        localStorage.setItem("medusa_auth_token", token);

        // 💡 關鍵新增：解析 JWT Token 或直接從 Google 拿資料
        // 因為 Medusa 的 Google OAuth 會把基本資料包在 Token 裡，我們可以直接解析它
        // 或是我們簡單點，直接給一個暫存的 Flag，讓 Context 知道這是 Google 登入
        localStorage.setItem("is_google_login", "true");

        setStatus("認證成功！正在為您同步 KÉSH de¹ 會員檔案...");

        // 🔥 3. 檢查 Medusa 裡面有沒有這位客人的檔案
        const meRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": API_KEY,
          },
        });

        if (!meRes.ok) {
          setStatus("正在為您建立專屬會員檔案...");
          await fetch(`${BACKEND_URL}/store/customers`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "x-publishable-api-key": API_KEY,
            },
            body: JSON.stringify({
              first_name: "Member", // 先給個預設值
            }),
          });
        }

        setStatus("登入完成！歡迎來到 KÉSH de¹。");
        setTimeout(
          () => router.push("/", "/", { locale: router.locale }),
          1000,
        );
      } catch (error) {
        console.error("Callback 處理錯誤:", error);
        setStatus("系統連線異常，請稍後再試。");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    completeGoogleLogin();
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-sm font-bold tracking-widest uppercase text-gray-500">
        {status}
      </p>
    </div>
  );
}
