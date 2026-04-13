// lib/orderEmailTemplates.js
export function statusLabel(status) {
  const map = {
    pending: "待付款",
    processing: "處理中",
    "on-hold": "保留中",
    completed: "已完成",
    cancelled: "已取消",
    refunded: "已退款",
    failed: "付款失敗",
  };
  return map[status] || status;
}

export function money(n) {
  const num = Number(n || 0);
  return `NT$ ${num.toLocaleString("zh-TW")}`;
}

function itemsTable(order) {
  const rows = (order.line_items || [])
    .map((it) => {
      const qty = it.quantity || 0;
      const unit = it.price ?? (qty ? Number(it.total || 0) / qty : 0);
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">${it.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${money(unit)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${money(it.total)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #111;">商品</th>
          <th style="text-align:center;padding:10px 0;border-bottom:2px solid #111;">數量</th>
          <th style="text-align:right;padding:10px 0;border-bottom:2px solid #111;">單價</th>
          <th style="text-align:right;padding:10px 0;border-bottom:2px solid #111;">小計</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="4" style="padding:10px 0;">（無商品明細）</td></tr>`}
      </tbody>
    </table>
  `;
}

function shippingBlock(order) {
  const shipName =
    `${order.shipping?.first_name || ""} ${order.shipping?.last_name || ""}`.trim() ||
    `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim() ||
    "—";

  const phone = order.billing?.phone || "—";
  const addr = `${order.shipping?.postcode || order.billing?.postcode || ""} ${order.shipping?.city || order.billing?.city || ""} ${order.shipping?.address_1 || order.billing?.address_1 || ""}`.trim() || "—";

  return `
    <div style="background:#fff;border:1px solid #eee;padding:16px;border-radius:8px;">
      <div><strong>收件人：</strong>${shipName}</div>
      <div><strong>電話：</strong>${phone}</div>
      <div><strong>地址：</strong>${addr}</div>
    </div>
  `;
}

export function buildOrderCreatedEmail({ order, siteUrl }) {
  const customerName =
    `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim() ||
    order.billing?.email ||
    "您好";

  const lookupLink = `${siteUrl}/order-lookup`;

  const subject = `【KÉSH de¹】已收到您的訂單 #${order.id}｜待付款`;

  const html = `
  <div style="font-family: Arial, 'Noto Sans TC', sans-serif; color:#111; line-height:1.7;">
    <h2 style="margin:0 0 8px;">KÉSH de¹ 訂單成立通知</h2>
    <p style="margin:0 0 16px;">${customerName}，感謝您的訂購！我們已收到您的訂單，尚未完成付款，請依下方方式完成付款：</p>

    <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin-bottom:16px;">
      <div><strong>訂單編號：</strong>#${order.id}</div>
      <div><strong>訂單狀態：</strong>${statusLabel(order.status)}</div>
      <div><strong>訂單日期：</strong>${String(order.date_created || "").slice(0,10)}</div>
      <div><strong>付款方式：</strong>${order.payment_method_title || "PayUni 統一支付"}</div>
      <div><strong>總金額：</strong>${money(order.total)}</div>
    </div>

    <h3 style="margin:24px 0 8px;">商品明細</h3>
    ${itemsTable(order)}
    <div style="margin-top:16px;text-align:right;font-size:16px;">
      <strong>總計：${money(order.total)}</strong>
    </div>

    <h3 style="margin:24px 0 8px;">付款提醒</h3>
    <ul style="margin:8px 0 0;padding-left:18px;">
      <li>若您選擇 <strong>信用卡 / Apple Pay / Google Pay</strong>，請回到結帳流程完成付款。</li>
      <li>若您選擇 <strong>ATM 轉帳</strong>，請依 PayUni 付款頁面指示完成轉帳（款項入帳後系統會更新訂單狀態）。</li>
    </ul>

    <p style="margin:20px 0 0;">
      訂單查詢：<a href="${lookupLink}" target="_blank" rel="noreferrer">${lookupLink}</a><br/>
      （輸入「訂單編號 + 下單 Email」即可查詢）
    </p>

    <h3 style="margin:24px 0 8px;">收件資訊</h3>
    ${shippingBlock(order)}

    <p style="margin:24px 0 0;color:#666;font-size:12px;">
      如有任何問題，請回覆此信或聯繫我們，謝謝。
    </p>
  </div>
  `;

  return { subject, html };
}

export function buildPaymentSuccessEmail({ order, siteUrl, transactionId }) {
  const customerName =
    `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim() ||
    order.billing?.email ||
    "您好";

  const lookupLink = `${siteUrl}/order-lookup`;

  const subject = `【KÉSH de¹】付款成功 #${order.id}｜訂單處理中`;

  const html = `
  <div style="font-family: Arial, 'Noto Sans TC', sans-serif; color:#111; line-height:1.7;">
    <h2 style="margin:0 0 8px;">KÉSH de¹ 付款成功通知</h2>
    <p style="margin:0 0 16px;">${customerName}，我們已收到您的付款，訂單已進入處理流程。</p>

    <div style="background:#f7f7f7;padding:16px;border-radius:8px;margin-bottom:16px;">
      <div><strong>訂單編號：</strong>#${order.id}</div>
      <div><strong>訂單狀態：</strong>${statusLabel(order.status)}</div>
      <div><strong>訂單日期：</strong>${String(order.date_created || "").slice(0,10)}</div>
      <div><strong>付款方式：</strong>${order.payment_method_title || "PayUni 統一支付"}</div>
      <div><strong>總金額：</strong>${money(order.total)}</div>
      ${
        transactionId
          ? `<div><strong>交易序號：</strong>${transactionId}</div>`
          : ""
      }
    </div>

    <h3 style="margin:24px 0 8px;">商品明細</h3>
    ${itemsTable(order)}
    <div style="margin-top:16px;text-align:right;font-size:16px;">
      <strong>總計：${money(order.total)}</strong>
    </div>

    <p style="margin:20px 0 0;">
      訂單查詢：<a href="${lookupLink}" target="_blank" rel="noreferrer">${lookupLink}</a>
    </p>

    <h3 style="margin:24px 0 8px;">收件資訊</h3>
    ${shippingBlock(order)}

    <p style="margin:24px 0 0;color:#666;font-size:12px;">
      如有任何問題，請回覆此信或聯繫我們，謝謝。
    </p>
  </div>
  `;

  return { subject, html };
}
