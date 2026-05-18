// lib/price.js

/**
 * 取得正確的商品價格
 * @param {number} rawAmount - 後端傳來的原始金額
 * @param {string} currencyCode - 幣別代碼
 * @returns {number} 轉換後的正確金額
 */
export function getCorrectAmount(rawAmount, currencyCode) {
  if (rawAmount === undefined || rawAmount === null) return 0;

  // 真相大白：你的 Medusa API 回傳的已經是「精準的實際金額」
  // 所有幣別都原封不動回傳，完全不需要除以 100！
  return rawAmount;
}