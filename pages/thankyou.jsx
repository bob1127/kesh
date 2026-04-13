"use client";
import React, { useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircle } from "lucide-react";
import { useCart } from "../components/context/CartContext";

export default function ThankYou() {
  const router = useRouter();
  const { orderId } = router.query;
  // 取得 Context 裡的清空購物車方法 (建議在 CartContext 補上 clearCart)
  const { setCartItems } = useCart(); // 這裡暫時直接用 setCartItems

  useEffect(() => {
    // 進入感謝頁時，確保購物車清空
    if (typeof window !== "undefined") {
      localStorage.removeItem("shopping-cart");
      // 如果 context 有暴露 setCartItems，也可以直接清空 state
      // setCartItems([]);
    }
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-center pt-20 pb-20 px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={2} />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-black mb-4 tracking-wide">
          謝謝您的購買！
        </h1>

        <p className="text-gray-500 mb-2">您的訂單已經成功建立。</p>

        {orderId && (
          <p className="text-gray-800 font-medium text-lg mb-8">
            訂單編號：<span className="text-[#ef4628]">#{orderId}</span>
          </p>
        )}

        <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-10">
          我們已經發送了一封確認信到您的電子信箱。
          <br />
          如果對訂單有任何疑問，請聯繫客服。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Link
            href="/category"
            className="w-full bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-[#ef4628] transition-colors rounded-sm"
          >
            繼續購物
          </Link>
          <Link
            href="/member/profile"
            className="w-full border border-black text-black py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded-sm"
          >
            查看訂單
          </Link>
        </div>
      </main>
    </>
  );
}
