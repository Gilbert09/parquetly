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
        // Lets the browser enforce that the page talks only to the hosts it
        // needs: the DuckDB bundle on jsDelivr, the Hugging Face sample file,
        // and PostHog. fetch, XHR, beacons and WebSockets to any other host
        // are blocked, so a file cannot be sent anywhere else.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "connect-src 'self' blob: data:",
              "https://cdn.jsdelivr.net",
              "https://huggingface.co https://*.hf.co",
              "https://*.posthog.com",
            ].join(" "),
          },
        ],
      },
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
