import axios, { AxiosInstance } from "axios";

const { WC_SITE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET } = process.env;

if (!WC_SITE_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
  throw new Error("請先在 .env.local 設定 WooCommerce 相關環境變數");
}

// ✅ 注意：baseURL 只到 /wc/v3，不要再加 /products/categories
const wooApi: AxiosInstance = axios.create({
  baseURL: `${WC_SITE_URL}/wp-json/wc/v3`,
  auth: {
    username: WC_CONSUMER_KEY,
    password: WC_CONSUMER_SECRET,
  },
});

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  image?: {
    src: string;
  };
}

/**
 * 依 slug 取得此分類底下的子分類（product_cat）
 * 例如 slug = "categories" / "brand"
 */
export async function getChildrenCategoriesBySlug(
  slug: string
): Promise<WcCategory[]> {
  try {
    // 1️⃣ 先找出對應的 parent category
    const parentRes = await wooApi.get<WcCategory[]>("/products/categories", {
      params: {
        slug,
        per_page: 1,
      },
    });

    const parents = parentRes.data;

    if (!Array.isArray(parents) || parents.length === 0) {
      console.warn("找不到對應的父分類 slug:", slug);
      return [];
    }

    const parentId = parents[0].id;

    // 2️⃣ 再用 parent id 取出此 parent 底下的子分類
    const childrenRes = await wooApi.get<WcCategory[]>("/products/categories", {
      params: {
        parent: parentId,
        per_page: 100,
        hide_empty: false, // 看你要不要隱藏沒商品的
        orderby: "menu_order",
        order: "asc",
      },
    });

    return childrenRes.data;
  } catch (error: any) {
    console.error(
      "getChildrenCategoriesBySlug error:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
}
