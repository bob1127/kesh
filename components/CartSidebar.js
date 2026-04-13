"use client";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus } from "lucide-react"; // ✅ 引入加減圖示
import { useCart } from "./context/CartContext";

export default function CartSidebar() {
  // ✅ 加入 updateQuantity
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity } = useCart();

  // 計算總金額
  const totalPrice = cartItems.reduce((acc, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, ""), 10) || 0;
    return acc + priceNum * item.quantity;
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
                  <p className="text-sm">您的購物車是空的</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-black underline decoration-1 underline-offset-4 text-xs font-bold uppercase"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* 圖片區 */}
                    <div className="relative w-20 h-24 bg-gray-50 flex-shrink-0">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url('${
                            item.images ? encodeURI(item.images[0]) : ""
                          }')`,
                        }}
                      />
                    </div>

                    {/* 資訊區 */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold uppercase leading-tight mb-1 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500">{item.brand}</p>
                        <p className="text-sm font-medium mt-1">{item.price}</p>
                      </div>

                      {/* ✅ 數量控制與刪除按鈕區 */}
                      <div className="flex justify-between items-center mt-2">
                        {/* 數量控制器 */}
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

                        {/* 刪除按鈕 */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="移除商品"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    總計價格
                  </span>
                  <span className="text-lg font-bold">
                    NT$ {totalPrice.toLocaleString()}
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