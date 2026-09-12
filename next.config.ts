import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // NOTE: deliberately no webpack() block. Next 16 refuses to build with
  // Turbopack when one is present, and parquet-wasm is served as a static
  // asset from public/ precisely so no bundler has to handle WASM.
  async headers() {
    return [
      {
        // Version-scoped and content-immutable: 6 MB should be fetched once.
        source: "/wasm/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
