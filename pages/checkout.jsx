import React, { useEffect, useMemo, useState, useRef } from "react";
import { useCart } from "../components/context/CartContext";
import { useUser } from "../components/context/UserContext";
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
  Landmark,
  X,
} from "lucide-react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// 💎 精品級 ATM 彈窗組件
const AtmPopup = ({ bankCode, vAccount, expireDate, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-white w-full max-w-[480px] relative shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-[#ef4628]"></div>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Landmark size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold tracking-widest uppercase text-black mb-3">
              Order Confirmed
            </h2>
            <p className="text-xs text-gray-500 tracking-wide leading-relaxed">
              您的訂單已成功建立。
              <br />
              請透過實體 ATM 或網路銀行，於期限內完成轉帳。
            </p>
          </div>

          <div className="bg-[#fafafa] border border-gray-100 p-6 space-y-5 mb-8">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Bank Code (銀行代碼)
              </p>
              <p className="text-sm font-bold tracking-widest text-black">
                {bankCode}
              </p>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Account (繳費帳號)
              </p>
              <p className="text-lg font-bold tracking-widest text-[#ef4628]">
                {vAccount}
              </p>
            </div>
            <div className="flex justify-between items-center pt-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Deadline (繳費期限)
              </p>
              <p className="text-xs font-medium tracking-widest text-gray-600">
                {expireDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#ef4628] transition-colors shadow-lg"
          >
            查看訂單明細
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const { userInfo } = useUser();
  const router = useRouter();
  const { t } = useTranslation("common");

  const [loading, setLoading] = useState(false);
  const isProcessing = useRef(false);
  const isTapPaySetup = useRef(false);

  const [showAtmPopup, setShowAtmPopup] = useState(false);
  const [atmData, setAtmData] = useState({
    bankCode: "",
    vAccount: "",
    expireDate: "",
  });

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
    paymentMethod: "CREDIT_CARD",
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
  const total = subtotal;

  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        name:
          userInfo.name && userInfo.name !== "KÉSH VIP"
            ? userInfo.name
            : prev.name,
        email: userInfo.email || prev.email,
        phone: userInfo.phone || prev.phone,
      }));
    }
  }, [userInfo]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.TPDirect) {
      const script = document.createElement("script");
      script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.19.2";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const initTapPay = setInterval(() => {
      if (window.TPDirect) {
        if (!isTapPaySetup.current) {
          window.TPDirect.setupSDK(
            Number(process.env.NEXT_PUBLIC_TAPPAY_APP_ID),
            process.env.NEXT_PUBLIC_TAPPAY_APP_KEY,
            "production",
          );
          isTapPaySetup.current = true;
        }
        if (formData.paymentMethod === "CREDIT_CARD") {
          if (document.getElementById("card-number")) {
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
            clearInterval(initTapPay);
          }
        } else {
          clearInterval(initTapPay);
        }
      }
    }, 500);
    return () => clearInterval(initTapPay);
  }, [formData.paymentMethod]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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

  const executeCheckout = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    if (
      ["TW_UNIMART", "TW_FAMI", "TW_HILIFE", "TW_OK"].includes(
        formData.shippingMethod,
      ) &&
      !cvsStore.storeId
    ) {
      isProcessing.current = false;
      return alert("請先選擇超商門市！");
    }
    if (!formData.name || !formData.email || !formData.phone) {
      isProcessing.current = false;
      return alert("請填寫完整的聯絡人資訊！");
    }

    try {
      let prime = "";
      const TPDirect = window.TPDirect;

      if (formData.paymentMethod === "CREDIT_CARD") {
        if (TPDirect.card.getTappayFieldsStatus().canGetPrime === false) {
          isProcessing.current = false;
          return alert("信用卡資訊填寫有誤！");
        }
        prime = await new Promise((resolve, reject) => {
          TPDirect.card.getPrime((result) => {
            if (result.status === 0) resolve(result.card.prime);
            else reject(new Error(`信用卡驗證失敗: ${result.msg}`));
          });
        });
      } else if (formData.paymentMethod === "ATM") {
        prime = await new Promise((resolve, reject) => {
          TPDirect.virtualAccount.getPrime((error, result) => {
            if (error)
              reject(new Error(`產生虛擬帳號失敗: ${error.msg || "未知錯誤"}`));
            else if (result && result.status === 0) resolve(result.prime);
            else reject(new Error("產生虛擬帳號失敗: 系統忙線中"));
          });
        });
      }

      setLoading(true);
      const PUBLISHABLE_API_KEY =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
      const TEST_VARIANT_ID = "variant_01KNEMZ3TQNWZHM40W4JCH874D";
      const token = localStorage.getItem("medusa_auth_token");

      const headers = {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_API_KEY,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const backendUrl =
        process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

      const regionRes = await fetch(`${backendUrl}/store/regions`, { headers });
      const activeRegionId = (await regionRes.json()).regions[0].id;

      const cartRes = await fetch(`${backendUrl}/store/carts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          region_id: activeRegionId,
          email: formData.email,
          metadata: { payment_method: formData.paymentMethod },
          shipping_address: {
            first_name: formData.name,
            phone: formData.phone,
            company: cvsStore.storeId ? cvsStore.storeName : "",
            address_1: cvsStore.storeId ? cvsStore.address : "Taipei",
            city: "Taipei",
            country_code: "tw",
            postal_code: "100",
          },
        }),
      });
      const cartId = (await cartRes.json()).cart.id;

      await fetch(`${backendUrl}/store/carts/${cartId}/line-items`, {
        method: "POST",
        headers,
        body: JSON.stringify({ variant_id: TEST_VARIANT_ID, quantity: 1 }),
      });

      const shipOptRes = await fetch(
        `${backendUrl}/store/shipping-options?cart_id=${cartId}`,
        { headers },
      );
      const shipOptData = await shipOptRes.json();
      if (shipOptData.shipping_options?.length > 0) {
        await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            option_id: shipOptData.shipping_options[0].id,
          }),
        });
      }

      const customCheckoutRes = await fetch(
        `${backendUrl}/store/tappay-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUBLISHABLE_API_KEY,
          },
          body: JSON.stringify({
            cart_id: cartId,
            prime: prime,
            payment_method: formData.paymentMethod,
            customer_info: {
              name: formData.name,
              phone: formData.phone,
              email: formData.email,
            },
          }),
        },
      );

      const completeData = await customCheckoutRes.json();
      if (!customCheckoutRes.ok)
        throw new Error(
          `結帳失敗: ${completeData?.message || completeData?.error || "未知錯誤"}`,
        );

      const paymentUrl =
        completeData.order?.payments?.[0]?.data?.payment_url ||
        completeData.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      // 🔥 觸發彈窗
      if (completeData.bank_code && completeData.vaccount) {
        setAtmData({
          bankCode: completeData.bank_code,
          vAccount: completeData.vaccount,
          expireDate: completeData.expire_date,
        });
        setShowAtmPopup(true);
        return;
      }

      alert("🎉 結帳大成功！");
      router.push("/member");
    } catch (err) {
      console.error("❌ 流程中斷:", err);
      alert(err.message || "結帳發生異常，請看 Console");
    } finally {
      isProcessing.current = false;
      setLoading(false);
    }
  };

  const closeAtmPopup = () => {
    setShowAtmPopup(false);
    router.push("/member");
  };

  if (cartItems.length === 0)
    return <div className="p-32 text-center text-gray-400">BAG IS EMPTY</div>;

  return (
    <PayPalScriptProvider options={{ clientId: "sb", currency: "TWD" }}>
      <div className="min-h-screen bg-white text-black">
        {/* ATM 彈窗 */}
        <AnimatePresence>
          {showAtmPopup && <AtmPopup {...atmData} onClose={closeAtmPopup} />}
        </AnimatePresence>

        <div className="flex flex-col-reverse lg:flex-row">
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
                                <p className="font-bold text-black">
                                  {cvsStore.storeName}
                                </p>
                                <p>{cvsStore.address}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">
                    Payment
                  </h2>
                  <div className="border border-gray-200 divide-y divide-gray-100">
                    <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CREDIT_CARD"
                        checked={formData.paymentMethod === "CREDIT_CARD"}
                        onChange={handleChange}
                        className="accent-black"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={16} /> Credit Card (信用卡)
                      </span>
                    </label>
                    {formData.paymentMethod === "CREDIT_CARD" && (
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
                        value="ATM"
                        checked={formData.paymentMethod === "ATM"}
                        onChange={handleChange}
                        className="accent-black"
                      />
                      <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Landmark size={16} /> ATM 轉帳繳費
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

          <div className="w-full lg:w-[45%] bg-[#fafafa] px-6 py-10 lg:px-14 lg:py-20 border-l border-gray-100 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="max-w-[400px] mx-auto lg:mx-0">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-gray-200 pb-2">
                Order Summary
              </h2>
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
    </PayPalScriptProvider>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: { ...(await serverSideTranslations(locale || "zh-TW", ["common"])) },
  };
}
