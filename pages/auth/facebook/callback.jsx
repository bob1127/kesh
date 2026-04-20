import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function FacebookCallback() {
  const router = useRouter();
  const isProcessing = useRef(false);

  useEffect(() => {
    const { code, state, error, error_reason } = router.query;

    if (error || error_reason) {
      alert("Facebook 登入被取消或發生錯誤");
      router.push("/login");
      return;
    }

    if (code && state && !isProcessing.current) {
      isProcessing.current = true;
      const savedState = localStorage.getItem("facebook_oauth_state");

      if (state !== savedState) {
        alert("資安驗證失敗：來源不符");
        router.push("/login");
        return;
      }

      // 送去我們專屬的 FB API 進行註冊
      fetch("/api/auth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem("medusa_auth_token", data.token);
            localStorage.setItem("facebook_avatar", data.picture || "");
            localStorage.setItem("facebook_name", data.name || "");
            localStorage.setItem("is_facebook_login", "true");

            // 🔥 防呆：清除其他社群登入標記
            localStorage.removeItem("is_google_login");
            localStorage.removeItem("is_line_login");

            // ✅ 關鍵修改：強制硬重載跳轉，確保右上角狀態更新
            window.location.href =
              router.locale === "zh-TW" || !router.locale
                ? "/"
                : `/${router.locale}`;
          } else {
            throw new Error(data.error || "登入失敗");
          }
        })
        .catch((err) => {
          console.error(err);
          alert(err.message || "系統處理錯誤，請稍後再試");
          router.push("/login");
        });
    }
  }, [router.query, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 text-sm tracking-widest uppercase font-bold">
        Facebook 授權驗證中...
      </p>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: { ...(await serverSideTranslations(locale || "zh-TW", ["common"])) },
  };
}
