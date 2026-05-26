/** Product page SEO title / description / keywords builders */

export function parseConditionGrade(conditionStr) {
  if (!conditionStr) return "";
  const match = String(conditionStr).match(/\b([SsAa][Bb]?)\b/);
  return match ? match[1].toUpperCase() : "";
}

export function getConditionStatusPhrase(grade, locale) {
  const g = (grade || "").toUpperCase();
  if (g.startsWith("S")) {
    if (locale === "en") return "Like-New Luxury";
    if (locale === "ko") return "준신품 명품";
    return "近全新精品";
  }
  if (locale === "en") return "Curated Pre-Owned Luxury";
  if (locale === "ko") return "엄선 중고 명품";
  return "精選二手精品";
}

export function buildProductSeoTitle({
  brand,
  title,
  condition,
  locale = "zh-TW",
  customTitle,
}) {
  if (customTitle) return `${customTitle} | KÉSH de¹`;

  const grade = parseConditionGrade(condition);
  const status = getConditionStatusPhrase(grade, locale);
  const safeBrand = brand || "";
  const safeTitle = title || "";

  if (locale === "en") {
    const gradePart = grade ? `Rank ${grade} ` : "";
    return `${safeBrand} ${safeTitle} | ${gradePart}${status} | KÉSH de¹`.replace(
      /\s+/g,
      " ",
    );
  }
  if (locale === "ko") {
    const gradePart = grade ? `${grade}급 ` : "";
    return `${safeBrand} ${safeTitle} | ${gradePart}${status} | KÉSH de¹`.replace(
      /\s+/g,
      " ",
    );
  }
  const gradePart = grade ? `${grade}級` : "";
  return `${safeBrand} ${safeTitle}｜${gradePart}${status}｜KÉSH de¹`;
}

export function buildProductSeoDescription({
  brand,
  title,
  condition,
  subtitle,
  description,
  locale = "zh-TW",
  customDesc,
}) {
  if (customDesc) return customDesc;

  const plain =
    description?.replace(/<[^>]+>/g, "").trim().substring(0, 160) || "";
  if (plain.length > 40) return plain;

  const grade = parseConditionGrade(condition);
  const detail = subtitle ? `，${subtitle}` : "";

  if (locale === "en") {
    const gradeText = grade ? `Condition rank ${grade}. ` : "";
    return `KÉSH de¹ presents authenticated ${brand} ${title}${detail}. ${gradeText}Professional authentication, genuine guarantee, fast shipping and after-sales support.`;
  }
  if (locale === "ko") {
    const gradeText = grade ? `상태 등급 ${grade}. ` : "";
    return `KÉSH de¹ 엄선 ${brand} ${title}${detail}. ${gradeText}전문 감정, 정품 보증, 빠른 출고 및 사후 서비스.`;
  }
  const gradeText = grade ? `商品狀態為 ${grade} 級。` : "";
  return `KÉSH de¹ 嚴選 ${brand} ${title}${detail}。${gradeText}每件精品皆經專業鑑定，提供正品保障、快速出貨與售後服務。`;
}

export function buildProductSeoKeywords({
  brand,
  title,
  condition,
  subtitle,
  locale = "zh-TW",
  customKeywords,
}) {
  if (customKeywords) return customKeywords;

  const grade = parseConditionGrade(condition);
  const baseZh = `${brand}, ${title}, ${subtitle || ""}, 全新精品, 近全新精品, 二手精品, 精品包, 精品鑑定, 正品保證, KÉSH de¹, 凱仕國際精品`;
  const baseEn = `${brand}, ${title}, ${subtitle || ""}, new luxury, like-new luxury, pre-owned luxury, designer handbag, luxury authentication, KÉSH de¹`;
  const baseKo = `${brand}, ${title}, ${subtitle || ""}, 신품 명품, 준신품, 중고 명품, 명품 백, 정품 감정, KÉSH de¹`;

  const gradeKw =
    grade && locale === "en"
      ? `, Rank ${grade}`
      : grade && locale === "ko"
        ? `, ${grade}급`
        : grade
          ? `, ${grade}級`
          : "";

  if (locale === "en") return `${baseEn}${gradeKw}`;
  if (locale === "ko") return `${baseKo}${gradeKw}`;
  return `${baseZh}${gradeKw}`;
}
