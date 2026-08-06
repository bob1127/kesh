/**
 * On-demand ISR revalidation for news article pages.
 *
 * Usage (after deploy):
 *   GET/POST /api/revalidate-news?slug=luxury-sales-contract-guide&secret=YOUR_SECRET
 *
 * Set env REVALIDATE_SECRET on Vercel (or fall back to a one-off secret).
 */
export default async function handler(req, res) {
  const secret = process.env.REVALIDATE_SECRET || "";
  const token = req.query.secret || req.headers["x-revalidate-secret"];

  if (!secret || token !== secret) {
    return res.status(401).json({ message: "Invalid secret" });
  }

  const slug = String(req.query.slug || "").trim();
  if (!slug) {
    return res.status(400).json({ message: "Missing slug" });
  }

  const locales = ["zh-TW", "en", "ko"];

  try {
    const results = [];
    for (const locale of locales) {
      const path =
        locale === "zh-TW" ? `/news/${slug}` : `/${locale}/news/${slug}`;
      await res.revalidate(path);
      results.push(path);
    }
    return res.json({ revalidated: true, paths: results });
  } catch (err) {
    console.error("revalidate-news error:", err);
    return res.status(500).json({
      message: "Error revalidating",
      error: err?.message || String(err),
    });
  }
}
