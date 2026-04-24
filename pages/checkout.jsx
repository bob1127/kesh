"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useCart } from "../components/context/CartContext";
import { useUser } from "../components/context/UserContext";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  CreditCard,
  ChevronLeft,
  Truck,
  Landmark,
  X,
  Smartphone,
  Globe,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// 內建台灣縣市區域資料庫
const TAIWAN_CITIES = {
  臺北市: [
    "中正區",
    "大同區",
    "中山區",
    "松山區",
    "大安區",
    "萬華區",
    "信義區",
    "士林區",
    "北投區",
    "內湖區",
    "南港區",
    "文山區",
  ],
  新北市: [
    "萬里區",
    "金山區",
    "板橋區",
    "汐止區",
    "深坑區",
    "石碇區",
    "瑞芳區",
    "平溪區",
    "雙溪區",
    "貢寮區",
    "新店區",
    "坪林區",
    "烏來區",
    "永和區",
    "中和區",
    "土城區",
    "三峽區",
    "樹林區",
    "鶯歌區",
    "三重區",
    "新莊區",
    "泰山區",
    "林口區",
    "蘆洲區",
    "五股區",
    "八里區",
    "淡水區",
    "三芝區",
    "石門區",
  ],
  桃園市: [
    "中壢區",
    "平鎮區",
    "龍潭區",
    "楊梅區",
    "新屋區",
    "觀音區",
    "桃園區",
    "龜山區",
    "八德區",
    "大溪區",
    "復興區",
    "大園區",
    "蘆竹區",
  ],
  臺中市: [
    "中區",
    "東區",
    "南區",
    "西區",
    "北區",
    "北屯區",
    "西屯區",
    "南屯區",
    "太平區",
    "大里區",
    "霧峰區",
    "烏日區",
    "豐原區",
    "后里區",
    "石岡區",
    "東勢區",
    "和平區",
    "新社區",
    "潭子區",
    "大雅區",
    "神岡區",
    "大肚區",
    "沙鹿區",
    "龍井區",
    "梧棲區",
    "清水區",
    "大甲區",
    "外埔區",
    "大安區",
  ],
  臺南市: [
    "中西區",
    "東區",
    "南區",
    "北區",
    "安平區",
    "安南區",
    "永康區",
    "歸仁區",
    "新化區",
    "左鎮區",
    "玉井區",
    "楠西區",
    "南化區",
    "仁德區",
    "關廟區",
    "龍崎區",
    "官田區",
    "麻豆區",
    "佳里區",
    "西港區",
    "七股區",
    "將軍區",
    "學甲區",
    "北門區",
    "新營區",
    "後壁區",
    "白河區",
    "東山區",
    "六甲區",
    "下營區",
    "柳營區",
    "鹽水區",
    "善化區",
    "大內區",
    "山上區",
    "新市區",
    "安定區",
  ],
  高雄市: [
    "新興區",
    "前金區",
    "苓雅區",
    "鹽埕區",
    "鼓山區",
    "旗津區",
    "前鎮區",
    "三民區",
    "楠梓區",
    "小港區",
    "左營區",
    "仁武區",
    "大社區",
    "岡山區",
    "路竹區",
    "阿蓮區",
    "田寮區",
    "燕巢區",
    "橋頭區",
    "梓官區",
    "彌陀區",
    "永安區",
    "湖內區",
    "鳳山區",
    "大寮區",
    "林園區",
    "鳥松區",
    "大樹區",
    "旗山區",
    "美濃區",
    "六龜區",
    "內門區",
    "杉林區",
    "甲仙區",
    "桃源區",
    "那瑪夏區",
    "茂林區",
  ],
  基隆市: [
    "仁愛區",
    "信義區",
    "中正區",
    "中山區",
    "安樂區",
    "暖暖區",
    "七堵區",
  ],
  新竹市: ["東區", "北區", "香山區"],
  嘉義市: ["東區", "西區"],
  新竹縣: [
    "竹北市",
    "湖口鄉",
    "新豐鄉",
    "新埔鎮",
    "關西鎮",
    "芎林鄉",
    "寶山鄉",
    "竹東鎮",
    "五峰鄉",
    "橫山鄉",
    "尖石鄉",
    "北埔鄉",
    "峨眉鄉",
  ],
  苗栗縣: [
    "竹南鎮",
    "頭份市",
    "三灣鄉",
    "南庄鄉",
    "獅潭鄉",
    "後龍鎮",
    "通霄鎮",
    "苑裡鎮",
    "苗栗市",
    "造橋鄉",
    "頭屋鄉",
    "公館鄉",
    "大湖鄉",
    "泰安鄉",
    "銅鑼鄉",
    "三義鄉",
    "西湖鄉",
    "卓蘭鎮",
  ],
  彰化縣: [
    "彰化市",
    "芬園鄉",
    "花壇鄉",
    "秀水鄉",
    "鹿港鎮",
    "福興鄉",
    "線西鄉",
    "和美鎮",
    "伸港鄉",
    "員林市",
    "社頭鄉",
    "永靖鄉",
    "埔心鄉",
    "溪湖鎮",
    "大村鄉",
    "埔鹽鄉",
    "田中鎮",
    "北斗鎮",
    "田尾鄉",
    "埤頭鄉",
    "溪州鄉",
    "竹塘鄉",
    "二林鎮",
    "大城鄉",
    "芳苑鄉",
    "二水鄉",
  ],
  南投縣: [
    "南投市",
    "中寮鄉",
    "草屯鎮",
    "國姓鄉",
    "埔里鎮",
    "仁愛鄉",
    "名間鄉",
    "集集鎮",
    "水里鄉",
    "魚池鄉",
    "信義鄉",
    "竹山鎮",
    "鹿谷鄉",
  ],
  雲林縣: [
    "斗南鎮",
    "大埤鄉",
    "虎尾鎮",
    "土庫鎮",
    "褒忠鄉",
    "東勢鄉",
    "臺西鄉",
    "崙背鄉",
    "麥寮鄉",
    "斗六市",
    "林內鄉",
    "古坑鄉",
    "莿桐鄉",
    "西螺鎮",
    "二崙鄉",
    "北港鎮",
    "水林鄉",
    "口湖鄉",
    "四湖鄉",
    "元長鄉",
  ],
  嘉義縣: [
    "番路鄉",
    "梅山鄉",
    "竹崎鄉",
    "阿里山鄉",
    "中埔鄉",
    "大埔鄉",
    "水上鄉",
    "鹿草鄉",
    "太保市",
    "朴子市",
    "東石鄉",
    "六腳鄉",
    "新港鄉",
    "民雄鄉",
    "大林鎮",
    "溪口鄉",
    "義竹鄉",
    "布袋鎮",
  ],
  屏東縣: [
    "屏東市",
    "三地門鄉",
    "霧臺鄉",
    "瑪家鄉",
    "九如鄉",
    "里港鄉",
    "高樹鄉",
    "鹽埔鄉",
    "長治鄉",
    "麟洛鄉",
    "竹田鄉",
    "內埔鄉",
    "萬丹鄉",
    "潮州鎮",
    "泰武鄉",
    "來義鄉",
    "萬巒鄉",
    "崁頂鄉",
    "新埤鄉",
    "南州鄉",
    "林邊鄉",
    "東港鎮",
    "琉球鄉",
    "佳冬鄉",
    "新園鄉",
    "枋寮鄉",
    "枋山鄉",
    "春日鄉",
    "獅子鄉",
    "車城鄉",
    "牡丹鄉",
    "恆春鎮",
    "滿州鄉",
  ],
  宜蘭縣: [
    "宜蘭市",
    "頭城鎮",
    "礁溪鄉",
    "壯圍鄉",
    "員山鄉",
    "羅東鎮",
    "三星鄉",
    "大同鄉",
    "五結鄉",
    "冬山鄉",
    "蘇澳鎮",
    "南澳鄉",
  ],
  花蓮縣: [
    "花蓮市",
    "新城鄉",
    "秀林鄉",
    "吉安鄉",
    "壽豐鄉",
    "鳳林鎮",
    "光復鄉",
    "豐濱鄉",
    "瑞穗鄉",
    "萬榮鄉",
    "玉里鎮",
    "卓溪鄉",
    "富里鄉",
  ],
  臺東縣: [
    "臺東市",
    "綠島鄉",
    "蘭嶼鄉",
    "延平鄉",
    "卑南鄉",
    "鹿野鄉",
    "關山鎮",
    "海端鄉",
    "池上鄉",
    "東河鄉",
    "成功鎮",
    "長濱鄉",
    "太麻里鄉",
    "金峰鄉",
    "大武鄉",
    "達仁鄉",
  ],
  澎湖縣: ["馬公市", "西嶼鄉", "望安鄉", "七美鄉", "白沙鄉", "湖西鄉"],
  金門縣: ["金沙鎮", "金湖鎮", "金寧鄉", "金城鎮", "烈嶼鄉", "烏坵鄉"],
  連江縣: ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"],
};

