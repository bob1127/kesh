/** @type {import('next').NextConfig} */
const path = require("path");
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  i18n, // Enables built-in i18n routing (Pages Router only)

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // ⚠️ Consider restricting this to specific domains for production
      },
      {
        protocol: "http",
        hostname: "**",
      },
      // 👇 新增：明確允許你的 Supabase 網址載入圖片
      {
        protocol: "https",
        hostname: "qhefiwluztdmxractwln.supabase.co",
      },
    ],
  },

  transpilePackages: ["gsap"],

  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },

  // WebGL / Shader support
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      use: ["babel-loader", "babel-plugin-glsl"],
    });
    return config;
  },
  
  // Fixes Styled-Components hydration mismatches
  compiler: {
    styledComponents: true,
  },

  // Apple Pay / 網域驗證檔：確保無副檔名也能被正確讀取
  async headers() {
    return [
      {
        source: "/.well-known/apple-developer-merchantid-domain-association",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;