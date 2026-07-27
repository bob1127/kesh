"use client";
import React, { useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircle, Landmark } from "lucide-react";
import { useCart } from "../components/context/CartContext";
import OrderProgress from "../components/OrderProgress";

export default function ThankYou() {
  const router = useRouter();
  const { orderId, stage, method } = router.query;
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart?.();
  }, [clearCart]);

  const isAtm =
    String(method || "").toUpperCase() === "ATM" ||
    String(stage || "") === "unpaid";

  const progressStage = isAtm
    ? "unpaid"
    : String(stage || "") === "shipped"
      ? "shipped"
      : "processing";

  return (
    <>
      <main className="min-h-screen bg-white flex flex-col items-center justify-center pt-20 pb-20 px-6 text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isAtm ? "bg-amber-50" : "bg-green-100"
          }`}
        >
          {isAtm ? (
            <Landmark className="w-10 h-10 text-amber-700" strokeWidth={2} />
          ) : (
            <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={2} />
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-black mb-4 tracking-wide">
          {isAtm ? "訂單已成立" : "謝謝您的購買！"}
        </h1>

        <p className="text-gray-500 mb-2">
          {isAtm
            ? "請依虛擬帳號完成轉帳，款項確認後我們將開始處理出貨。"
            : "您的訂單已經成功建立，進入處理中。"}
        </p>

        {orderId && (
          <p className="text-gray-800 font-medium text-lg mb-6">
            訂單編號：<span className="text-[#ef4628]">#{orderId}</span>
          </p>
        )}

        <div className="w-full max-w-md mb-10 border border-gray-100 bg-[#fafafa] px-4 py-2">
          <OrderProgress stage={progressStage} locale={router.locale || "zh-TW"} />
        </div>

        <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-10">
          {isAtm
            ? "我們已寄出待付款通知信（含銀行代碼與虛擬帳號）。若尚未收到，請檢查垃圾郵件匣。"
            : "我們已寄出付款成功／處理中通知信到您的電子信箱。出貨後也會再寄一封物流通知。"}
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
            href="/member"
            className="w-full border border-black text-black py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded-sm"
          >
            查看訂單
          </Link>
        </div>
      </main>
    </>
  );
}
