import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow server actions to be invoked from any origin.
      // Required when the app is accessed via a reverse-proxy / tunnel
      // (e.g. telebit, ngrok) whose hostname differs from localhost.
      allowedOrigins: ['*'],
    },
  },
};

export default nextConfig;
