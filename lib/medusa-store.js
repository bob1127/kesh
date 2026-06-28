export const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://kesh-backend-production.up.railway.app";

export const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_8cae0356e1f6ff1f46fef038d0502ccc44da72d98db7307cb95350571949983b";

export function getMedusaStoreHeaders(extra = {}) {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new Error("商店設定缺少 Medusa Publishable Key，請聯絡客服。");
  }

  const headers = {
    "Content-Type": "application/json",
    "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
    ...extra,
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("medusa_auth_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function readMedusaError(response) {
  try {
    const data = await response.json();
    return data?.message || data?.type || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function medusaStoreFetch(path, options = {}) {
  const url = `${MEDUSA_BACKEND_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getMedusaStoreHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readMedusaError(response));
  }

  return response;
}
