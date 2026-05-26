/**
 * i18next returns the key string when a translation is missing.
 * That value is truthy, so `t(key) || fallback` never uses the fallback.
 */
export function tFallback(t, key, fallback) {
  const value = t(key, { defaultValue: fallback });
  if (value == null || value === "") return fallback;
  if (typeof value === "string" && (value === key || value === key.toLowerCase())) {
    return fallback;
  }
  return value;
}
