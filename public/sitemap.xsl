<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Sitemap – KÉSH de¹ 凱仕國際精品</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8f7f5; color: #333; }
          header { background: #1a1a1a; color: #fff; padding: 28px 40px; display: flex; align-items: center; gap: 16px; }
          header h1 { font-size: 20px; font-weight: 600; letter-spacing: 0.04em; }
          header span { color: #aaa; font-size: 13px; }
          .badge { background: #ef4628; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.06em; }
          .container { max-width: 1100px; margin: 32px auto; padding: 0 24px; }
          .stats { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
          .stat-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px 24px; flex: 1; min-width: 140px; }
          .stat-card .num { font-size: 28px; font-weight: 700; color: #1a1a1a; }
          .stat-card .label { font-size: 12px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5; font-size: 13px; }
          thead tr { background: #1a1a1a; color: #fff; }
          thead th { padding: 12px 16px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
          tbody tr:nth-child(even) { background: #fafafa; }
          tbody tr:hover { background: #fff5f3; }
          td { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
          td a { color: #ef4628; text-decoration: none; word-break: break-all; }
          td a:hover { text-decoration: underline; }
          .pri-high { color: #16a34a; font-weight: 600; }
          .pri-mid  { color: #ca8a04; }
          .pri-low  { color: #9ca3af; }
          .tag { display: inline-block; font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 600; letter-spacing: 0.04em; }
          .tag-daily   { background: #dcfce7; color: #15803d; }
          .tag-weekly  { background: #dbeafe; color: #1d4ed8; }
          .tag-monthly { background: #fef9c3; color: #a16207; }
          .tag-yearly  { background: #f3f4f6; color: #6b7280; }
          footer { text-align: center; font-size: 12px; color: #aaa; padding: 32px; }
        </style>
      </head>
      <body>
        <header>
          <div>
            <h1>KÉSH de¹ 凱仕國際精品 — Sitemap</h1>
            <span>
              <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> 個 URL ×
              zh-TW / en / ko 三語系
            </span>
          </div>
          <div class="badge">SEO</div>
        </header>

        <div class="container">
          <div class="stats">
            <div class="stat-card">
              <div class="num"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
              <div class="label">總 URL 數</div>
            </div>
            <div class="stat-card">
              <div class="num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/product/')])"/></div>
              <div class="label">商品頁</div>
            </div>
            <div class="stat-card">
              <div class="num"><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/category/')])"/></div>
              <div class="label">分類頁</div>
            </div>
            <div class="stat-card">
              <div class="num">3</div>
              <div class="label">語系</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
                <th>更新頻率</th>
                <th>優先度</th>
                <th>最後更新</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td style="color:#bbb;width:48px"><xsl:value-of select="position()"/></td>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td>
                    <span>
                      <xsl:attribute name="class">tag tag-<xsl:value-of select="sitemap:changefreq"/></xsl:attribute>
                      <xsl:value-of select="sitemap:changefreq"/>
                    </span>
                  </td>
                  <td>
                    <span>
                      <xsl:choose>
                        <xsl:when test="sitemap:priority >= 0.9"><xsl:attribute name="class">pri-high</xsl:attribute></xsl:when>
                        <xsl:when test="sitemap:priority >= 0.6"><xsl:attribute name="class">pri-mid</xsl:attribute></xsl:when>
                        <xsl:otherwise><xsl:attribute name="class">pri-low</xsl:attribute></xsl:otherwise>
                      </xsl:choose>
                      <xsl:value-of select="sitemap:priority"/>
                    </span>
                  </td>
                  <td style="color:#aaa;font-size:11px">
                    <xsl:value-of select="substring(sitemap:lastmod,1,10)"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
        <footer>KÉSH de¹ 凱仕國際精品 · sitemap.xml · 由 Next.js ISR 動態生成</footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
