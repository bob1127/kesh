import React, { useEffect, useMemo, useState, useRef } from "react";
import { useCart } from "../components/context/CartContext";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Store,
  CreditCard,
  ChevronLeft,
  Truck,
  Receipt,
  Smartphone,
} from "lucide-react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Link from "next/link";

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const router = useRouter();
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(false);
  const isProcessing = useRef(false);
  const isTapPaySetup = useRef(false);

  const [cvsStore, setCvsStore] = useState({
    storeId: "",
    storeName: "",
    address: "",
    shipType: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shippingMethod: "HOME",
    paymentMethod: "TAPPAY",
  });

  const [invoiceData, setInvoiceData] = useState({
    type: "PERSONAL",
    carrier: "NONE",
    mobileBarcode: "",
    vatNumber: "",
    companyTitle: "",
  });

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) =>
          acc +
          (item.rawPrice ||
            parseInt(String(item.price).replace(/[^\d]/g, ""), 10) ||
            0) *
            item.quantity,
        0,
      ),
    [cartItems],
  );
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  // ==========================================
  // 👤 載入會員資料並自動帶入
  // ==========================================
  useEffect(() => {
    // 這裡示範從 localStorage 抓取會員資料 (如果你的系統用 useMe 或 Context，請換成對應的變數)
    try {
      const storedUser = localStorage.getItem("medusa_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          name: user.first_name
            ? `${user.first_name} ${user.last_name || ""}`.trim()
            : prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }));
      }
    } catch (err) {
      console.log("No logged in user found or error parsing user data.");
    }
  }, []);

  // ==========================================
  // 💳 TapPay 初始化
  // ==========================================
  useEffect(() => {
    if (typeof window !== "undefined" && !window.TPDirect) {
      const script = document.createElement("script");
      script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.19.0";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (formData.paymentMethod === "TAPPAY") {
      const initTapPay = setInterval(() => {
        if (window.TPDirect && !isTapPaySetup.current) {
          clearInterval(initTapPay);
          isTapPaySetup.current = true;

          const appId = process.env.NEXT_PUBLIC_TAPPAY_APP_ID;
          const appKey = process.env.NEXT_PUBLIC_TAPPAY_APP_KEY;

          window.TPDirect.setupSDK(Number(appId), appKey, "production");
          window.TPDirect.card.setup({
            fields: {
              number: {
                element: "#card-number",
                placeholder: "**** **** **** ****",
              },
              expirationDate: {
                element: "#card-expiration-date",
                placeholder: "MM / YY",
              },
              ccv: { element: "#card-ccv", placeholder: "CCV" },
            },
            styles: { input: { color: "#333", "font-size": "14px" } },
          });
        } else if (isTapPaySetup.current) {
          clearInterval(initTapPay);
        }
      }, 500);
      return () => clearInterval(initTapPay);
    }
  }, [formData.paymentMethod]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleInvoiceChange = (e) =>
    setInvoiceData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenTapPayCvsMap = (shipType) => {
    if (!window.TPDirect) return alert("系統載入中，請稍候再試");
    window.TPDirect.cashOnDelivery.setShipType(shipType, (status, msg) => {
      if (status === 0) {
        window.TPDirect.cashOnDelivery.getStoreId((s, m, result) => {
          if (s === 0)
            setCvsStore({
              storeId: result.store_id,
              storeName: result.store_name,
              address: result.store_address,
              shipType,
            });
        });
      } else alert("設定物流通路失敗: " + msg);
    });
  };

  // ==========================================
  // 🚀 執行結帳流程
  // ==========================================
  const executeCheckout = async () => {
    if (isProcessing.current) {
      console.warn("⚠️ 系統正在處理中，已攔截重複點擊！");
      return;
    }

    isProcessing.current = true;

    // 表單驗證
    const isCVS = ["TW_UNIMART", "TW_FAMI", "TW_HILIFE", "TW_OK"].includes(
      formData.shippingMethod,
    );
    if (isCVS && !cvsStore.storeId) {
      isProcessing.current = false;
      return alert("請先選擇超商門市！");
    }
    if (!formData.name || !formData.email || !formData.phone) {
      isProcessing.current = false;
      return alert("請填寫完整的聯絡人資訊！");
    }
    if (
      invoiceData.type === "PERSONAL" &&
      invoiceData.carrier === "MOBILE" &&
      !invoiceData.mobileBarcode
    ) {
      isProcessing.current = false;
      return alert("請輸入手機條碼載具！");
    }
    if (
      invoiceData.type === "COMPANY" &&
      (!invoiceData.vatNumber || !invoiceData.companyTitle)
    ) {
      isProcessing.current = false;
      return alert("請完整輸入統一編號與公司抬頭！");
    }
    if (formData.paymentMethod === "LINEPAY") {
      isProcessing.current = false;
      return alert("LINE Pay 準備中，目前請先使用信用卡！");
    }

    if (formData.paymentMethod === "TAPPAY") {
      const TPDirect = window.TPDirect;
      if (TPDirect.card.getTappayFieldsStatus().canGetPrime === false) {
        isProcessing.current = false;
        return alert("信用卡資訊填寫有誤！");
      }

      try {
        const getPrimePromise = () =>
          new Promise((resolve, reject) => {
            TPDirect.card.getPrime((result) => {
              if (result.status === 0) resolve(result.card.prime);
              else reject(new Error(`信用卡驗證失敗: ${result.msg}`));
            });
          });

        console.log("⏳ 正在等待 TapPay 產生 Prime...");
        const prime = await getPrimePromise();
        setLoading(true); // 取得 Prime 後才顯示 Loading

        const PUBLISHABLE_API_KEY =
          "pk_8cae0356e1f6ff1f46fef038d0502ccc44da72d98db7307cb95350571949983b";
        const TEST_VARIANT_ID = "variant_01KNEMZ3TQNWZHM40W4JCH874D";
        const headers = {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_API_KEY,
        };

        const safeFetch = async (url, options = {}) => {
          const response = await fetch(url, options);
          return response;
        };

        // 1. 建立購物車與地區
        const regionRes = await safeFetch(
          "http://localhost:9000/store/regions",
          { headers },
        );
        const activeRegionId = (await regionRes.json()).regions[0].id;

        const cartRes = await safeFetch("http://localhost:9000/store/carts", {
          method: "POST",
          headers,
          body: JSON.stringify({
            region_id: activeRegionId,
            email: formData.email,
            shipping_address: {
              first_name: formData.name,
              last_name: "Customer",
              phone: formData.phone,
              address_1: cvsStore.storeId ? cvsStore.address : "Taipei",
              city: "Taipei",
              country_code: "tw",
              postal_code: "100",
            },
            billing_address: {
              first_name: formData.name,
              last_name: "Customer",
              phone: formData.phone,
              address_1: "Taipei",
              city: "Taipei",
              country_code: "tw",
              postal_code: "100",
            },
          }),
        });
        const cartId = (await cartRes.json()).cart.id;

        // 2. 加入商品與運費
        await safeFetch(
          `http://localhost:9000/store/carts/${cartId}/line-items`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ variant_id: TEST_VARIANT_ID, quantity: 1 }),
          },
        );

        const shipOptRes = await safeFetch(
          `http://localhost:9000/store/shipping-options?cart_id=${cartId}`,
          { headers },
        );
        const shipOptData = await shipOptRes.json();
        if (shipOptData.shipping_options?.length > 0) {
          await safeFetch(
            `http://localhost:9000/store/carts/${cartId}/shipping-methods`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                option_id: shipOptData.shipping_options[0].id,
              }),
            },
          );
        }

        // 3. 呼叫後端自訂 API (TapPay 扣款)
        console.log(`⏳ 呼叫後端執行 TapPay 扣款...`);
        const customCheckoutRes = await fetch(
          `http://localhost:9000/store/tappay-checkout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key": PUBLISHABLE_API_KEY,
            },
            body: JSON.stringify({ cart_id: cartId, prime: prime }),
          },
        );

        const completeData = await customCheckoutRes.json();
        if (!customCheckoutRes.ok)
          throw new Error(
            `結帳失敗: ${completeData?.message || completeData?.error || "未知錯誤"}`,
          );

        // 4. 攔截 3D 驗證網址並強制跳轉
        if (
          completeData.type === "order" &&
          completeData.order?.payment_status === "requires_action"
        ) {
          const paymentUrl =
            completeData.order.payments?.[0]?.data?.payment_url;
          if (paymentUrl) {
            console.log("🔗 跳轉 3D 驗證:", paymentUrl);
            window.location.href = paymentUrl;
            return; // 這裡安心 return，剩下的交給 Webhook！
          }
        }
        {
          const paymentUrl =
            completeData.order.payments?.[0]?.data?.payment_url;
          if (paymentUrl) {
            console.log("🔗 跳轉 3D 驗證:", paymentUrl);
            window.location.href = paymentUrl;
            return; // 🚨 跳轉後中斷後續的寄信，寄信應該留在 webhook 或是跳轉回來的 success page 做
          }
        }

        // ==========================================
        // 💌 以下為免 3D 驗證 (直接成功) 的後續處理
        // ==========================================

        // 4.1 開立電子發票
        console.log("🧾 準備開立電子發票...");
        await fetch("/api/invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartId,
            formData,
            invoiceData,
            amount: total,
            items: cartItems.map((item) => ({
              name: item.name,
              price:
                item.rawPrice ||
                parseInt(String(item.price).replace(/[^\d]/g, ""), 10) ||
                0,
              quantity: item.quantity,
            })),
          }),
        }).catch((err) => console.warn("⚠️ 發票 API 呼叫失敗", err));

        // 4.2 寄送 KESH 訂單確認信
        console.log("💌 準備發送訂單確認信...");
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            orderId: completeData.order?.id || cartId,
            amount: total,
            shippingMethod: formData.shippingMethod,
            paymentMethod: formData.paymentMethod,
            items: cartItems.map((item) => ({
              name: item.name,
              price:
                item.rawPrice ||
                parseInt(String(item.price).replace(/[^\d]/g, ""), 10) ||
                0,
              quantity: item.quantity,
            })),
          }),
        }).catch((err) => console.warn("⚠️ Email 發送失敗", err));

        alert("🎉 結帳大成功！訂單、發票與確認信皆已處理完成！");
      } catch (err) {
        console.error("❌ 流程中斷:", err);
        alert(err.message || "結帳發生異常，請看 Console");
      } finally {
        isProcessing.current = false;
        setLoading(false);
      }
    }
  };

  if (cartItems.length === 0)
    return <div className="p-32 text-center text-gray-400">BAG IS EMPTY</div>;

  return (
    <PayPalScriptProvider options={{ clientId: "sb", currency: "TWD" }}>
      <div className="min-h-screen bg-white text-black">
        <div className="flex flex-col-reverse lg:flex-row">
          {/* Left Side: Checkout Form */}
          <div className="w-full lg:w-[55%] px-6 py-10 lg:px-20 lg:py-16">
            <div className="max-w-[700px] mx-auto">
              <Link
                href="/cart"
                className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-10 hover:text-black transition-colors"
              >
                <ChevronLeft size={14} className="mr-1" /> Back to bag
              </Link>
              <h1 className="text-3xl font-light tracking-tight uppercase mb-12">
                Checkout
              </h1>

              <div className="space-y-14">
                {/* 顧客資訊 */}
                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">
                    Customer Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border border-gray-200 p-4 text-sm outline-none focus:border-black"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      className="border border-gray-200 p-4 text-sm outline-none focus:border-black"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      className="md:col-span-2 border border-gray-200 p-4 text-sm outline-none focus:border-black"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </section>

                {/* 物流方式 (四大超商) */}
                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">
                    Shipping Method
                  </h2>
                  <div className="border border-gray-200 divide-y divide-gray-100">
                    <label
                      className={`flex items-center justify-between p-6 cursor-pointer ${formData.shippingMethod === "HOME" ? "bg-gray-50" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="HOME"
                          checked={formData.shippingMethod === "HOME"}
                          onChange={handleChange}
                          className="accent-black"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <Truck size={14} /> Home Delivery
                        </p>
                      </div>
                      <span className="text-xs font-bold">NT$80</span>
                    </label>

                    {[
                      { id: "TW_UNIMART", name: "7-11 門市取貨" },
                      { id: "TW_FAMI", name: "全家 門市取貨" },
                      { id: "TW_HILIFE", name: "萊爾富 門市取貨" },
                      { id: "TW_OK", name: "OK 門市取貨" },
                    ].map((cvs) => (
                      <div
                        key={cvs.id}
                        className={`${formData.shippingMethod === cvs.id ? "bg-gray-50" : ""}`}
                      >
                        <label className="flex items-center justify-between p-6 cursor-pointer">
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={cvs.id}
                              checked={formData.shippingMethod === cvs.id}
                              onChange={handleChange}
                              className="accent-black"
                            />
                            <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                              <Store size={14} /> {cvs.name}
                            </p>
                          </div>
                        </label>
                        {formData.shippingMethod === cvs.id && (
                          <div className="px-14 pb-6">
                            <button
                              type="button"
                              onClick={() => handleOpenTapPayCvsMap(cvs.id)}
                              className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                            >
                              {cvsStore.storeId
                                ? "重新選擇門市"
                                : "開啟電子地圖選擇門市"}
                            </button>
                            {cvsStore.storeId && (
                              <div className="mt-3 text-[11px] text-gray-600">
                                <p>
                                  門市店名：{cvsStore.storeName} (
                                  {cvsStore.storeId})
                                </p>
                                <p>門市地址：{cvsStore.address}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* 🧾 電子發票 */}
                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Receipt size={14} /> Invoice (電子發票)
                  </h2>
                  <div className="border border-gray-200 divide-y divide-gray-100">
                    <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="type"
                        value="PERSONAL"
                        checked={invoiceData.type === "PERSONAL"}
                        onChange={handleInvoiceChange}
                        className="accent-black"
                      />
                      <span className="text-[11px] font-bold tracking-widest">
                        二聯式發票 (個人)
                      </span>
                    </label>
                    {invoiceData.type === "PERSONAL" && (
                      <div className="p-5 bg-gray-50 space-y-4">
                        <select
                          name="carrier"
                          value={invoiceData.carrier}
                          onChange={handleInvoiceChange}
                          className="w-full border border-gray-200 p-3 text-sm outline-none focus:border-black bg-white"
                        >
                          <option value="NONE">
                            會員載具 (寄送至結帳 Email)
                          </option>
                          <option value="MOBILE">手機條碼載具</option>
                        </select>
                        {invoiceData.carrier === "MOBILE" && (
                          <input
                            type="text"
                            name="mobileBarcode"
                            placeholder="手機條碼 (例如: /AB12345)"
                            value={invoiceData.mobileBarcode}
                            onChange={handleInvoiceChange}
                            className="w-full border border-gray-200 p-3 text-sm outline-none focus:border-black"
                          />
                        )}
                      </div>
                    )}
                    <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="type"
                        value="COMPANY"
                        checked={invoiceData.type === "COMPANY"}
                        onChange={handleInvoiceChange}
                        className="accent-black"
                      />
                      <span className="text-[11px] font-bold tracking-widest">
                        三聯式發票 (公司)
                      </span>
                    </label>
                    {invoiceData.type === "COMPANY" && (
                      <div className="p-5 bg-gray-50 space-y-4">
                        <input
                          type="text"
                          name="vatNumber"
                          placeholder="統一編號"
                          value={invoiceData.vatNumber}
                          onChange={handleInvoiceChange}
                          className="w-full border border-gray-200 p-3 text-sm outline-none focus:border-black"
                        />
                        <input
                          type="text"
                          name="companyTitle"
                          placeholder="公司抬頭"
                          value={invoiceData.companyTitle}
                          onChange={handleInvoiceChange}
                          className="w-full border border-gray-200 p-3 text-sm outline-none focus:border-black"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* 付款方式 */}
                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">
                    Payment
                  </h2>
                  <div className="border border-gray-200 divide-y divide-gray-100">
                    <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="TAPPAY"
                        checked={formData.paymentMethod === "TAPPAY"}
                        onChange={handleChange}
                        className="accent-black"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={16} /> Credit Card (信用卡)
                      </span>
                    </label>
                    {formData.paymentMethod === "TAPPAY" && (
                      <div className="p-5 bg-gray-50 space-y-4">
                        <div
                          className="bg-white border border-gray-200 p-3 h-12 rounded-sm"
                          id="card-number"
                        ></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div
                            className="bg-white border border-gray-200 p-3 h-12 rounded-sm"
                            id="card-expiration-date"
                          ></div>
                          <div
                            className="bg-white border border-gray-200 p-3 h-12 rounded-sm"
                            id="card-ccv"
                          ></div>
                        </div>
                      </div>
                    )}
                    <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="LINEPAY"
                        checked={formData.paymentMethod === "LINEPAY"}
                        onChange={handleChange}
                        className="accent-black"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={16} /> LINE Pay
                      </span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={executeCheckout}
                    disabled={loading || isProcessing.current}
                    className={`w-full bg-black text-white py-6 text-[11px] font-bold uppercase tracking-[0.4em] mt-10 hover:bg-[#ef4628] transition-all duration-500 shadow-xl ${loading || isProcessing.current ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading || isProcessing.current
                      ? "PROCESSING..."
                      : "COMPLETE PURCHASE"}
                  </button>
                </section>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="w-full lg:w-[45%] bg-[#fafafa] px-6 py-10 lg:px-14 lg:py-20 border-l border-gray-100 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="max-w-[400px] mx-auto lg:mx-0">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-gray-200 pb-2">
                Order Summary
              </h2>
              <div className="space-y-6 mb-10">
                {cartItems.map((item, index) => {
                  const itemPrice =
                    item.rawPrice ||
                    parseInt(String(item.price).replace(/[^\d]/g, ""), 10) ||
                    0;
                  return (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-gray-200 relative shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase">
                          QTY: {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-medium shrink-0">
                        NT$ {(itemPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span className="text-xs uppercase tracking-widest">
                    Subtotal
                  </span>
                  <span>NT$ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="text-xs uppercase tracking-widest">
                    Shipping
                  </span>
                  <span>
                    {shippingFee === 0 ? "FREE" : `NT$ ${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
                  <span className="text-sm uppercase tracking-widest mt-1">
                    Total
                  </span>
                  <span>NT$ {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: { ...(await serverSideTranslations(locale || "zh-TW", ["common"])) },
  };
}
