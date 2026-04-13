// pages/order-lookup.js
"use client";
import React, { useState } from "react";
import Head from "next/head"; // 🔥 引入 Head 支援 SEO
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function OrderLookupPage() {
  const { t } = useTranslation("common"); // 🔥 啟用翻譯

  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderId.trim() || !email.trim()) {
      setError(t("order_lookup.err_empty")); // 🔥 翻譯錯誤訊息
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/order-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("order_lookup.err_fetch")); // 🔥 翻譯錯誤訊息
        setLoading(false);
        return;
      }

      setOrder(data.order);
    } catch (err) {
      setError(t("order_lookup.err_system")); // 🔥 翻譯錯誤訊息
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t("order_lookup.title")} | KÉSH de¹</title>
      </Head>

      <div className="min-h-screen bg-white text-[#1A1A1A] flex justify-center items-center pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 w-full">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-10">
            <h1 className="text-2xl font-serif">{t("order_lookup.title")}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {t("order_lookup.subtitle")}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="bg-gray-50 border border-gray-100 p-6 md:p-8 rounded-lg space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold tracking-wide">
                  {t("order_lookup.form_order_id_label")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t("order_lookup.form_order_id_placeholder")}
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="mt-2 w-full border border-gray-300 p-3 outline-none focus:border-black bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-bold tracking-wide">
                  {t("order_lookup.form_email_label")}
                </label>
                <input
                  type="email"
                  placeholder={t("order_lookup.form_email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border border-gray-300 p-3 outline-none focus:border-black bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#333] disabled:opacity-50 transition-colors"
            >
              {loading
                ? t("order_lookup.form_btn_loading")
                : t("order_lookup.form_btn_submit")}
            </button>

            <p className="text-xs text-gray-500 leading-relaxed">
              {t("order_lookup.form_privacy_note")}
            </p>
          </form>

          {/* Result */}
          {order && (
            <div className="mt-10 animate-fade-in-up">
              <div className="border-b border-gray-200 pb-3 mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <h2 className="text-lg font-bold uppercase tracking-widest">
                  {t("order_lookup.result_title")}
                </h2>
                <div className="text-sm text-gray-600">
                  #{order.id} ・ {order.date_created}
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard
                  title={t("order_lookup.result_status")}
                  value={order.status_label}
                />
                <InfoCard
                  title={t("order_lookup.result_payment")}
                  value={order.payment_method_title}
                />
                <InfoCard
                  title={t("order_lookup.result_total")}
                  value={`NT$ ${order.total}`}
                />
              </div>

              {/* Main content */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Items */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="text-sm font-bold uppercase tracking-widest">
                      {t("order_lookup.result_items_title")}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {order.items.map((it) => (
                      <div
                        key={it.id}
                        className="px-6 py-4 flex items-start justify-between gap-6"
                      >
                        <div className="min-w-0">
                          <div className="font-bold truncate">{it.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {t("order_lookup.result_qty")} {it.quantity}
                          </div>
                        </div>
                        <div className="text-sm font-medium whitespace-nowrap">
                          NT$ {it.total}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 flex justify-between text-sm">
                    <span className="text-gray-600">
                      {t("order_lookup.result_subtotal")}
                    </span>
                    <span className="font-bold">NT$ {order.total}</span>
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-6">
                  <div className="text-sm font-bold uppercase tracking-widest mb-3">
                    {t("order_lookup.result_shipping_title")}
                  </div>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 shrink-0">
                        {t("order_lookup.result_recipient")}
                      </span>
                      <span className="text-right">
                        {order.shipping_name || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 shrink-0">
                        {t("order_lookup.result_city")}
                      </span>
                      <span className="text-right">
                        {order.shipping_city || "—"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 leading-relaxed">
                      {t("order_lookup.result_shipping_privacy")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <div className="text-xs text-gray-500 uppercase tracking-widest">
        {title}
      </div>
      <div className="mt-2 text-base md:text-lg font-bold break-words">
        {value || "—"}
      </div>
    </div>
  );
}

// 🔥 加上這段，讓伺服器端能夠載入翻譯檔
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "zh-TW", ["common"])),
    },
  };
}
