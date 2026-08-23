/** TapPay 行動支付（Apple Pay / Google Pay / Samsung Pay） */

export const WALLET_PAYMENT_METHODS = [
  "APPLE_PAY",
  "GOOGLE_PAY",
  "SAMSUNG_PAY",
];

export function isWalletPaymentMethod(method) {
  return WALLET_PAYMENT_METHODS.includes(method);
}

function amountString(amountTwd) {
  return String(Math.round(Number(amountTwd) || 0));
}

/**
 * 預先設定 Payment Request（可在 useEffect 呼叫）。
 * Apple Pay 必須在 click 當下只呼叫 getPrime，不可在 click 裡才 setup。
 */
export function setupWalletPaymentRequest(TPDirect, method, amountTwd) {
  if (!TPDirect) {
    return Promise.reject(new Error("付款元件尚未載入，請稍候再試"));
  }

  const amountValue = amountString(amountTwd);
  if (!amountValue || amountValue === "0") {
    return Promise.reject(new Error("訂單金額異常，請重新整理後再試"));
  }

  if (method === "SAMSUNG_PAY") {
    if (!TPDirect.samsungPay) {
      return Promise.reject(new Error("此環境不支援 Samsung Pay"));
    }
    TPDirect.samsungPay.setup({ country_code: "tw" });
    TPDirect.samsungPay.setupPaymentRequest({
      supportedNetworks: ["VISA", "MASTERCARD", "JCB", "AMEX"],
      total: {
        label: "KÉSH de¹",
        amount: { currency: "TWD", value: amountValue },
      },
    });
    return Promise.resolve({ ready: true, method });
  }

  if (!TPDirect.paymentRequestApi) {
    return Promise.reject(new Error("此瀏覽器不支援行動支付"));
  }

  if (
    typeof TPDirect.paymentRequestApi.checkAvailability === "function" &&
    !TPDirect.paymentRequestApi.checkAvailability()
  ) {
    return Promise.reject(new Error("此裝置或瀏覽器不支援此付款方式"));
  }

  if (method === "APPLE_PAY") {
    const merchantId = process.env.NEXT_PUBLIC_TAPPAY_APPLE_MERCHANT_ID;
    if (!merchantId) {
      return Promise.reject(
        new Error(
          "尚未設定 Apple Pay Merchant ID，請於 TapPay Portal 啟用並設定 NEXT_PUBLIC_TAPPAY_APPLE_MERCHANT_ID",
        ),
      );
    }
    TPDirect.paymentRequestApi.setupApplePay({
      merchantIdentifier: merchantId,
      countryCode: "TW",
    });
  } else if (method === "GOOGLE_PAY") {
    TPDirect.paymentRequestApi.setupPayWithGoogle({
      allowedPaymentMethods: ["CARD", "TOKENIZED_CARD"],
      allowPrepaidCards: true,
      billingAddressRequired: false,
      billingAddressFormat: "MIN",
      allowedCountryCodes: ["TW"],
    });
  } else {
    return Promise.reject(new Error("不支援的付款方式"));
  }

  const supportedMethods =
    method === "APPLE_PAY" ? ["apple_pay"] : ["pay_with_google"];

  const paymentRequest = {
    supportedNetworks: ["AMEX", "MASTERCARD", "VISA", "JCB"],
    supportedMethods,
    displayItems: [
      {
        label: "KÉSH de¹ Order",
        amount: { currency: "TWD", value: amountValue },
      },
    ],
    total: {
      label: "KÉSH de¹",
      amount: { currency: "TWD", value: amountValue },
    },
    options: {
      requestPayerEmail: false,
      requestPayerName: false,
      requestPayerPhone: false,
      requestShipping: false,
    },
  };

  return new Promise((resolve, reject) => {
    TPDirect.paymentRequestApi.setupPaymentRequest(
      paymentRequest,
      (setupResult) => {
        if (!setupResult?.browserSupportPaymentRequest) {
          reject(
            new Error(
              method === "APPLE_PAY"
                ? "此裝置不支援 Apple Pay（請使用 Safari 或已設定錢包的 iPhone / Mac）"
                : "此裝置或瀏覽器不支援 Google Pay",
            ),
          );
          return;
        }
        resolve({
          ready: true,
          method,
          canMakePaymentWithActiveCard: !!setupResult.canMakePaymentWithActiveCard,
        });
      },
    );
  });
}

/** 僅在使用者 click 事件中呼叫 */
export function getWalletPrime(TPDirect, method) {
  if (!TPDirect) {
    return Promise.reject(new Error("付款元件尚未載入，請稍候再試"));
  }

  if (method === "SAMSUNG_PAY") {
    return new Promise((resolve, reject) => {
      TPDirect.samsungPay.getPrime((result) => {
        if (!result || result.status !== 0 || !result.prime) {
          reject(new Error(result?.msg || "Samsung Pay 授權失敗"));
          return;
        }
        resolve(result.prime);
      });
    });
  }

  return new Promise((resolve, reject) => {
    TPDirect.paymentRequestApi.getPrime((result) => {
      if (!result || result.status !== 0 || !result.prime) {
        reject(new Error(result?.msg || "無法取得付款授權"));
        return;
      }
      resolve(result.prime);
    });
  });
}
