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
};

module.exports = nextConfig;