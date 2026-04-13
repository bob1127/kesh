import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { cartId, formData, invoiceData, amount, items } = req.body;

    const invoice = "12345678"; // 測試統編
    const appKey = "sHeq7t8G1wiQvhAuIM27"; // 測試 App Key
    const apiUrl = "https://invoice-api.amego.tw/json/f0401";

    // 1. 計算稅額 (台灣財政部標準算法：總額 / 1.05 取四捨五入)
    const totalAmount = Math.round(Number(amount) || 0);
    const salesAmount = Math.round(totalAmount / 1.05); // 稅前金額
    const taxAmount = totalAmount - salesAmount;        // 稅額

    // 2. 嚴格格式化商品陣列
    const productItems = (items || []).map(item => {
      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.price) || 0;
      return {
        Description: item.name || "一般商品",
        Quantity: qty,
        UnitPrice: unitPrice,
        Amount: unitPrice * qty,
        Remark: "", // 補上空字串
        TaxType: 1  // 1: 應稅
      };
    });

    // 3. 完美對齊 MIG 4.0 的 JSON 結構
    const dataObj = {
      OrderId: cartId || `TEST_${Date.now()}`,
      BuyerIdentifier: invoiceData?.type === "COMPANY" && invoiceData?.vatNumber ? invoiceData.vatNumber : "0000000000",
      BuyerName: invoiceData?.type === "COMPANY" && invoiceData?.companyTitle ? invoiceData.companyTitle : (formData?.name || "Customer"),
      BuyerAddress: "", 
      BuyerTelephoneNumber: formData?.phone || "0912345678",
      BuyerEmailAddress: formData?.email || "bob@example.com",
      MainRemark: "",   
      
      // 載具資訊
      CarrierType: invoiceData?.type === "PERSONAL" && invoiceData?.carrier === "MOBILE" ? "3J0002" : "",
      CarrierId1: invoiceData?.type === "PERSONAL" && invoiceData?.carrier === "MOBILE" ? (invoiceData?.mobileBarcode || "") : "",
      CarrierId2: invoiceData?.type === "PERSONAL" && invoiceData?.carrier === "MOBILE" ? (invoiceData?.mobileBarcode || "") : "",
      NPOBAN: "",       
      
      PrintDetail: invoiceData?.type === "COMPANY" ? 1 : 0,
      
      ProductItem: productItems,
      SalesAmount: salesAmount,
      FreeTaxSalesAmount: 0,
      ZeroTaxSalesAmount: 0,
      TaxType: 1,
      TaxRate: "0.05",
      TaxAmount: taxAmount,
      TotalAmount: totalAmount
    };

    const dataStr = JSON.stringify(dataObj);
    const time = Math.floor(Date.now() / 1000).toString(); 

    console.log("🧾 準備送給鯨躍的 JSON:", dataStr);

    // 🚨 破案關鍵 1：新的 MD5 公式沒有 invoice 了！
    // 規則：md5(data 轉 json 格式字串 + time + APP Key)
    const hashStr = dataStr + time + appKey;
    const sign = crypto.createHash("md5").update(Buffer.from(hashStr, "utf-8")).digest("hex");

    // 🚨 破案關鍵 2：傳遞參數名稱必須叫做 sign！
    const bodyParams = new URLSearchParams();
    bodyParams.append("invoice", invoice);
    bodyParams.append("data", dataStr); 
    bodyParams.append("time", time);
    bodyParams.append("sign", sign); // 這裡換成 sign 了！

    const amegoRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams.toString()
    });

    const amegoText = await amegoRes.text();
    console.log("🔍 鯨躍原始回傳字串:", amegoText);

    if (amegoText.trim() === "error" || amegoText.trim() === "") {
      throw new Error("發票遭鯨躍拒絕 (回傳 error)");
    }

    let amegoData;
    try {
      amegoData = JSON.parse(amegoText);
      // 根據你貼的文件，成功會回傳 code: 0
      if (amegoData.code !== 0) {
         throw new Error(`鯨躍報錯: ${amegoData.msg}`);
      }
    } catch(e) {
      throw new Error(`API 執行異常: ${e.message || amegoText}`);
    }

    console.log("✅ 鯨躍發票開立成功:", amegoData);
    return res.status(200).json({ success: true, result: amegoData });

  } catch (error) {
    console.error("🔥 發票 API 執行失敗:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}