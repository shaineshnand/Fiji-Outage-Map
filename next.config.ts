import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fixes dev crash: SegmentViewNode missing from React Client Manifest (Next 15.5 devtools)
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
