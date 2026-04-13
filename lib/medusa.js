import Medusa from "@medusajs/medusa-js"

// 建立 Medusa 客戶端
export const medusa = new Medusa({ 
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000", 
  maxRetries: 3,
  // 🔥 加入這行！讓前端請求帶著通行鑰匙
  publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY 
})

// 根據語系抓取分類 (Medusa 2.0 寫法)
export const getMedusaCategories = async () => {
  try {
    // Medusa 2.0 的 API 結構
    const { product_categories } = await medusa.productCategories.list()
    return product_categories
  } catch (error) {
    console.error("Medusa 分類抓取失敗:", error)
    return []
  }
}

// 抓取品牌 (在 Medusa 裡建議用 Collections 來代表品牌)
export const getMedusaBrands = async () => {
  try {
    const { collections } = await medusa.collections.list()
    return collections
  } catch (error) {
    console.error("Medusa 品牌抓取失敗:", error)
    return []
  }
}