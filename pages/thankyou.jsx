"use client";
import React, { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircle, Landmark } from "lucide-react";
import { useCart } from "../components/context/CartContext";
import OrderProgress from "../components/OrderProgress";

const ATM_SESSION_KEY = "kesh_atm_checkout";

export default function ThankYou() {
  const router = useRouter();
  const { orderId, stage, method } = router.query;
  const { clearCart } = useCart();
  const [atmInfo, setAtmInfo] = useState(null);

  useEffect(() => {
    clearCart?.();
  }, [clearCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(ATM_SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setAtmInfo(parsed);
      // 讀完可清掉，避免下次誤顯示；保留到離開頁面亦可
    } catch {
      /* ignore */
    }
  }, []);

  const isAtm =
    Boolean(atmInfo?.vAccount) ||
    String(method || "").toUpperCase() === "ATM" ||
    String(stage || "") === "unpaid";

  const progressStage = isAtm
    ? "unpaid"
    : String(stage || "") === "shipped"
      ? "shipped"
      : "processing";

  const displayOrderId = orderId || atmInfo?.orderId;

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
            ? "請依下列虛擬帳號完成轉帳，款項確認後我們將開始處理出貨。"
            : "您的訂單已經成功建立，進入處理中。"}
        </p>

        {displayOrderId && (
          <p className="text-gray-800 font-medium text-lg mb-6">
            訂單編號：
            <span className="text-[#ef4628]">#{displayOrderId}</span>
          </p>
        )}

        {isAtm && atmInfo?.vAccount && (
          <div className="w-full max-w-md mb-8 bg-[#fafafa] border border-gray-100 p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                銀行代碼
              </p>
              <p className="text-sm font-bold tracking-widest text-black">
                {atmInfo.bankCode || "—"}
              </p>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                轉帳帳號
              </p>
              <p className="text-lg font-bold tracking-widest text-[#ef4628]">
                {atmInfo.vAccount}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                繳費期限
              </p>
              <p className="text-xs font-medium tracking-widest text-gray-600">
                {atmInfo.expireDate || "—"}
              </p>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed pt-2">
              轉帳金額須與訂單總額完全相符。匯款資訊亦已寄至您的信箱。
            </p>
          </div>
        )}

        <div className="w-full max-w-md mb-10 border border-gray-100 bg-[#fafafa] px-4 py-2">
          <OrderProgress
            stage={progressStage}
            locale={router.locale || "zh-TW"}
          />
        </div>

        <p className="text-sm text-gray-400 max-w-md leading-relaxed mb-10">
          {isAtm
            ? "匯款資訊已顯示於上方，並會寄至您的下單信箱（請一併檢查垃圾郵件匣）。之後可用「訂單編號 + Email」至訂單查詢再次查看，無需登入會員。"
            : "確認信已寄至您的下單信箱。之後可用「訂單編號 + Email」至訂單查詢查看進度，無需登入會員。"}
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
            href={
              displayOrderId
                ? `/order-lookup?orderId=${encodeURIComponent(String(displayOrderId))}`
                : "/order-lookup"
            }
            className="w-full border border-black text-black py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded-sm"
          >
            訂單查詢
          </Link>
        </div>
      </main>
    </>
  );
}
