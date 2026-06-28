/** Medusa metadata 欄位後綴：title_zh / title_en / title_ko */
export function getMetaLang(locale = "zh-TW") {
  if (locale === "zh-TW") return "zh";
  if (locale === "en") return "en";
  if (locale === "ko") return "ko";
  return locale;
}

export function getNumberLocale(locale = "zh-TW") {
  if (locale === "en") return "en-US";
  if (locale === "ko") return "ko-KR";
  return "zh-TW";
}

export function getLocalizedMetadataTitle(
  metadata = {},
  defaultTitle = "",
  locale = "zh-TW",
) {
  const metaLang = getMetaLang(locale);
  let title = metadata[`title_${metaLang}`];

  if (locale === "zh-TW" && !title) {
    title =
      metadata["title_zh-TW"] ||
      metadata.title_zh ||
      metadata.title_tw ||
      undefined;
  }

  return title || defaultTitle;
}
