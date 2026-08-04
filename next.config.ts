import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "nivagion.com"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nivagion.com",
      },
    ],
  },
};

if (process.env.NODE_ENV === "development" && process.env.OPENNEXT_DEV_INIT !== "false") {
  initOpenNextCloudflareForDev();
}

export default nextConfig;
