"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router"; 
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "./context/CartContext";

export default function CartSidebar() {
  const router = useRouter();
  
  // ✅ 定義當前語系與對應的幣值代碼
  const currentLang = router.locale || "zh-TW";
  const metaLang = currentLang === "zh-TW" ? "zh" : currentLang;
  const targetCurrency = currentLang === "en" ? "usd" : currentLang === "ko" ? "krw" : "twd";
  const symbol = currentLang === "en" ? "$ " : currentLang === "ko" ? "₩ " : "NT$ ";

  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity } = useCart();

  // 🔥 動態計算總金額：自動尋找當前幣值的價格
  const totalPrice = cartItems.reduce((acc, item) => {
    let currentRawPrice = item.rawPrice ? item.rawPrice : (parseInt((item.price || "").toString().replace(/[^\d]/g, ""), 10) || 0);
    
    // 如果購物車裡有各國價格表，就找出符合現在語系的價格
    if (item.prices && item.prices.length > 0) {
      const matchedPrice = item.prices.find((p) => p.currency_code?.toLowerCase() === targetCurrency);
      if (matchedPrice) {
        currentRawPrice = matchedPrice.amount > 1000000 ? matchedPrice.amount / 100 : matchedPrice.amount;
      }
    }
    return acc + currentRawPrice * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
          />

          {/* 側邊欄本體 */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[2001] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                Shopping Cart ({cartItems.length})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="hover:rotate-90 transition-transform duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <p className="text-sm">
                    {currentLang === "en" ? "Your cart is empty" : currentLang === "ko" ? "장바구니가 비어 있습니다" : "您的購物車是空的"}
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-black underline decoration-1 underline-offset-4 text-xs font-bold uppercase"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  // 動態語系標題
                  const displayTitle = item.metadata?.[`title_${metaLang}`] || item.title;
                  
                  // 🔥 動態語系單價計算
                  let currentRawPrice = item.rawPrice ? item.rawPrice : (parseInt((item.price || "").toString().replace(/[^\d]/g, ""), 10) || 0);
                  if (item.prices && item.prices.length > 0) {
                    const matchedPrice = item.prices.find((p) => p.currency_code?.toLowerCase() === targetCurrency);
                    if (matchedPrice) {
                      currentRawPrice = matchedPrice.amount > 1000000 ? matchedPrice.amount / 100 : matchedPrice.amount;
                    }
                  }
                  const displayPrice = `${symbol}${Math.round(currentRawPrice).toLocaleString()}`;

                  return (
                    <div key={item.id} className="flex gap-4">
                      {/* 圖片區 */}
                      <div className="relative w-20 h-24 bg-gray-50 flex-shrink-0">
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${
                              item.images && item.images.length > 0 ? encodeURI(item.images[0]) : ""
                            }')`,
                          }}
                        />
                      </div>

                      {/* 資訊區 */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold uppercase leading-tight mb-1 line-clamp-2">
                            {displayTitle}
                          </h3>
                          <p className="text-xs text-gray-500">{item.brand}</p>
                          <p className="text-sm font-medium mt-1">{displayPrice}</p>
                        </div>

                        {/* 數量控制與刪除按鈕區 */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-gray-300 h-7 w-20 rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 text-gray-600"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="flex-1 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    {currentLang === "en" ? "Subtotal" : currentLang === "ko" ? "총액" : "總計價格"}
                  </span>
                  <span className="text-lg font-bold">
                    {symbol}{totalPrice.toLocaleString()} 
                  </span>
                </div>
                <Link href="/cart">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#ef4628] transition-colors"
                  >
                    Check Out
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}