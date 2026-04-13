"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "../components/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  Clock,
  CheckCircle,
  CreditCard,
  LogOut,
  ShoppingBag,
  AlertCircle,
  LayoutDashboard,
  MapPin,
  Settings,
} from "lucide-react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// --- 狀態標籤 helper (結合 i18n) ---
const getStatusBadge = (status, t) => {
  switch (status) {
    case "pending":
    case "requires_action":
      return {
        label: t("member.status.pending"),
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock size={14} />,
      };
    case "processing":
      return {
        label: t("member.status.processing"),
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Package size={14} />,
      };
    case "completed":
      return {
        label: t("member.status.completed"),
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={14} />,
      };
    case "canceled":
      return {
        label: t("member.status.canceled"),
        color: "bg-gray-100 text-gray-500 border-gray-200",
        icon: <AlertCircle size={14} />,
      };
    default:
      return {
        label: t("member.status.unknown"),
        color: "bg-gray-50 text-gray-600 border-gray-200",
        icon: <Package size={14} />,
      };
  }
};

export default function MemberProfile() {
  const { userInfo, loading: authLoading, logout } = useUser();
  const router = useRouter();
  const { t } = useTranslation("common");

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, orders, addresses, settings

  // 1. 驗證登入狀態
  useEffect(() => {
    if (!authLoading && !userInfo) {
      router.push("/login");
    }
  }, [authLoading, userInfo, router]);

  // 2. 抓取訂單資料
  useEffect(() => {
    const fetchMedusaOrders = async () => {
      const token = localStorage.getItem("medusa_auth_token");
      if (!token) return;

      try {
        setLoadingOrders(true);
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const res = await fetch(`${BACKEND_URL}/store/customers/me/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (userInfo) {
      fetchMedusaOrders();
    }
  }, [userInfo]);

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.payment_status === "requires_action",
  );
  const completedOrders = orders.filter((o) => o.status === "completed");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ef4628]"></div>
      </div>
    );
  }

  if (!userInfo) return null;

  // --- 定義左側選單 ---
  const menuItems = [
    {
      id: "dashboard",
      label: t("member.tabs.dashboard"),
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "orders",
      label: t("member.tabs.orders"),
      icon: <ShoppingBag size={18} />,
    },
    {
      id: "addresses",
      label: t("member.tabs.addresses"),
      icon: <MapPin size={18} />,
    },
    {
      id: "settings",
      label: t("member.tabs.settings"),
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
      <Head>
        <title>{t("member.title")} | KÉSH de¹</title>
      </Head>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="mb-10 pt-4 border-b border-gray-200 pb-6">
          <h1 className="text-2xl md:text-3xl font-medium tracking-widest uppercase mb-2 text-black">
            {t("member.title")}
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">
            {t("member.subtitle")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* --- 左側：導航選單 --- */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-none border border-gray-200 p-6 sticky top-28">
              {/* Profile Overview */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200 flex-shrink-0">
                  {userInfo.avatar ? (
                    <Image
                      src={userInfo.avatar}
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                    {t("member.welcome")}
                  </p>
                  <h2 className="text-base font-bold text-gray-900 truncate">
                    {userInfo.name}
                  </h2>
                </div>
              </div>

              {/* Menu Links */}
              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm tracking-wide transition-colors ${
                      activeTab === item.id
                        ? "bg-[#ef4628] text-white font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}

                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm tracking-wide text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-4 border-t border-gray-100"
                >
                  <LogOut size={18} /> {t("member.tabs.logout")}
                </button>
              </nav>
            </div>
          </div>

          {/* --- 右側：動態內容區 --- */}
          <div className="lg:w-3/4">
            <AnimatePresence mode="wait">
              {/* 1. Dashboard 總覽 */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-lg font-bold tracking-widest uppercase mb-6 text-black border-b border-black pb-2 inline-block">
                    {t("member.tabs.dashboard")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 border border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">
                        {t("member.dashboard.total_spent")}
                      </p>
                      <p className="text-2xl font-medium text-black tracking-tight">
                        NT${" "}
                        {(
                          orders.reduce((acc, curr) => acc + curr.total, 0) /
                          100
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white p-6 border border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">
                        {t("member.dashboard.completed_orders")}
                      </p>
                      <p className="text-2xl font-medium text-black">
                        {completedOrders.length}
                      </p>
                    </div>
                    <div className="bg-white p-6 border border-gray-200">
                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">
                        {t("member.dashboard.pending_orders")}
                      </p>
                      <p className="text-2xl font-medium text-[#ef4628]">
                        {pendingOrders.length}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. Orders 訂單列表 */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-lg font-bold tracking-widest uppercase mb-6 text-black border-b border-black pb-2 inline-block">
                    {t("member.tabs.orders")}
                  </h3>

                  {loadingOrders ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-32 bg-gray-200 animate-pulse border border-gray-200"
                        ></div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white py-16 px-6 text-center border border-gray-200">
                      <ShoppingBag
                        size={40}
                        strokeWidth={1}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <p className="text-gray-500 tracking-widest text-sm mb-4">
                        {t("member.orders.empty")}
                      </p>
                      <Link
                        href="/category/all"
                        className="text-[#ef4628] text-xs font-bold uppercase tracking-widest border-b border-[#ef4628] pb-1 hover:text-black hover:border-black transition-colors"
                      >
                        {t("member.orders.shop_now")}
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const statusObj = getStatusBadge(order.status, t);
                        const date = new Date(
                          order.created_at,
                        ).toLocaleDateString(
                          router.locale === "ko" ? "ko-KR" : "zh-TW",
                        );

                        return (
                          <div
                            key={order.id}
                            className="bg-white border border-gray-200 hover:border-gray-400 transition-colors"
                          >
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                  <span className="text-base font-bold text-black tracking-widest uppercase">
                                    #{order.display_id}
                                  </span>
                                  <span
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusObj.color}`}
                                  >
                                    {statusObj.icon} {statusObj.label}
                                  </span>
                                </div>
                                <div className="text-[12px] text-gray-500 font-medium tracking-wide flex gap-4">
                                  <span>{date}</span>
                                  <span className="text-gray-300">|</span>
                                  <span>
                                    {order.items?.length || 0}{" "}
                                    {t("member.orders.items")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 md:text-right border-t border-gray-100 pt-4 md:border-0 md:pt-0">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                                  {t("member.orders.order_amount")}
                                </p>
                                <p className="text-lg font-bold text-black tracking-tight">
                                  NT$ {(order.total / 100).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                <button className="px-5 py-2.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                  {t("member.orders.view_details")}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* 3. Addresses 收件地址 (UI 佔位符) */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-lg font-bold tracking-widest uppercase text-black border-b border-black pb-2 inline-block">
                      {t("member.tabs.addresses")}
                    </h3>
                    <button className="text-[#ef4628] text-xs font-bold uppercase tracking-widest hover:text-black transition-colors">
                      + {t("member.addresses.add_new")}
                    </button>
                  </div>
                  <div className="bg-white py-16 px-6 text-center border border-gray-200">
                    <MapPin
                      size={40}
                      strokeWidth={1}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <p className="text-gray-500 tracking-widest text-sm">
                      {t("member.addresses.empty")}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 4. Settings 帳號設定 (UI 佔位符) */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h3 className="text-lg font-bold tracking-widest uppercase mb-6 text-black border-b border-black pb-2 inline-block">
                    {t("member.tabs.settings")}
                  </h3>
                  <div className="bg-white p-6 sm:p-8 border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                      {t("member.settings.title")}
                    </h4>
                    <form
                      className="space-y-6 max-w-md"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-black uppercase tracking-widest mb-2">
                          {t("member.settings.name")}
                        </label>
                        <input
                          type="text"
                          defaultValue={userInfo.name}
                          className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-black uppercase tracking-widest mb-2">
                          {t("member.settings.email")}
                        </label>
                        <input
                          type="email"
                          disabled
                          defaultValue={userInfo.email}
                          className="w-full border border-gray-200 px-4 py-3 text-sm outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <button
                        type="button"
                        className="bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#ef4628] transition-colors mt-4"
                      >
                        {t("member.settings.save")}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || "zh-TW", ["common"])),
    },
  };
}
