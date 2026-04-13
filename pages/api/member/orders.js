export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const siteUrl = process.env.WC_SITE_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  try {
    console.log(`🔍 開始搜尋訂單，Email: ${email}`);

    // --- 策略 A: 先嘗試用 Email 找出 Customer ID (針對已註冊會員) ---
    let ordersById = [];
    try {
      const customerRes = await fetch(`${siteUrl}/wp-json/wc/v3/customers?email=${email}`, { headers });
      const customers = await customerRes.json();
      
      if (customers.length > 0) {
        const customerId = customers[0].id;
        console.log(`✅ 找到會員 ID: ${customerId}`);
        
        // 用 ID 抓訂單
        const ordersRes = await fetch(`${siteUrl}/wp-json/wc/v3/orders?customer=${customerId}&per_page=20`, { headers });
        ordersById = await ordersRes.json();
        if (!Array.isArray(ordersById)) ordersById = []; // 防呆
      } else {
        console.log("⚠️ 此 Email 尚未註冊為 WooCommerce Customer (可能是訪客)");
      }
    } catch (e) {
      console.error("策略 A 失敗:", e);
    }

    // --- 策略 B: 直接用 Email 搜尋訂單 (針對訪客訂單 或 搜尋補漏) ---
    let ordersBySearch = [];
    try {
      const searchRes = await fetch(`${siteUrl}/wp-json/wc/v3/orders?search=${email}&per_page=20`, { headers });
      const searchData = await searchRes.json();
      
      if (Array.isArray(searchData)) {
        // 嚴格過濾：確保 billing email 真的吻合 (search 有時會搜到地址或名字)
        ordersBySearch = searchData.filter(order => 
            order.billing?.email?.toLowerCase() === email.toLowerCase()
        );
      }
    } catch (e) {
      console.error("策略 B 失敗:", e);
    }

    // --- 合併結果並去除重複 ---
    // 使用 Map 以訂單 ID 為鍵值來去重
    const allOrdersMap = new Map();

    [...ordersById, ...ordersBySearch].forEach(order => {
        if (order && order.id) {
            allOrdersMap.set(order.id, order);
        }
    });

    const finalOrders = Array.from(allOrdersMap.values());

    // 依照日期排序 (新的在前)
    finalOrders.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));

    console.log(`🎉 最終找到 ${finalOrders.length} 筆訂單`);
    res.status(200).json(finalOrders);

  } catch (error) {
    console.error("Fetch Orders Critical Error:", error);
    res.status(500).json({ message: error.message });
  }
}