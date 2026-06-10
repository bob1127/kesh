import { Libre_Baskerville } from "next/font/google";

/**
 * 英文 / 韓文：Libre Baskerville（襯線，數字對齊整齊）
 * next/font 自托管 + preload latin subset
 */
export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-en-serif",
  preload: true,
  adjustFontFallback: true,
});

/**
 * 繁體中文：思源宋體
 * next/font 不支援繁中 subset preload，僅在 zh-TW 語系時由 Layout 動態載入
 */
export const NOTO_SERIF_TC_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;500;600;700&display=swap";

export const NOTO_SERIF_TC_FAMILY =
  '"Noto Serif TC", "Source Han Serif TC", "思源宋體", serif';

export function isChineseLocale(locale) {
  return (locale || "zh-TW") === "zh-TW";
}

export function getHtmlLang(locale) {
  if (locale === "zh-TW") return "zh-Hant";
  if (locale === "ko") return "ko";
  return "en";
}
