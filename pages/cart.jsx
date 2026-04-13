"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCart } from "../components/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { t } = useTranslation("common");
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  // 1. 所有的 State 和 Hook 必須放在最前面！
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 💰 智慧金額計算 (改成一般函數，不依賴 Hook，避免錯誤)
  const subtotal = cartItems.reduce((acc, item) => {
    const priceVal =
      item.rawPrice ||
      parseInt(String(item.price).replace(/[^\d]/g, ""), 10) ||
      0;
    return acc + priceVal * item.quantity;
  }, 0);

  const handleQuantity = (item, type) => {
    if (type === "plus") {
      updateQuantity(item.id, item.quantity + 1);
    } else {
      if (item.quantity > 1) {
        updateQuantity(item.id, item.quantity - 1);
      } else {
        removeFromCart(item.id);
      }
    }
  };

  // 2. 所有的 Hook 都宣告完了，這時候才可以做 if return！
  if (!mounted) return null;

  return (
    <>
      <main className="min-h-screen bg-white text-[#121212] pt-24 md:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Header */}
          <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight uppercase">
                {t("cart.title") || "SHOPPING BAG"}
              </h1>
              <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">
                {cartItems.length}{" "}
                {t("cart.items_count") || "ITEMS IN YOUR BAG"}
              </p>
            </div>
            <Link
              href="/category"
              className="text-[11px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-[#ef4628] hover:border-[#ef4628] transition-all"
            >
              {t("cart.continue_shopping") || "CONTINUE SHOPPING"}
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <p className="text-sm tracking-widest text-gray-400 mb-8 uppercase">
                {t("cart.empty_message") || "YOUR BAG IS CURRENTLY EMPTY."}
              </p>
              <Link
                href="/category"
                className="bg-black text-white px-12 py-4 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#ef4628] transition-colors"
              >
                {t("cart.start_shopping") || "EXPLORE COLLECTIONS"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Left: Items List */}
              <div className="lg:col-span-8">
                <div className="flex flex-col">
                  {cartItems.map((item) => {
                    const priceVal =
                      item.rawPrice ||
                      parseInt(String(item.price).replace(/[^\d]/g, ""), 10) ||
                      0;
                    return (
                      <div
                        key={item.id}
                        className="py-8 border-b border-gray-100 flex gap-6 md:gap-10"
                      >
                        {/* Image */}
                        <div className="relative w-28 h-36 md:w-36 md:h-48 bg-[#f9f9f9] flex-shrink-0">
                          <Image
                            src={
                              item.image ||
                              (item.images && item.images[0]) ||
                              ""
                            }
                            alt={item.title || "Product Image"}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                                {item.brand || "KESH"}
                              </p>
                              <h3 className="text-sm md:text-base font-medium uppercase tracking-wide mb-2">
                                {item.title}
                              </h3>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} strokeWidth={1.5} />
                            </button>
                          </div>

                          <p className="text-sm font-bold mb-6">
                            NT$ {priceVal.toLocaleString()}
                          </p>

                          {/* Qty Switcher */}
                          <div className="mt-auto flex items-center border border-gray-200 w-fit">
                            <button
                              onClick={() => handleQuantity(item, "minus")}
                              className="p-2 px-3 hover:bg-gray-50 disabled:opacity-30"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold px-4">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantity(item, "plus")}
                              className="p-2 px-3 hover:bg-gray-50"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal per item (Desktop) */}
                        <div className="hidden md:flex flex-col justify-end items-end min-w-[120px]">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                            Total
                          </p>
                          <p className="text-sm font-bold tracking-tighter">
                            NT$ {(priceVal * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-4">
                <div className="bg-[#f9f9f9] p-8 md:p-10 sticky top-32">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] mb-8 border-b border-gray-200 pb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold">
                        NT$ {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6 mb-10">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Estimated Total
                      </span>
                      <span className="text-2xl font-bold tracking-tighter">
                        NT$ {subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full bg-black text-white flex justify-center items-center gap-3 py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#ef4628] transition-all group"
                  >
                    {t("cart.go_to_checkout") || "PROCEED TO CHECKOUT"}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <div className="mt-6 flex justify-center gap-4 opacity-30 grayscale">
                    {/* Placeholder for payment icons */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "zh-TW", ["common"])),
    },
  };
}
