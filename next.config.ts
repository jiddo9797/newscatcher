import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // PGlite(DB 엔진 wasm 포함)와 jsdom(본문 추출)은 번들에 합치지 않고 node_modules에서 그대로 불러오게 한다.
  serverExternalPackages: ["@electric-sql/pglite", "jsdom"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