// 精品級 ATM 彈窗組件
const AtmPopup = ({ bankCode, vAccount, expireDate, onClose, t }) => {
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
              {t("checkout.popup.title", "ATM 轉帳資訊")}
            </h2>
            <p className="text-xs text-gray-500 tracking-wide leading-relaxed">
              {t("checkout.popup.desc1", "請於繳費期限內完成轉帳")}
              <br />
              {t("checkout.popup.desc2", "系統將自動對帳並安排出貨")}
            </p>
          </div>
          <div className="bg-[#fafafa] border border-gray-100 p-6 space-y-5 mb-8">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {t("checkout.popup.bankCode", "銀行代碼")}
              </p>
              <p className="text-sm font-bold tracking-widest text-black">
                {bankCode}
              </p>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {t("checkout.popup.account", "轉帳帳號")}
              </p>
              <p className="text-lg font-bold tracking-widest text-[#ef4628]">
                {vAccount}
              </p>
            </div>
            <div className="flex justify-between items-center pt-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {t("checkout.popup.deadline", "繳費期限")}
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
            {t("checkout.popup.viewOrder", "查看訂單")}
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

  // 根據 Next.js 語系自動判斷初始國家
  const defaultCountry =
    router.locale === "en" ? "US" : router.locale === "ko" ? "KR" : "TW";

  const [loading, setLoading] = useState(false);
  const isProcessing = useRef(false);
  const isTapPaySetup = useRef(false);
  const [showAtmPopup, setShowAtmPopup] = useState(false);
  const [atmData, setAtmData] = useState({
    bankCode: "",
    vAccount: "",
    expireDate: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: defaultCountry,
    city: "",
    district: "",
    street: "",
    paymentMethod: "CREDIT_CARD",
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
    if (userInfo)
      setFormData((prev) => ({
        ...prev,
        name:
          userInfo.name && userInfo.name !== "KÉSH VIP"
            ? userInfo.name
            : prev.name,
        email: userInfo.email || prev.email,
        phone: userInfo.phone || prev.phone,
      }));
  }, [userInfo]);

  // TapPay SDK 載入
  useEffect(() => {
    if (typeof window !== "undefined" && !window.TPDirect) {
      const script = document.createElement("script");
      script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.19.2";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }, []);

  // 綁定 TapPay 信用卡欄位
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
        } else clearInterval(initTapPay);
      }
    }, 500);
    return () => clearInterval(initTapPay);
  }, [formData.paymentMethod]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "country") {
        const isForeign = value !== "TW";
        let resetPayment = prev.paymentMethod;

        // 防呆邏輯
        if (isForeign && prev.paymentMethod === "ATM")
          resetPayment = "CREDIT_CARD";
        if (
          !isForeign &&
          (prev.paymentMethod === "PAYPAL" ||
            prev.paymentMethod === "APPLE_PAY")
        )
          resetPayment = "CREDIT_CARD";

        return {
          ...prev,
          country: value,
          city: "",
          district: "",
          paymentMethod: resetPayment,
        };
      }
      if (name === "city" && prev.country === "TW")
        return { ...prev, [name]: value, district: "" };
      return { ...prev, [name]: value };
    });
  };

  const executeCheckout = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.city ||
      !formData.street ||
      (formData.country === "TW" && !formData.district)
    ) {
      isProcessing.current = false;
      return alert(t("checkout.alert.fillInfo", "請填寫完整收件資訊"));
    }

    try {
      let prime = "";
      const TPDirect = window.TPDirect;

      if (formData.paymentMethod === "CREDIT_CARD") {
        if (TPDirect.card.getTappayFieldsStatus().canGetPrime === false) {
          isProcessing.current = false;
          return alert(t("checkout.alert.cardError", "信用卡資訊有誤"));
        }
        prime = await new Promise((resolve, reject) => {
          TPDirect.card.getPrime((result) => {
            if (result.status === 0) resolve(result.card.prime);
            else reject(new Error(`Error: ${result.msg}`));
          });
        });
      } else if (formData.paymentMethod === "ATM") {
        prime = await new Promise((resolve, reject) => {
          TPDirect.virtualAccount.getPrime((error, result) => {
            if (error)
              reject(
                new Error(
                  error.msg ||
                    t("checkout.alert.atmError", "取得 ATM 帳號失敗"),
                ),
              );
            else if (result && result.status === 0) resolve(result.prime);
            else
              reject(
                new Error(t("checkout.alert.atmError", "取得 ATM 帳號失敗")),
              );
          });
        });
      } else if (
        formData.paymentMethod === "APPLE_PAY" ||
        formData.paymentMethod === "PAYPAL"
      ) {
        console.log(`Processing ${formData.paymentMethod}...`);
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
            province: formData.city,
            city: formData.country === "TW" ? formData.district : formData.city,
            address_1: formData.street,
            country_code: formData.country.toLowerCase(),
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
      if (shipOptData.shipping_options?.length > 0)
        await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            option_id: shipOptData.shipping_options[0].id,
          }),
        });

      const customCheckoutRes = await fetch(
        `${backendUrl}/store/tappay-checkout`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            cart_id: cartId,
            prime: prime || "mock_prime",
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
          completeData?.message || completeData?.error || "Error",
        );

      const paymentUrl =
        completeData.order?.payments?.[0]?.data?.payment_url ||
        completeData.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      if (completeData.bank_code && completeData.vaccount) {
        setAtmData({
          bankCode: completeData.bank_code,
          vAccount: completeData.vaccount,
          expireDate: completeData.expire_date,
        });
        setShowAtmPopup(true);
        return;
      }

      router.push("/member");
    } catch (err) {
      console.error("❌ Checkout Error:", err);
      alert(err.message || "Error occurred");
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
    return (
      <div className="p-32 text-center text-gray-400">
        {t("checkout.emptyBag")}
      </div>
    );

  return (
    // 🔥 替換成正式環境變數並設定 intent="capture"
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb",
        currency: "TWD",
        intent: "capture",
      }}
    >
      <div className="min-h-screen bg-white text-black">
        <AnimatePresence>
          {showAtmPopup && (
            <AtmPopup {...atmData} onClose={closeAtmPopup} t={t} />
          )}
        </AnimatePresence>

        <div className="flex flex-col-reverse lg:flex-row">
          <div className="w-full lg:w-[55%] px-6 py-10 lg:px-20 lg:py-16">
            <div className="max-w-[700px] mx-auto">
              <Link
                href="/cart"
                className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-10 hover:text-black transition-colors"
              >
                <ChevronLeft size={14} className="mr-1" />{" "}
                {t("checkout.backToBag")}
              </Link>
              <h1 className="text-3xl font-light tracking-tight uppercase mb-12">
                {t("checkout.title")}
              </h1>

              <div className="space-y-14">
                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">
                    {t("checkout.customerInfo")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder={t(
                        "checkout.fullNamePlaceholder",
                        "Full Name",
                      )}
                      value={formData.name}
                      onChange={handleChange}
                      className="border border-gray-200 p-4 text-sm outline-none focus:border-black"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder={t(
                        "checkout.emailPlaceholder",
                        "Email Address",
                      )}
                      value={formData.email}
                      onChange={handleChange}
                      className="border border-gray-200 p-4 text-sm outline-none focus:border-black"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder={t(
                        "checkout.phonePlaceholder",
                        "Phone Number",
                      )}
                      className="md:col-span-2 border border-gray-200 p-4 text-sm outline-none focus:border-black"
                      value={formData.phone}
                      onChange={handleChange}
                    />

                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="md:col-span-2 border border-gray-200 p-4 text-sm outline-none focus:border-black appearance-none bg-white text-black"
                    >
                      <option value="TW">Taiwan (台灣)</option>
                      <option value="US">United States (美國)</option>
                      <option value="KR">South Korea (韓國)</option>
                    </select>

                    {formData.country === "TW" ? (
                      <>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={`border border-gray-200 p-4 text-sm outline-none focus:border-black appearance-none bg-white ${!formData.city ? "text-gray-400" : "text-black"}`}
                        >
                          <option value="" disabled>
                            {t("checkout.selectCity", "選擇縣市")}
                          </option>
                          {Object.keys(TAIWAN_CITIES).map((city) => (
                            <option
                              key={city}
                              value={city}
                              className="text-black"
                            >
                              {city}
                            </option>
                          ))}
                        </select>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          disabled={!formData.city}
                          className={`border border-gray-200 p-4 text-sm outline-none focus:border-black appearance-none ${!formData.city ? "bg-gray-50 cursor-not-allowed text-gray-400" : "bg-white"} ${!formData.district ? "text-gray-400" : "text-black"}`}
                        >
                          <option value="" disabled>
                            {t("checkout.selectDistrict", "選擇區域")}
                          </option>
                          {formData.city &&
                            TAIWAN_CITIES[formData.city].map((district) => (
                              <option
                                key={district}
                                value={district}
                                className="text-black"
                              >
                                {district}
                              </option>
                            ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          name="city"
                          placeholder="State / Province"
                          className="border border-gray-200 p-4 text-sm outline-none focus:border-black"
                          value={formData.city}
                          onChange={handleChange}
                        />
                        <input
                          type="text"
                          name="district"
                          placeholder="City"
                          className="border border-gray-200 p-4 text-sm outline-none focus:border-black"
                          value={formData.district}
                          onChange={handleChange}
                        />
                      </>
                    )}

                    <input
                      type="text"
                      name="street"
                      placeholder={t(
                        "checkout.streetPlaceholder",
                        "Street Address",
                      )}
                      className="md:col-span-2 border border-gray-200 p-4 text-sm outline-none focus:border-black"
                      value={formData.street}
                      onChange={handleChange}
                    />
                  </div>
                </section>

                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">
                    {t("checkout.shippingMethod")}
                  </h2>
                  <div className="border border-gray-200">
                    <label className="flex items-center justify-between p-6 bg-gray-50 cursor-default">
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          checked
                          readOnly
                          className="accent-black"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <Truck size={14} />
                          {formData.country === "TW"
                            ? t("checkout.shippingDelivery", "宅配到府")
                            : formData.country === "US"
                              ? "International Shipping (SF Express)"
                              : "국제 배송 (SF Express)"}
                        </p>
                      </div>
                    </label>
                  </div>
                </section>

                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-6 border-b border-gray-100 pb-2">
                    {t("checkout.payment")}
                  </h2>
                  <div className="border border-gray-200 divide-y divide-gray-100">
                    {/* 所有國家都有：信用卡 */}
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
                        <CreditCard size={16} />
                        {formData.country === "TW"
                          ? t("checkout.creditCard", "信用卡付款")
                          : "Credit Card (Visa / Master / JCB / AMEX)"}
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

                    {/* 台灣專屬：ATM 轉帳 */}
                    {formData.country === "TW" && (
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
                          <Landmark size={16} />{" "}
                          {t("checkout.atmTransfer", "ATM 虛擬帳號轉帳")}
                        </span>
                      </label>
                    )}

                    {/* 國外專屬：Apple Pay / Google Pay */}
                    {formData.country !== "TW" && (
                      <>
                        <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="PAYPAL"
                            checked={formData.paymentMethod === "PAYPAL"}
                            onChange={handleChange}
                            className="accent-black"
                          />
                          <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Globe size={16} /> PayPal
                          </span>
                        </label>

                        {/* 當選中 PayPal 時，顯示 PayPal 官方按鈕 */}
                        {formData.paymentMethod === "PAYPAL" && (
                          <div className="p-5 bg-gray-50 text-center">
                            <div className="max-w-[300px] mx-auto mt-2 relative z-0">
                              <PayPalButtons
                                style={{ layout: "horizontal", height: 40 }}
                                // 🔥 1. 點擊前的「防呆驗證」
                                onClick={(data, actions) => {
                                  // 檢查是否所有必填欄位都有值
                                  const isFormIncomplete =
                                    !formData.name ||
                                    !formData.email ||
                                    !formData.phone ||
                                    !formData.city ||
                                    !formData.street ||
                                    (formData.country === "TW" &&
                                      !formData.district);

                                  if (isFormIncomplete) {
                                    alert(
                                      t(
                                        "checkout.alert.fillInfo",
                                        "請先填寫上方完整的收件資訊！",
                                      ),
                                    );
                                    return actions.reject(); // ❌ 阻止 PayPal 視窗彈出
                                  }
                                  return actions.resolve(); // ✅ 允許彈出
                                }}
                                // 🔥 2. 告訴 PayPal 這筆訂單要付多少錢
                                createOrder={(data, actions) => {
                                  // 確保金額大於 0 且絕對不能有小數點 (Math.round)
                                  const finalAmount = Math.max(
                                    1,
                                    Math.round(total),
                                  ).toString();

                                  return actions.order.create({
                                    purchase_units: [
                                      {
                                        amount: {
                                          currency_code: "TWD",
                                          value: finalAmount,
                                        },
                                      },
                                    ],
                                  });
                                }}
                                // 🔥 3. 客人授權付款成功後的動作
                                onApprove={async (data, actions) => {
                                  try {
                                    // 執行扣款
                                    const details =
                                      await actions.order.capture();
                                    console.log("✅ PayPal 交易成功:", details);

                                    alert(
                                      t(
                                        "checkout.alert.paymentSuccess",
                                        `付款成功！感謝您，${details.payer.name.given_name}`,
                                      ),
                                    );

                                    // TODO: 這裡你可以呼叫你的 executeCheckout，並把 details.id 傳給後端建立 Medusa 訂單
                                    // executeCheckout(details.id);
                                  } catch (error) {
                                    console.error("❌ PayPal 扣款失敗:", error);
                                    alert(
                                      t(
                                        "checkout.alert.paymentFailed",
                                        "付款失敗，請重新嘗試",
                                      ),
                                    );
                                  }
                                }}
                                // 4. 錯誤捕捉
                                onError={(err) => {
                                  console.error("❌ PayPal 發生錯誤:", err);
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-4 tracking-widest">
                              Powered by PayPal Express Checkout
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {/* 國外專屬：PayPal */}
                    {formData.country !== "TW" && (
                      <>
                        <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="PAYPAL"
                            checked={formData.paymentMethod === "PAYPAL"}
                            onChange={handleChange}
                            className="accent-black"
                          />
                          <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <Globe size={16} /> PayPal
                          </span>
                        </label>
                        {formData.paymentMethod === "PAYPAL" && (
                          <div className="p-5 bg-gray-50 text-center">
                            <div className="max-w-[300px] mx-auto mt-2 relative z-0">
                              <PayPalButtons
                                style={{ layout: "horizontal", height: 40 }}
                                // 1. 告訴 PayPal 這筆訂單要付多少錢
                                createOrder={(data, actions) => {
                                  return actions.order.create({
                                    purchase_units: [
                                      {
                                        amount: {
                                          currency_code: "TWD",
                                          // 🔥 絕對不能有小數點！用 Math.round 確保是整數轉字串
                                          value: Math.round(total).toString(),
                                        },
                                      },
                                    ],
                                  });
                                }}
                                // 2. 客人授權付款成功後的動作
                                onApprove={async (data, actions) => {
                                  try {
                                    // 執行扣款
                                    const details =
                                      await actions.order.capture();
                                    console.log("✅ PayPal 交易成功:", details);

                                    // 將 PayPal 的交易 ID 當作憑證 (Prime) 丟給你的結帳邏輯
                                    // 如果你的 executeCheckout 有針對 PayPal 調整，這一步就能完成訂單
                                    // executeCheckout(details.id);

                                    alert(
                                      t(
                                        "checkout.alert.paymentSuccess",
                                        `付款成功！感謝您，${details.payer.name.given_name}`,
                                      ),
                                    );

                                    // 成功後可跳轉
                                    // router.push("/member");
                                  } catch (error) {
                                    console.error("❌ PayPal 扣款失敗:", error);
                                    alert(
                                      t(
                                        "checkout.alert.paymentFailed",
                                        "付款失敗，請重新嘗試",
                                      ),
                                    );
                                  }
                                }}
                                // 3. 錯誤捕捉
                                onError={(err) => {
                                  console.error("❌ PayPal 按鈕錯誤:", err);
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-4 tracking-widest">
                              Powered by PayPal Express Checkout
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {formData.paymentMethod !== "PAYPAL" && (
                    <button
                      type="button"
                      onClick={executeCheckout}
                      disabled={loading || isProcessing.current}
                      className={`w-full bg-black text-white py-6 text-[11px] font-bold uppercase tracking-[0.4em] mt-10 hover:bg-[#ef4628] transition-all duration-500 shadow-xl ${loading || isProcessing.current ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {loading || isProcessing.current
                        ? t("checkout.processing", "PROCESSING...")
                        : t("checkout.completePurchase", "COMPLETE PURCHASE")}
                    </button>
                  )}
                </section>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[45%] bg-[#fafafa] px-6 py-10 lg:px-14 lg:py-20 border-l border-gray-100 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <div className="max-w-[400px] mx-auto lg:mx-0">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-gray-200 pb-2">
                {t("checkout.orderSummary", "ORDER SUMMARY")}
              </h2>
              <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
                <span className="text-sm uppercase tracking-widest mt-1">
                  {t("checkout.total", "TOTAL")}
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
