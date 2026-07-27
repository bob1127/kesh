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
  Globe,
} from "lucide-react";
import { LINE_OFFICIAL_URL } from "@/lib/social-links";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import Image from "next/image";

// 🔥 引入全球國家、州、城市資料庫套件
import { State, City } from "country-state-city";
// 🔥 引入全域統一的價格計算工具
import { getCorrectAmount } from "@/lib/price";
import { resolveTwPostalCode } from "@/lib/tw-postal-code";
import {
  MEDUSA_BACKEND_URL,
  getMedusaStoreHeaders,
} from "@/lib/medusa-store";

// ==========================================
// 內建台灣縣市區域資料庫
// ==========================================
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
    "左营區",
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

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { userInfo } = useUser();
  const router = useRouter();
  const { t } = useTranslation("common");

  const defaultCountry =
    router.locale === "en" ? "US" : router.locale === "ko" ? "KR" : "TW";

  // 🌍 智慧幣別與語系判斷引擎
  const currentLang = router.locale || "zh-TW";
  const targetCurrency =
    router.locale === "en" ? "usd" : router.locale === "ko" ? "krw" : "twd";
  const symbol =
    targetCurrency === "usd" ? "$ " : targetCurrency === "krw" ? "₩ " : "NT$ ";
  const metaLang = router.locale === "zh-TW" ? "zh" : router.locale;

  const [loading, setLoading] = useState(false);
  const [isCompletingPayment, setIsCompletingPayment] = useState(false);
  const isProcessing = useRef(false);
  const isTapPaySetup = useRef(false);
  const medusaCartRef = useRef(null); // 紀錄剛建好的購物車 ID

  const [exchangeRate, setExchangeRate] = useState(1350);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: defaultCountry,
    city: "",
    district: "",
    street: "",
    remark: "",
    paymentMethod: defaultCountry === "TW" ? "CREDIT_CARD" : "PAYPAL",
  });

  // 強制語系重整機制
  const initialLocaleRef = useRef(router.locale);
  useEffect(() => {
    if (initialLocaleRef.current !== router.locale) {
      window.location.reload();
    }
  }, [router.locale]);

  // TapPay 3D 驗證完成後會導回 /checkout?status=0&order_number=...
  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;

    const status = router.query.status;
    const orderNumber = router.query.order_number;
    const pendingRaw = sessionStorage.getItem("tappay_pending_checkout");

    const finishSuccess = (displayId) => {
      setIsCompletingPayment(true);
      clearCart?.();
      sessionStorage.removeItem("tappay_pending_checkout");
      localStorage.removeItem("shopping-cart");
      const q = displayId
        ? `?orderId=${encodeURIComponent(displayId)}&stage=processing`
        : "?stage=processing";
      router.replace(`/thankyou${q}`);
    };

    // TapPay 導回：status=0 表示付款成功
    if (status !== undefined && String(status) === "0") {
      let displayId = "";
      try {
        const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
        displayId = pending?.displayId || "";
      } catch {
        /* ignore */
      }
      finishSuccess(displayId);
      return;
    }

    // status 有值但非 0：3D 驗證失敗，清掉 pending 並提示
    if (status !== undefined && String(status) !== "0") {
      sessionStorage.removeItem("tappay_pending_checkout");
      alert(
        t(
          "checkout.alert.paymentFailed",
          "付款驗證未完成或失敗，請重新嘗試。",
        ),
      );
      router.replace("/checkout", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.status, router.query.order_number, clearCart, router, t]);

  // 動態抓取匯率 (不論預設是否為 KRW，只要選了韓國就提早準備)
  useEffect(() => {
    if (formData.country === "KR" || defaultCountry === "KR") {
      const fetchRate = async () => {
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/USD");
          const data = await res.json();
          if (data.rates && data.rates.KRW) setExchangeRate(data.rates.KRW);
        } catch (error) {
          console.warn("⚠️ 匯率 API 抓取失敗", error);
        }
      };
      fetchRate();
    }
  }, [formData.country, defaultCountry]);

  const availableStates = useMemo(() => {
    if (formData.country === "TW") return [];
    return State.getStatesOfCountry(formData.country);
  }, [formData.country]);

  const availableCities = useMemo(() => {
    if (formData.country === "TW" || !formData.city) return [];
    return City.getCitiesOfState(formData.country, formData.city);
  }, [formData.country, formData.city]);

  const totalWeight = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const weight = item.variant?.weight || item.weight || 0;
      return acc + weight * item.quantity;
    }, 0);
  }, [cartItems]);

  // 🔥 前端總計顯示用：已改為全面套用 getCorrectAmount 工具
  const total = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const prices = item.prices || item.variant?.prices || [];
      const matchedPrice = prices.find(
        (p) => p.currency_code?.toLowerCase() === targetCurrency,
      );

      let currentRawPrice = 0;
      if (matchedPrice) {
        currentRawPrice = getCorrectAmount(
          matchedPrice.amount,
          matchedPrice.currency_code,
        );
      } else {
        currentRawPrice = item.rawPrice
          ? item.rawPrice
          : parseInt((item.price || "").toString().replace(/[^\d]/g, ""), 10) ||
            0;
      }
      return acc + currentRawPrice * item.quantity;
    }, 0);
  }, [cartItems, targetCurrency]);

  // 🔥 運費顯示計算：統一美金邏輯，韓國則自動乘上即時匯率
  const shippingInfo = useMemo(() => {
    if (formData.country === "TW")
      return {
        cost: 0,
        name: t("checkout.shippingDelivery", "宅配到府 (順豐速運)"),
        currency: "TWD",
        sign: "NT$",
      };

    // 決定 DHL 的基礎美金定價與名稱
    let usdCost = 45;
    let tierName = "DHL Express (0-0.5kg)";
    if (totalWeight > 500 && totalWeight <= 1500) {
      usdCost = 65;
      tierName = "DHL Express (0.5-1.5kg)";
    } else if (totalWeight > 1500) {
      usdCost = 90;
      tierName = "DHL Express (1.5-3kg)";
    }

    if (formData.country === "KR") {
      return {
        cost: Math.round(usdCost * exchangeRate),
        name: tierName,
        currency: "KRW",
        sign: "₩",
      };
    }

    // 預設 (包含 US 等全球其他地區)
    return {
      cost: usdCost,
      name: tierName,
      currency: "USD",
      sign: "$",
    };
  }, [formData.country, totalWeight, t, exchangeRate]);

  useEffect(() => {
    if (defaultCountry !== "TW") {
      setFormData((prev) => ({
        ...prev,
        country: defaultCountry,
        city: "",
        district: "",
        street: "",
        paymentMethod: "PAYPAL",
      }));
    }
  }, [defaultCountry]);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.TPDirect) {
      const script = document.createElement("script");
      script.src = "https://js.tappaysdk.com/sdk/tpdirect/v5.19.2";
      script.async = true;
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
            process.env.NEXT_PUBLIC_TAPPAY_ENV || "production",
          );
          isTapPaySetup.current = true;
        }
        if (
          formData.paymentMethod === "CREDIT_CARD" &&
          formData.country === "TW"
        ) {
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
  }, [formData.paymentMethod, formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "country") {
        let resetPayment = value === "TW" ? "CREDIT_CARD" : "PAYPAL";
        return {
          ...prev,
          country: value,
          city: "",
          district: "",
          paymentMethod: resetPayment,
        };
      }
      if (name === "city") {
        return { ...prev, [name]: value, district: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  // ==========================================
  // 🚨 資安核心重構：先建立 Medusa 購物車，不信任前端加法
  // ==========================================
  const prepareMedusaCart = async () => {
    const backendUrl = MEDUSA_BACKEND_URL;
    const headers = getMedusaStoreHeaders();

    const regionRes = await fetch(`${backendUrl}/store/regions`, { headers });
    const regionData = await regionRes.json();
    if (!regionRes.ok) {
      throw new Error(regionData?.message || "無法取得配送地區，請稍後再試。");
    }

    const regions = regionData.regions;
    if (!regions?.length) {
      throw new Error("商店尚未設定配送地區，請聯絡客服。");
    }

    const targetRegion =
      regions.find((r) =>
        r.countries.some((c) => c.iso_2 === formData.country.toLowerCase()),
      ) || regions[0];

    const stateName =
      formData.country === "TW"
        ? formData.city
        : State.getStateByCodeAndCountry(formData.city, formData.country)
            ?.name || formData.city;

    const twPostal =
      formData.country === "TW"
        ? resolveTwPostalCode({
            province: stateName,
            city: formData.district,
            country_code: "tw",
          })
        : undefined;

    // 1. 建立購物車與填入地址
    const cartRes = await fetch(`${backendUrl}/store/carts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        region_id: targetRegion.id,
        email: formData.email,
        metadata: {
          payment_method: formData.paymentMethod,
          remark: formData.remark,
        },
        shipping_address: {
          first_name: formData.name,
          phone: formData.phone,
          province: stateName,
          city: formData.district,
          address_1: formData.street,
          country_code: formData.country.toLowerCase(),
          ...(twPostal ? { postal_code: twPostal } : {}),
        },
      }),
    });
    const cartData = await cartRes.json();
    if (!cartRes.ok || !cartData?.cart?.id) {
      throw new Error(
        cartData?.message ||
          "無法建立購物車，請確認填寫資料是否完整後再試。",
      );
    }
    const cartId = cartData.cart.id;

    // 2. 塞入商品 (防禦缺貨幽靈訂單)
    for (const item of cartItems) {
      const currentVariantId = item.variantId || item.variant_id;
      if (!currentVariantId) throw new Error(`商品「${item.title}」資料異常`);

      const lineItemRes = await fetch(
        `${backendUrl}/store/carts/${cartId}/line-items`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            variant_id: currentVariantId,
            quantity: item.quantity,
          }),
        },
      );

      if (!lineItemRes.ok) {
        const errData = await lineItemRes.json();
        throw new Error(
          `商品「${item.title}」無法結帳。\n原因：${errData.message || "可能庫存不足"}`,
        );
      }
    }

    // 3. 設定物流
    const shipOptRes = await fetch(
      `${backendUrl}/store/shipping-options?cart_id=${cartId}`,
      { headers },
    );
    const shipOptData = await shipOptRes.json();
    if (shipOptData.shipping_options?.length > 0) {
      const matchedOption = shipOptData.shipping_options.find(
        (opt) => opt.name === shippingInfo.name,
      );
      const selectedOptionId = matchedOption
        ? matchedOption.id
        : shipOptData.shipping_options[0].id;
      await fetch(`${backendUrl}/store/carts/${cartId}/shipping-methods`, {
        method: "POST",
        headers,
        body: JSON.stringify({ option_id: selectedOptionId }),
      });
    }

    // 4. 返回完整購物車資訊 (包含權威級的官方總計)
    const finalCartRes = await fetch(`${backendUrl}/store/carts/${cartId}`, {
      headers,
    });
    const finalCartData = await finalCartRes.json();

    return finalCartData.cart;
  };

  // ==========================================
  // 後端安全結帳呼叫 (TapPay / PayPal 驗證)
  // ==========================================
  const executeCheckout = async (
    paypalOrderId = null,
    preCreatedCartId = null,
  ) => {
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
      setLoading(true);
      let prime = "";
      const TPDirect = window.TPDirect;

      // TapPay 必須在建立購物車前先驗證卡片
      if (formData.paymentMethod === "CREDIT_CARD") {
        if (TPDirect.card.getTappayFieldsStatus().canGetPrime === false)
          throw new Error(t("checkout.alert.cardError", "信用卡資訊有誤"));
        prime = await new Promise((resolve, reject) =>
          TPDirect.card.getPrime((res) =>
            res.status === 0
              ? resolve(res.card.prime)
              : reject(new Error(res.msg)),
          ),
        );
      } else if (formData.paymentMethod === "ATM") {
        prime = await new Promise((resolve, reject) =>
          TPDirect.virtualAccount.getPrime((error, result) => {
            if (error) return reject(new Error(error.msg || "虛擬帳號初始化失敗"));
            if (!result || result.status !== 0 || !result.prime) {
              return reject(
                new Error(result?.msg || "無法取得 ATM 付款授權，請稍後再試"),
              );
            }
            resolve(result.prime);
          }),
        );
      } else if (formData.paymentMethod === "PAYPAL") {
        prime = paypalOrderId;
      }

      // 如果還沒有購物車 (TapPay 流程)，此時建立
      let cartId = preCreatedCartId;
      if (!cartId) {
        const cart = await prepareMedusaCart();
        cartId = cart.id;
      }

      const backendUrl = MEDUSA_BACKEND_URL;
      const headers = getMedusaStoreHeaders();

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
        throw new Error(completeData?.message || "結帳 API 處理失敗");

      if (completeData.bank_code && completeData.vaccount) {
        const atmDisplayId =
          completeData.order?.display_id || completeData.display_id || "";
        const atmPayload = {
          bankCode: completeData.bank_code,
          vAccount: completeData.vaccount,
          expireDate: completeData.expire_date,
          orderId: atmDisplayId,
        };
        try {
          sessionStorage.setItem(
            "kesh_atm_checkout",
            JSON.stringify(atmPayload),
          );
        } catch {
          /* ignore */
        }
        localStorage.removeItem("shopping-cart");
        clearCart?.();
        setIsCompletingPayment(true);
        router.push(
          atmDisplayId
            ? `/thankyou?orderId=${encodeURIComponent(atmDisplayId)}&method=ATM&stage=unpaid`
            : "/thankyou?method=ATM&stage=unpaid",
        );
        return;
      }

      const paymentUrl =
        completeData.order?.payments?.[0]?.data?.payment_url ||
        completeData.payment_url;

      const displayId =
        completeData.order?.display_id ||
        completeData.display_id ||
        "";

      // 需要 3D 驗證：先記下訂單資訊，完成後由 redirect 回 /checkout 再轉 thankyou
      if (paymentUrl) {
        sessionStorage.setItem(
          "tappay_pending_checkout",
          JSON.stringify({
            displayId,
            cartId,
            createdAt: Date.now(),
          }),
        );
        window.location.href = paymentUrl;
        return;
      }

      // 直接付款成功（無需 3D）
      setIsCompletingPayment(true);
      clearCart?.();
      localStorage.removeItem("shopping-cart");
      sessionStorage.removeItem("tappay_pending_checkout");
      router.push(
        displayId
          ? `/thankyou?orderId=${encodeURIComponent(displayId)}&stage=processing`
          : "/thankyou?stage=processing",
      );
    } catch (err) {
      console.error("❌ Checkout 致命錯誤:", err);
      alert(`錯誤：\n${err.message}`);
    } finally {
      isProcessing.current = false;
      setLoading(false);
    }
  };

  if (isCompletingPayment) {
    return (
      <div className="p-32 text-center text-gray-400 tracking-widest uppercase text-xs">
        {t("checkout.processing", "處理中...")}
      </div>
    );
  }

  if (cartItems.length === 0)
    return (
      <div className="p-32 text-center text-gray-400">
        {t("checkout.emptyBag", "BAG IS EMPTY")}
      </div>
    );

  const isKRW = shippingInfo.currency === "KRW";
  const paypalCurrency = isKRW ? "USD" : shippingInfo.currency;

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb",
        currency: paypalCurrency,
        intent: "capture",
        components: "buttons,applepay,googlepay",
      }}
    >
      <div className="min-h-screen bg-white text-black pt-16">
        <div className="flex flex-col-reverse lg:flex-row">
          {/* 左側：填寫資料與付款區塊 */}
          <div className="w-full lg:w-[55%] px-6 py-10 lg:px-20 lg:py-16">
            <div className="max-w-[700px] mx-auto">
              <Link
                href="/cart"
                className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-10 hover:text-black transition-colors"
              >
                <ChevronLeft size={14} className="mr-1" />{" "}
                {t("checkout.backToBag", "Back to bag")}
              </Link>
              <h1 className="text-3xl font-light tracking-tight uppercase mb-12">
                {t("checkout.title", "CHECKOUT")}
              </h1>

              <div className="space-y-14">
                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-3 border-b border-gray-100 pb-2">
                    {t("checkout.customerInfo", "Customer Information")}
                  </h2>
                  <div className="mb-6 px-3 py-2 inline-block rounded-sm  ">
                    <p className="text-sm text-black font-bold tracking-wide">
                      {t(
                        "checkout.securityNotice",
                        "為確保配送與保價安全，請填寫正確完整資料",
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="name"
                        placeholder={t(
                          "checkout.fullNamePlaceholder",
                          "請填寫收件人完整姓名 (需與證件相符)",
                        )}
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-200 p-4 text-sm outline-none focus:border-black"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="email"
                        name="email"
                        placeholder={t(
                          "checkout.emailPlaceholder",
                          "電子信箱 (必填)",
                        )}
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-200 p-4 text-sm outline-none focus:border-black"
                      />
                      <p className="text-xs text-[#b2b2b2] font-medium mt-1.5 px-1">
                        {t(
                          "checkout.emailUsage",
                          "用途：訂單通知 / 出貨通知 / 驗證",
                        )}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="tel"
                        name="phone"
                        placeholder={t(
                          "checkout.phonePlaceholder",
                          "聯絡電話 (必填) 例：0912-345-678",
                        )}
                        className="w-full border border-gray-200 p-4 text-sm outline-none focus:border-black"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="md:col-span-2 border border-gray-200 p-4 text-sm outline-none focus:border-black bg-white text-black"
                    >
                      <option value="TW">
                        {t("checkout.countryTW", "Taiwan (台灣)")}
                      </option>
                      <option value="US">
                        {t("checkout.countryUS", "United States (美國)")}
                      </option>
                      <option value="KR">
                        {t("checkout.countryKR", "South Korea (韓國)")}
                      </option>
                    </select>

                    {formData.country === "TW" ? (
                      <>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="border border-gray-200 p-4 text-sm outline-none focus:border-black bg-white"
                        >
                          <option value="" disabled>
                            {t("checkout.selectCity", "選擇縣市")}
                          </option>
                          {Object.keys(TAIWAN_CITIES).map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          disabled={!formData.city}
                          className={`border border-gray-200 p-4 text-sm outline-none focus:border-black ${!formData.city ? "bg-gray-50 text-gray-400" : "bg-white"}`}
                        >
                          <option value="" disabled>
                            {t("checkout.selectDistrict", "選擇區域")}
                          </option>
                          {formData.city &&
                            TAIWAN_CITIES[formData.city].map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                        </select>
                      </>
                    ) : (
                      <>
                        {availableStates.length > 0 ? (
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="border border-gray-200 p-4 text-sm outline-none focus:border-black bg-white"
                          >
                            <option value="" disabled>
                              {t(
                                "checkout.stateProvince",
                                "State / Province (州 / 省)",
                              )}
                            </option>
                            {availableStates.map((state) => (
                              <option key={state.isoCode} value={state.isoCode}>
                                {state.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            name="city"
                            placeholder={t(
                              "checkout.stateProvince",
                              "State / Province",
                            )}
                            className="border border-gray-200 p-4 text-sm outline-none focus:border-black"
                            value={formData.city}
                            onChange={handleChange}
                          />
                        )}

                        {availableCities.length > 0 ? (
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            disabled={!formData.city}
                            className={`border border-gray-200 p-4 text-sm outline-none focus:border-black ${!formData.city ? "bg-gray-50 text-gray-400" : "bg-white"}`}
                          >
                            <option value="" disabled>
                              {t("checkout.city", "City (城市)")}
                            </option>
                            {availableCities.map((city) => (
                              <option key={city.name} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            name="district"
                            placeholder={t("checkout.city", "City")}
                            className={`border border-gray-200 p-4 text-sm outline-none focus:border-black ${!formData.city && availableStates.length > 0 ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
                            value={formData.district}
                            onChange={handleChange}
                            disabled={
                              !formData.city && availableStates.length > 0
                            }
                          />
                        )}
                      </>
                    )}

                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="street"
                        placeholder={t(
                          "checkout.streetPlaceholder",
                          "詳細地址 (必填) 請填寫完整地址 (門牌、樓層、公司名稱)",
                        )}
                        className="w-full border border-gray-200 p-4 text-sm outline-none focus:border-black"
                        value={formData.street}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="md:col-span-2 mt-2">
                      <textarea
                        name="remark"
                        placeholder={t(
                          "checkout.remarkPlaceholder",
                          "備註欄位 (如：指定收件時間、禮物包裝、低調出貨、報關需求)",
                        )}
                        className="w-full border border-gray-200 p-4 text-sm outline-none focus:border-black resize-none h-24"
                        value={formData.remark}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-3 border-b border-gray-100 pb-2">
                    {t("checkout.shippingMethod", "Shipping Method")}
                  </h2>
                  <p className="text-[13px] font-bold mb-4">
                    {t(
                      "checkout.shippingSecurityDesc",
                      "您的訂單將由 KÉSH 專業團隊全程處理，確保安全與隱私",
                    )}
                  </p>
                  <div className="border border-gray-200">
                    <label className="flex flex-col p-6 bg-gray-50 cursor-default">
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          checked
                          readOnly
                          className="accent-black"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <Truck size={14} />
                          {shippingInfo.name} (+{shippingInfo.sign}{" "}
                          {shippingInfo.cost.toLocaleString()})
                        </p>
                      </div>
                      <div className="mt-3 ml-7 text-[#575757] text-[12px] px-3 py-1.5 font-bold w-fit rounded-sm tracking-wide">
                        {t(
                          "checkout.shippingProtection",
                          "商品將以專業防護包裝寄出，並提供完整物流追蹤",
                        )}
                      </div>
                    </label>
                  </div>
                </section>

                <section>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-3 border-b border-gray-100 pb-2">
                    {t("checkout.payment", "Payment")}
                  </h2>
                  <p className="text-[12px] text-gray-700 font-bold mb-4 leading-relaxed">
                    {formData.country === "TW" ? (
                      <>
                        {t(
                          "checkout.paymentSecurity1",
                          "您的付款將透過 TapPay 國際級加密機制安全處理",
                        )}
                        <br />
                        <span className="text-black bg-yellow-100 px-1">
                          {t(
                            "checkout.paymentSecurity2",
                            "信用卡資料由金流服務商代為處理，本網站不會儲存您的完整卡片資訊",
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        {t(
                          "checkout.paypalSecurity1",
                          "Payments are processed securely via PayPal.",
                        )}
                        <br />
                        <span className="text-black bg-yellow-100 px-1">
                          {t(
                            "checkout.paypalSecurity2",
                            "Card and wallet payments are handled by PayPal; we never store your payment credentials.",
                          )}
                        </span>
                      </>
                    )}
                  </p>
                  {formData.country === "TW" && (
                    <div className="mb-4 border border-gray-200 bg-gray-50 px-4 py-3 text-[12px] leading-relaxed text-gray-700">
                      <p className="font-bold">
                        {t(
                          "checkout.paymentLimitNoticeTitle",
                          "為符合台灣金流及交易規範：",
                        )}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        <li>
                          {t(
                            "checkout.paymentLimitCreditCard",
                            "信用卡單筆交易金額最高為 NT$199,999",
                          )}
                        </li>
                        <li>
                          {t(
                            "checkout.paymentLimitAtm",
                            "銀行轉帳單筆交易金額最高為 NT$49,999",
                          )}
                        </li>
                      </ul>
                      <p className="mt-2">
                        {t(
                          "checkout.paymentLimitContactBefore",
                          "若訂單金額超過上述限制，",
                        )}
                        <a
                          href={LINE_OFFICIAL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#06C755] font-semibold underline underline-offset-2 hover:text-[#05a847] transition-colors"
                        >
                          {t(
                            "checkout.paymentLimitContactLink",
                            "請聯繫客服",
                          )}
                        </a>
                        {t(
                          "checkout.paymentLimitContactAfter",
                          "協助安排付款方式。",
                        )}
                      </p>
                    </div>
                  )}
                  <div className="border border-gray-200 divide-y divide-gray-100">
                    {formData.country === "TW" ? (
                      <>
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
                            <CreditCard size={16} />{" "}
                            {t("checkout.creditCard", "信用卡付款")}
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
                            <Landmark size={16} />{" "}
                            {t(
                              "checkout.atmTransfer",
                              "銀行轉帳 (ATM / Virtual Account Transfer)",
                            )}
                          </span>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="pt-0.5">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="PAYPAL"
                              checked={formData.paymentMethod === "PAYPAL"}
                              onChange={handleChange}
                              className="accent-black"
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                              <Globe size={16} />{" "}
                              {t(
                                "checkout.paypal",
                                "PayPal / Apple Pay / Google Pay",
                              )}
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              <img
                                src="/images/svg/paypal-svgrepo-com.svg"
                                alt="PayPal"
                                className="h-6 w-auto"
                              />
                              <img
                                src="/images/svg/visa-svgrepo-com.svg"
                                alt="Visa"
                                className="h-6 w-auto"
                              />
                              <img
                                src="/images/svg/mastercard-svgrepo-com.svg"
                                alt="Mastercard"
                                className="h-6 w-auto"
                              />
                              <img
                                src="/images/svg/amex-3-svgrepo-com.svg"
                                alt="Amex"
                                className="h-6 w-auto"
                              />
                              <img
                                src="/images/svg/jcb-3-svgrepo-com.svg"
                                alt="JCB"
                                className="h-6 w-auto"
                              />
                              <img
                                src="/images/svg/apple-pay-svgrepo-com.svg"
                                alt="Apple Pay"
                                className="h-6 w-auto"
                              />
                              <img
                                src="/images/svg/google-pay-svgrepo-com.svg"
                                alt="Google Pay"
                                className="h-6 w-auto"
                              />
                            </div>
                          </div>
                        </label>

                        {formData.paymentMethod === "PAYPAL" && (
                          <div className="p-5 bg-gray-50 text-center">
                            <div className="max-w-[300px] mx-auto mt-2 relative z-0">
                              <PayPalButtons
                                style={{ layout: "horizontal", height: 40 }}
                                onClick={(data, actions) => {
                                  if (
                                    !formData.name ||
                                    !formData.email ||
                                    !formData.phone ||
                                    !formData.city ||
                                    !formData.street
                                  ) {
                                    alert(t("checkout.alert.fillInfo"));
                                    return actions.reject();
                                  }
                                  return actions.resolve();
                                }}
                                // 🔥 安全升級：先在 Medusa 建立訂單取得官方金額，才允許 PayPal 扣款
                                createOrder={async (data, actions) => {
                                  if (isProcessing.current)
                                    return actions.reject();
                                  isProcessing.current = true;

                                  try {
                                    const cart = await prepareMedusaCart();
                                    medusaCartRef.current = cart.id;

                                    // 取出後端官方總計金額 (例如 342574)
                                    let finalAmountValue = getCorrectAmount(
                                      cart.total,
                                      cart.region.currency_code,
                                    );

                                    // 跨幣別轉換 (如 KRW -> USD給PayPal扣款)
                                    if (isKRW) {
                                      finalAmountValue = (
                                        finalAmountValue / exchangeRate
                                      ).toFixed(2);
                                    } else {
                                      finalAmountValue =
                                        finalAmountValue.toFixed(2);
                                    }

                                    return actions.order.create({
                                      purchase_units: [
                                        {
                                          amount: {
                                            currency_code: paypalCurrency,
                                            value: finalAmountValue,
                                          },
                                          description: `KÉSH de¹ Order (Cart: ${cart.id})`,
                                        },
                                      ],
                                    });
                                  } catch (error) {
                                    alert(
                                      error.message ||
                                        "建立購物車失敗，請稍後再試。",
                                    );
                                    isProcessing.current = false;
                                    return actions.reject();
                                  }
                                }}
                                onApprove={async (data, actions) => {
                                  try {
                                    // 將 PayPal OrderID 與剛建好的 Medusa CartID 送給後端雙重驗證
                                    await executeCheckout(
                                      data.orderID,
                                      medusaCartRef.current,
                                    );
                                  } catch (error) {
                                    console.error("PayPal 錯誤:", error);
                                    alert("付款驗證失敗，請重新嘗試");
                                  }
                                }}
                                onCancel={() => {
                                  isProcessing.current = false;
                                }}
                                onError={() => {
                                  isProcessing.current = false;
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {formData.paymentMethod !== "PAYPAL" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isProcessing.current) return;
                        isProcessing.current = true;
                        executeCheckout(null).finally(
                          () => (isProcessing.current = false),
                        );
                      }}
                      disabled={loading || isProcessing.current}
                      className={`w-full bg-black text-white py-6 text-[11px] font-bold uppercase tracking-[0.2em] mt-10 hover:bg-[#ef4628] transition-all duration-500 shadow-xl ${loading || isProcessing.current ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {loading || isProcessing.current
                        ? t("checkout.processing", "PROCESSING...")
                        : t(
                            "checkout.completePurchase",
                            "確認訂單並前往安全付款",
                          )}
                    </button>
                  )}
                </section>
              </div>
            </div>
          </div>

          {/* ======================= */}
          {/* 右側：訂單摘要區塊 */}
          {/* ======================= */}
          <div className="w-full lg:w-[45%] bg-[#fafafa] px-6 py-10 lg:px-14 lg:py-10 border-l border-gray-100 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto">
            <div className="max-w-[400px] mx-auto lg:mx-0">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-gray-200 pb-2">
                {t("checkout.orderSummary", "ORDER SUMMARY")}
              </h2>

              <div className="flex flex-col gap-5 mb-6">
                {cartItems.map((item) => {
                  const itemImage =
                    item.thumbnail ||
                    item.image ||
                    (item.images && item.images[0]) ||
                    "";

                  // 🔥 深層名稱抓取防呆
                  const baseProduct =
                    item.variant?.product || item.product || item;
                  const meta = baseProduct.metadata || item.metadata || {};
                  let displayTitle = meta[`title_${metaLang}`];

                  if (currentLang === "zh-TW" && !displayTitle) {
                    displayTitle =
                      meta["title_zh-TW"] ||
                      meta["title_tw"] ||
                      baseProduct.title;
                  }
                  displayTitle =
                    displayTitle || baseProduct.title || item.title;

                  // 🔥 統一價格計算
                  const prices = item.prices || item.variant?.prices || [];
                  const matchedPrice = prices.find(
                    (p) => p.currency_code?.toLowerCase() === targetCurrency,
                  );

                  let currentRawPrice = 0;
                  if (matchedPrice) {
                    currentRawPrice = getCorrectAmount(
                      matchedPrice.amount,
                      matchedPrice.currency_code,
                    );
                  } else {
                    currentRawPrice = item.rawPrice
                      ? item.rawPrice
                      : parseInt(
                          (item.price || "").toString().replace(/[^\d]/g, ""),
                          10,
                        ) || 0;
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                            {itemImage && (
                              <Image
                                src={itemImage}
                                alt={displayTitle}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            )}
                          </div>
                          <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-col pr-4">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                            {displayTitle}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            Weight: {item.variant?.weight || item.weight || 0}g
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                        {symbol}
                        {Math.round(currentRawPrice).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t("checkout.subtotal", "Subtotal")}</span>
                  <span className="tabular-nums">
                    {symbol} {Math.round(total).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {t("checkout.shipping", "Shipping")} (
                    {t("checkout.totalWeight", "Total Weight")}: {totalWeight}g)
                  </span>
                  <span className="tabular-nums">
                    {symbol} {Math.round(shippingInfo.cost).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100">
                  <span className="text-sm uppercase tracking-widest mt-1">
                    {t("checkout.total", "TOTAL")}
                  </span>
                  <span className="tabular-nums">
                    {symbol}{" "}
                    {Math.round(total + shippingInfo.cost).toLocaleString()}
                  </span>
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
