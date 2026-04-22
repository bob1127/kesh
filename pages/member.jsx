"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "../components/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Landmark,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const getStatusBadge = (paymentStatus) => {
  if (paymentStatus === "captured")
    return {
      label: "已完成",
      color: "bg-[#f2fcf5] text-[#166534] border border-[#dcfce7]",
    };
  if (paymentStatus === "awaiting" || paymentStatus === "requires_action")
    return {
      label: "待付款",
      color: "bg-[#fffbeb] text-[#b45309] border border-[#fef3c7]",
    };
  if (paymentStatus === "canceled")
    return {
      label: "已取消",
      color: "bg-[#f9fafb] text-[#52525b] border border-[#f3f4f6]",
    };
  return {
    label: "處理中",
    color: "bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]",
  };
};

const formatMoney = (v) =>
  Number.isNaN(Number(v)) ? "0" : Math.round(Number(v)).toLocaleString();

export default function MemberProfile() {
  const { userInfo, loading: authLoading, logout } = useUser();
  const router = useRouter();
  const { t } = useTranslation("common");

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (!authLoading && !userInfo) router.push("/login");
  }, [authLoading, userInfo, router]);

  useEffect(() => {
    const fetchMedusaOrders = async () => {
      const token = localStorage.getItem("medusa_auth_token");
      if (!token) return;

      try {
        setLoadingOrders(true);
        const BACKEND_URL =
          process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
        const res = await fetch(`${BACKEND_URL}/store/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": PUB_KEY,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const ordersArray = data.orders || (Array.isArray(data) ? data : []);
          ordersArray.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at),
          );
          setOrders(ordersArray);
        }
      } catch (error) {
        console.error("❌ 訂單抓取失敗:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    if (userInfo && (activeTab === "dashboard" || activeTab === "orders"))
      fetchMedusaOrders();
  }, [userInfo, activeTab]);

  const toggleExpanded = (id) =>
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));

  if (authLoading || !userInfo)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
      </div>
    );

  const menuItems = [
    { id: "dashboard", label: "帳戶總覽", icon: <LayoutDashboard size={16} /> },
    { id: "orders", label: "我的訂單", icon: <ShoppingBag size={16} /> },
    { id: "addresses", label: "收件地址", icon: <MapPin size={16} /> },
    { id: "settings", label: "帳號設定", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <Head>
        <title>會員中心 | KÉSH de¹</title>
      </Head>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-12 pt-4 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-widest uppercase mb-2 text-black">
              My Account
            </h1>
            <p className="text-gray-400 text-sm tracking-wide">
              管理您的訂單與個人資料
            </p>
          </div>
          <div className="text-xs text-gray-400 tracking-widest uppercase">
            Hi, {userInfo.name}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* 左側選單 */}
          <div className="lg:w-64 shrink-0">
            <div className="sticky top-28">
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-4 w-full text-left px-4 py-3 text-xs tracking-widest uppercase transition-all duration-300 ${activeTab === item.id ? "bg-black text-white font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-black"}`}
                  >
                    <span
                      className={
                        activeTab === item.id ? "opacity-100" : "opacity-60"
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
                <div className="pt-6 mt-6 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="flex items-center gap-4 w-full text-left px-4 py-3 text-xs tracking-widest uppercase text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span className="opacity-60">
                      <LogOut size={16} />
                    </span>
                    登出帳號
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* 右側內容 */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="text-sm font-bold tracking-widest uppercase text-black">
                      Order History
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                      {orders.length} Orders
                    </p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-24 text-center border border-gray-100 bg-gray-50 flex flex-col items-center">
                      <ShoppingBag size={32} className="text-gray-400 mb-6" />
                      <p className="text-gray-500 tracking-widest text-xs uppercase mb-6">
                        您目前沒有任何訂單紀錄
                      </p>
                      <Link
                        href="/category/all"
                        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#ef4628] transition-colors"
                      >
                        開始購物
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const expanded = Boolean(expandedOrders[order.id]);
                        const badge = getStatusBadge(order.payment_status);
                        const date = new Date(
                          order.created_at,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });

                        const sAddr = order.shipping_address || {};
                        const storeName = sAddr.company;
                        const cleanLastName =
                          sAddr.last_name === "Customer"
                            ? ""
                            : sAddr.last_name || "";
                        const shippingName =
                          `${sAddr.first_name || ""} ${cleanLastName}`.trim() ||
                          "—";
                        const shippingAddressParts = [
                          sAddr.postal_code,
                          sAddr.province,
                          sAddr.city,
                          sAddr.address_1,
                        ].filter(Boolean);
                        const shippingAddress =
                          shippingAddressParts.join(" ") || "—";

                        const paymentType =
                          order.metadata?.payment_method === "ATM"
                            ? "ATM 轉帳繳費"
                            : "線上刷卡 (TapPay)";

                        const atmBankCode = order.metadata?.atm_bank_code;
                        const atmVaccount = order.metadata?.atm_vaccount;
                        const atmExpire = order.metadata?.atm_expire_date;
                        const showAtmTransferInfo =
                          order.metadata?.payment_method === "ATM" &&
                          (order.payment_status === "awaiting" ||
                            order.payment_status === "requires_action") &&
                          atmVaccount;

                        return (
                          <div
                            key={order.id}
                            className={`border transition-colors duration-300 ${expanded ? "border-black" : "border-gray-200 hover:border-gray-400"}`}
                          >
                            <div
                              className="p-6 cursor-pointer"
                              onClick={() => toggleExpanded(order.id)}
                            >
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                                <div className="col-span-2 md:col-span-1">
                                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5">
                                    Order No.
                                  </p>
                                  <p className="text-sm font-medium text-black tracking-wider">
                                    #{order.display_id}
                                  </p>
                                </div>
                                <div className="hidden md:block">
                                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5">
                                    Date
                                  </p>
                                  <p className="text-xs text-gray-800 uppercase tracking-wider">
                                    {date}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5">
                                    Status
                                  </p>
                                  <span
                                    className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${badge.color}`}
                                  >
                                    {badge.label}
                                  </span>
                                </div>
                                <div className="hidden md:block text-right">
                                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5">
                                    Total
                                  </p>
                                  <p className="text-sm font-medium text-black">
                                    NT$ {formatMoney(order.total)}
                                  </p>
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                  <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                    {expanded ? "Close" : "View"}
                                    {expanded ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {expanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-gray-100 bg-white p-6 md:p-8 flex flex-col lg:flex-row gap-12">
                                    {/* 左：商品明細 */}
                                    <div className="flex-1">
                                      <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">
                                        Purchased Items
                                      </h4>
                                      <div className="space-y-6">
                                        {(order.items || []).map((item) => (
                                          <div
                                            key={item.id}
                                            className="flex gap-6"
                                          >
                                            <div className="w-20 h-20 bg-gray-50 border border-gray-100 shrink-0">
                                              <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                              />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                              <div>
                                                <p className="font-bold text-xs tracking-wider text-black">
                                                  {item.title}
                                                </p>
                                              </div>
                                              <div className="flex justify-between items-end">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                                  Qty: {item.quantity}
                                                </p>
                                                <p className="text-xs font-bold tracking-wider text-black">
                                                  NT$ {formatMoney(item.total)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 右：收件資訊與金額 */}
                                    <div className="lg:w-[350px] flex flex-col gap-8 shrink-0">
                                      {/* 🔥 升級為 Popup 質感的 ATM 卡片 */}
                                      {showAtmTransferInfo && (
                                        <div className="bg-[#fafafa] border border-gray-200 p-6 shadow-sm">
                                          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
                                            <Landmark
                                              size={18}
                                              className="text-black"
                                            />
                                            <h4 className="text-xs font-bold text-black uppercase tracking-widest">
                                              Pending Payment (待付款)
                                            </h4>
                                          </div>
                                          <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Bank Code (銀行代碼)
                                              </p>
                                              <p className="text-sm font-bold tracking-widest text-black">
                                                {atmBankCode}
                                              </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Account (繳費帳號)
                                              </p>
                                              <p className="text-lg font-bold tracking-widest text-[#ef4628]">
                                                {atmVaccount}
                                              </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Deadline (繳費期限)
                                              </p>
                                              <p className="text-xs font-medium tracking-widest text-gray-600">
                                                {atmExpire}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      <div>
                                        <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                                          Shipping Details
                                        </h4>
                                        <div className="text-xs text-gray-700 space-y-4 leading-relaxed">
                                          <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                              Recipient (收件人)
                                            </p>
                                            <p className="font-bold text-black uppercase tracking-wider">
                                              {shippingName}
                                            </p>
                                            <p className="text-gray-500">
                                              {sAddr.phone}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                              Payment Method
                                            </p>
                                            <p className="font-medium text-black">
                                              {paymentType}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                              Shipping Address (配送地址)
                                            </p>
                                            <p className="text-gray-500 leading-relaxed">
                                              {shippingAddress}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                                          Order Summary
                                        </h4>
                                        <div className="space-y-3 text-xs tracking-wider text-gray-600">
                                          <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>
                                              NT$ {formatMoney(order.subtotal)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Shipping (順豐速運)</span>
                                            <span>Free</span>
                                          </div>
                                          <div className="flex justify-between border-t border-gray-200 pt-3 mt-3 text-black font-bold text-sm">
                                            <span>Total</span>
                                            <span>
                                              NT$ {formatMoney(order.total)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
    props: { ...(await serverSideTranslations(locale || "zh-TW", ["common"])) },
  };
}
