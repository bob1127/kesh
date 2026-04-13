"use client";
import React, { useState, useEffect } from "react";

import { useUser } from "../../components/context/UserContext";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  LogOut,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function MemberProfile() {
  const { userInfo, logout, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'orders'
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({}); // { [orderId]: boolean }

  // 1. 檢查登入狀態
  useEffect(() => {
    if (!loading && !userInfo) {
      router.push("/login");
    }
  }, [userInfo, loading, router]);

  // 2. 抓取訂單資料
  useEffect(() => {
    console.log("準備抓取訂單，目前 UserInfo:", userInfo);

    if (userInfo?.email && activeTab === "orders") {
      setIsLoadingOrders(true);

      console.log(`Fetching: /api/member/orders?email=${userInfo.email}`);

      fetch(`/api/member/orders?email=${userInfo.email}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("API 回傳資料:", data);
          setOrders(Array.isArray(data) ? data : []);
          setIsLoadingOrders(false);
        })
        .catch((err) => {
          console.error("前端抓取錯誤:", err);
          setIsLoadingOrders(false);
        });
    }
  }, [userInfo, activeTab]);

  const toggleExpanded = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading || !userInfo) return null;

  return (
    <>
      <main className="min-h-screen bg-white text-black font-sans pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center md:text-left border-b border-gray-100 pb-8">
            <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">
              My Account
            </h1>
            <p className="text-gray-500 text-sm">歡迎回來，{userInfo.name}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Left Sidebar (Menu) */}
            <aside className="w-full md:w-1/4">
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all rounded-md ${
                    activeTab === "profile"
                      ? "bg-black text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <User size={18} />
                  個人資料
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all rounded-md ${
                    activeTab === "orders"
                      ? "bg-black text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  <ShoppingBag size={18} />
                  歷史訂單
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide text-red-500 hover:bg-red-50 rounded-md transition-all mt-4 border-t border-gray-100"
                >
                  <LogOut size={18} />
                  登出
                </button>
              </nav>
            </aside>

            {/* Right Content */}
            <div className="w-full md:w-3/4 min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* 1. 個人資料 Tab */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-end justify-between gap-4 mb-6 pb-3 border-b border-gray-200">
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest">
                          Profile Details
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          管理您的會員資料與預設運送資訊
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* 左：帳號概覽 */}
                      <section className="lg:col-span-1 border border-gray-200 bg-white rounded-sm">
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-bold">
                              {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider">
                                Account
                              </p>
                              <p className="text-base font-bold leading-tight">
                                {userInfo?.name || userInfo?.username || "會員"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                @{userInfo?.username || "—"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <InfoRow
                            icon={<Mail size={16} />}
                            label="Email"
                            value={userInfo?.email || "—"}
                          />
                          <InfoRow
                            icon={<Phone size={16} />}
                            label="Phone"
                            value={
                              userInfo?.phone || userInfo?.billing?.phone || "—"
                            }
                          />
                          <InfoRow
                            icon={<User size={16} />}
                            label="Member Level"
                            value={userInfo?.roleLabel || "一般會員"}
                          />

                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                              Quick Notes
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                              <li className="flex items-center justify-between">
                                <span className="text-gray-500">會員狀態</span>
                                <span className="font-semibold">正常</span>
                              </li>
                              <li className="flex items-center justify-between">
                                <span className="text-gray-500">通知</span>
                                <span className="font-semibold">Email</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </section>

                      {/* 右：預設運送地址 */}
                      <section className="lg:col-span-2 border border-gray-200 bg-white rounded-sm">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                              Default Shipping Address
                            </p>
                            <h3 className="text-lg font-bold tracking-wide mt-1">
                              預設運送地址
                            </h3>
                          </div>
                          <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            {hasShippingAddress(userInfo) ? "SET" : "NOT SET"}
                          </div>
                        </div>

                        <div className="p-6">
                          {hasShippingAddress(userInfo) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <AddressRow
                                  label="收件人"
                                  value={
                                    userInfo?.shipping?.name ||
                                    userInfo?.name ||
                                    "—"
                                  }
                                />
                                <AddressRow
                                  label="電話"
                                  value={
                                    userInfo?.shipping?.phone ||
                                    userInfo?.billing?.phone ||
                                    userInfo?.phone ||
                                    "—"
                                  }
                                />
                                <AddressRow
                                  label="Email"
                                  value={userInfo?.email || "—"}
                                />
                              </div>

                              <div className="space-y-3">
                                <AddressRow
                                  label="縣市 / 區域"
                                  value={
                                    [
                                      userInfo?.shipping?.state,
                                      userInfo?.shipping?.city,
                                    ]
                                      .filter(Boolean)
                                      .join(" ") || "—"
                                  }
                                />
                                <AddressRow
                                  label="地址"
                                  value={
                                    [
                                      userInfo?.shipping?.address_1,
                                      userInfo?.shipping?.address_2,
                                    ]
                                      .filter(Boolean)
                                      .join(" ") || "—"
                                  }
                                />
                                <AddressRow
                                  label="郵遞區號"
                                  value={userInfo?.shipping?.postcode || "—"}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-4 bg-gray-50 border border-dashed border-gray-200 p-6 rounded-sm">
                              <div className="mt-1 text-gray-400">
                                <MapPin size={28} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">
                                  尚未設定預設運送地址
                                </p>
                                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                  建議您在下次結帳時填寫完整收件資訊，我們會在您同意後自動保存為預設地址，方便之後快速結帳。
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                  </motion.div>
                )}

                {/* 2. 歷史訂單 Tab */}
                {activeTab === "orders" && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-end justify-between gap-4 mb-6 pb-3 border-b border-gray-200">
                      <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest">
                          Order History
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          檢視您的訂單狀態、付款與配送資訊
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        {orders?.length ? `Total ${orders.length}` : ""}
                      </div>
                    </div>

                    {isLoadingOrders ? (
                      <div className="flex justify-center py-20 text-gray-400 text-sm">
                        載入訂單中...
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-sm">
                        <ShoppingBag size={48} className="text-gray-300 mb-4" />
                        <p className="text-gray-500 text-sm mb-4">
                          您目前還沒有任何訂單
                        </p>
                        <button
                          onClick={() => router.push("/category")}
                          className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#ef4628] transition-colors"
                        >
                          前往購物
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const expanded = Boolean(expandedOrders[order.id]);
                          const createdDate = order?.date_created
                            ? new Date(order.date_created)
                            : null;

                          const shippingName =
                            order?.shipping?.first_name ||
                            order?.shipping?.last_name
                              ? `${order?.shipping?.first_name || ""} ${
                                  order?.shipping?.last_name || ""
                                }`.trim()
                              : order?.billing?.first_name ||
                                order?.billing?.last_name
                              ? `${order?.billing?.first_name || ""} ${
                                  order?.billing?.last_name || ""
                                }`.trim()
                              : "—";

                          const shippingPhone =
                            order?.shipping?.phone ||
                            order?.billing?.phone ||
                            "—";

                          const shippingAddress = formatWCAddress(
                            order?.shipping,
                            order?.billing
                          );

                          return (
                            <div
                              key={order.id}
                              className="border border-gray-200 rounded-sm bg-white hover:border-black transition-colors overflow-hidden"
                            >
                              {/* Header */}
                              <div className="p-6">
                                <div className="flex flex-col gap-4">
                                  <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                        Order
                                      </p>
                                      <div className="flex items-center gap-3">
                                        <p className="font-bold text-xl">
                                          #{order.id}
                                        </p>
                                        <StatusBadge status={order.status} />
                                      </div>
                                      <p className="text-sm text-stone-900 font-bold mt-1">
                                        {createdDate
                                          ? createdDate.toLocaleString()
                                          : "—"}
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-6">
                                      <div className="min-w-[160px]">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                          Total
                                        </p>
                                        <p className="text-base font-bold">
                                          NT$ {formatMoney(order.total)}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {order.currency || "TWD"}
                                        </p>
                                      </div>

                                      <div className="min-w-[180px]">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                          Payment
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                          <CreditCard
                                            size={16}
                                            className="text-gray-400"
                                          />
                                          <span className="font-semibold">
                                            {order.payment_method_title || "—"}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {order.transaction_id
                                            ? `交易號：${order.transaction_id}`
                                            : ""}
                                        </p>
                                      </div>

                                      <div className="min-w-[200px]">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                          Shipping
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                          <Truck
                                            size={16}
                                            className="text-gray-400"
                                          />
                                          <span className="font-semibold">
                                            {order.shipping_lines?.[0]
                                              ?.method_title || "—"}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                          {order.shipping_total
                                            ? `運費：NT$ ${formatMoney(
                                                order.shipping_total
                                              )}`
                                            : ""}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Recipient summary */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4   border border-gray-100 rounded-sm p-4">
                                    <MiniInfo
                                      label="收件人"
                                      value={shippingName}
                                    />
                                    <MiniInfo
                                      label="電話"
                                      value={shippingPhone}
                                    />
                                    <MiniInfo
                                      label="地址"
                                      value={shippingAddress || "—"}
                                    />
                                  </div>

                                  {/* Expand button */}
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => toggleExpanded(order.id)}
                                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                                    >
                                      {expanded ? "收合明細" : "查看明細"}
                                      {expanded ? (
                                        <ChevronUp size={16} />
                                      ) : (
                                        <ChevronDown size={16} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Details */}
                              <AnimatePresence initial={false}>
                                {expanded && (
                                  <motion.div
                                    key={`detail-${order.id}`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="border-t border-gray-200"
                                  >
                                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                      {/* Items */}
                                      <div className="lg:col-span-2">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                                          Items
                                        </p>

                                        <div className="space-y-3">
                                          {(order.line_items || []).map(
                                            (item) => {
                                              const img =
                                                item?.image?.src ||
                                                item?.images?.[0]?.src ||
                                                item?.featured_image ||
                                                null;

                                              const itemTotal =
                                                item?.total &&
                                                item?.total !== "0"
                                                  ? item.total
                                                  : item?.subtotal;

                                              return (
                                                <div
                                                  key={item.id}
                                                  className="flex items-start gap-4 border border-gray-100 rounded-sm p-4"
                                                >
                                                  <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center">
                                                    {img ? (
                                                      // eslint-disable-next-line @next/next/no-img-element
                                                      <img
                                                        src={img}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                      />
                                                    ) : (
                                                      <ShoppingBag
                                                        size={20}
                                                        className="text-gray-400"
                                                      />
                                                    )}
                                                  </div>

                                                  <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm text-gray-900 truncate">
                                                      {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                      數量：x{item.quantity}
                                                    </p>
                                                    {!!item?.meta_data
                                                      ?.length && (
                                                      <div className="mt-2 space-y-1">
                                                        {item.meta_data
                                                          .slice(0, 2)
                                                          .map((m) => (
                                                            <p
                                                              key={
                                                                m.id || m.key
                                                              }
                                                              className="text-xs text-gray-400"
                                                            >
                                                              {m.display_key ||
                                                                m.key}
                                                              ：{" "}
                                                              {String(
                                                                m.display_value ??
                                                                  m.value
                                                              )}
                                                            </p>
                                                          ))}
                                                        {item.meta_data.length >
                                                          2 && (
                                                          <p className="text-xs text-gray-400">
                                                            ...更多規格
                                                          </p>
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>

                                                  <div className="text-right">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                                                      Subtotal
                                                    </p>
                                                    <p className="text-sm font-bold">
                                                      NT${" "}
                                                      {formatMoney(itemTotal)}
                                                    </p>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>

                                      {/* Summary */}
                                      <div className="lg:col-span-1 bg-stone-50 p-2">
                                        <div className="bg-[#e8b62e] p-4">
                                          <p className="text-xs text-stone-800 uppercase tracking-wider mb-3">
                                            Summary
                                          </p>

                                          <div className="border border-gray-500 text-stone-700 rounded-sm p-4 space-y-3">
                                            <SummaryRow
                                              label="小計"
                                              value={`NT$ ${formatMoney(
                                                order.total -
                                                  (Number(
                                                    order.shipping_total
                                                  ) || 0) +
                                                  (Number(
                                                    order.discount_total
                                                  ) || 0)
                                              )}`}
                                              muted
                                            />
                                            <SummaryRow
                                              label="折扣"
                                              value={
                                                Number(order.discount_total) > 0
                                                  ? `- NT$ ${formatMoney(
                                                      order.discount_total
                                                    )}`
                                                  : "—"
                                              }
                                              muted
                                            />
                                            <SummaryRow
                                              label="運費"
                                              value={
                                                Number(order.shipping_total) > 0
                                                  ? `NT$ ${formatMoney(
                                                      order.shipping_total
                                                    )}`
                                                  : "—"
                                              }
                                              muted
                                            />
                                            <SummaryRow
                                              label="稅金"
                                              value={
                                                Number(order.total_tax) > 0
                                                  ? `NT$ ${formatMoney(
                                                      order.total_tax
                                                    )}`
                                                  : "—"
                                              }
                                              muted
                                            />
                                            <div className="pt-3 border-t border-gray-200">
                                              <SummaryRow
                                                label="總計"
                                                value={`NT$ ${formatMoney(
                                                  order.total
                                                )}`}
                                                strong
                                              />
                                            </div>
                                          </div>

                                          {/* Notes / meta */}
                                          {(order.customer_note ||
                                            order.meta_data?.length) && (
                                            <div className="mt-4 border border-gray-500 rounded-sm p-4">
                                              <p className="text-xs text-stone-600 uppercase tracking-wider mb-2">
                                                Notes
                                              </p>
                                              {order.customer_note && (
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                  {order.customer_note}
                                                </p>
                                              )}
                                              {!!order.meta_data?.length && (
                                                <div className="mt-3 space-y-1">
                                                  {order.meta_data
                                                    .slice(0, 3)
                                                    .map((m) => (
                                                      <p
                                                        key={m.id || m.key}
                                                        className="text-xs text-gray-500"
                                                      >
                                                        {m.key}：
                                                        {String(m.value)}
                                                      </p>
                                                    ))}
                                                </div>
                                              )}
                                            </div>
                                          )}
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
      </main>
    </>
  );
}

/* =========================
   UI Helpers
========================= */

const InfoRow = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-[2px] text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 break-words">
          {value}
        </p>
      </div>
    </div>
  );
};

const AddressRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider whitespace-nowrap">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 text-right break-words">
        {value}
      </p>
    </div>
  );
};

const MiniInfo = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-stone-800 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-stone-800 break-words mt-1">
        {value}
      </p>
    </div>
  );
};

const SummaryRow = ({ label, value, strong = false, muted = false }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`font-bold text-sm ${
          muted ? "text-stone-900" : "text-stone-900"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          strong ? "font-bold text-gray-900" : "font-semibold text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

/* =========================
   Data Helpers
========================= */

const hasShippingAddress = (userInfo) => {
  const s = userInfo?.shipping;
  if (!s) return false;
  return Boolean(s.address_1 || s.city || s.state || s.postcode);
};

const formatMoney = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "0";
  return Math.round(n).toLocaleString();
};

const formatWCAddress = (shipping, billing) => {
  const s = shipping || {};
  const b = billing || {};

  const addr1 = s.address_1 || b.address_1;
  const addr2 = s.address_2 || b.address_2;
  const city = s.city || b.city;
  const state = s.state || b.state;
  const postcode = s.postcode || b.postcode;

  const parts = [postcode, state, city, addr1, addr2].filter(Boolean);
  return parts.join(" ");
};

/* =========================
   Status Badge
========================= */

// 狀態標籤組件
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-[#e8b62e] text-stone-800",
    processing: "bg-[#e8b62e] text-stone-800",
    completed: "bg-[#e8b62e] text-stone-800",
    cancelled: "bg-[#e8b62e] text-stone-800",
    refunded: "bg-[#e8b62e] text-stone-800",
    failed: "bg-[#e8b62e] text-stone-800",
  };

  const labels = {
    pending: "待付款",
    processing: "處理中 / 準備出貨",
    completed: "已完成 / 寄出",
    cancelled: "已取消",
    refunded: "已退款",
    failed: "失敗",
    "on-hold": "保留中",
  };

  const currentStyle = styles[status] || "bg-gray-100 text-gray-800";
  const label = labels[status] || status;

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${currentStyle}`}>
      {label}
    </span>
  );
};
