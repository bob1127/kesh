/**
 * 訂單進度：訂購 → 付款 → 處理 → 出貨
 * stage keys: placed | unpaid | paid | processing | shipped | canceled
 */

export const ORDER_PROGRESS_STEPS = [
  { key: "placed", labelZh: "訂購", labelEn: "Ordered" },
  { key: "paid", labelZh: "付款", labelEn: "Paid" },
  { key: "processing", labelZh: "處理", labelEn: "Processing" },
  { key: "shipped", labelZh: "出貨", labelEn: "Shipped" },
];

/**
 * @param {object} order - Medusa order-like object
 * @returns {"placed"|"unpaid"|"paid"|"processing"|"shipped"|"canceled"}
 */
export function resolveOrderProgressStage(order = {}) {
  const paymentStatus = order.payment_status || order.paymentStatus || "";
  const meta = order.metadata || {};
  const status = String(order.status || "").toLowerCase();

  if (
    paymentStatus === "canceled" ||
    status === "canceled" ||
    status === "cancelled"
  ) {
    return "canceled";
  }

  const hasWaybill = Boolean(meta.sf_waybill_no || order.waybill_no);
  if (hasWaybill || status === "completed" || status === "shipped") {
    return "shipped";
  }

  const isPaid =
    paymentStatus === "captured" ||
    paymentStatus === "paid" ||
    meta.processing_email_sent === true ||
    status === "processing";

  if (isPaid) {
    return "processing";
  }

  // ATM / pending payment
  if (
    paymentStatus === "awaiting" ||
    paymentStatus === "not_paid" ||
    paymentStatus === "requires_action" ||
    status === "pending" ||
    status === "on-hold" ||
    meta.payment_method === "ATM"
  ) {
    return "unpaid";
  }

  // 至少已訂購
  return "placed";
}

/**
 * Map stage → which step index is current (0–3), and which are complete.
 * unpaid: placed done, paid current (awaiting)
 * processing: placed+paid done, processing current
 * shipped: all done
 */
export function getProgressVisualState(stage) {
  if (stage === "canceled") {
    return { currentIndex: -1, completedThrough: -1, canceled: true };
  }
  if (stage === "shipped") {
    return { currentIndex: 3, completedThrough: 3, canceled: false };
  }
  if (stage === "processing" || stage === "paid") {
    return { currentIndex: 2, completedThrough: 1, canceled: false };
  }
  if (stage === "unpaid") {
    return { currentIndex: 1, completedThrough: 0, canceled: false };
  }
  // placed only
  return { currentIndex: 0, completedThrough: -1, canceled: false };
}

export function stageLabel(stage, locale = "zh-TW") {
  const zh = {
    placed: "已訂購",
    unpaid: "待付款",
    paid: "已付款",
    processing: "處理中",
    shipped: "已出貨",
    canceled: "已取消",
  };
  const en = {
    placed: "Ordered",
    unpaid: "Awaiting payment",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    canceled: "Canceled",
  };
  return (locale?.startsWith("zh") ? zh : en)[stage] || stage;
}
