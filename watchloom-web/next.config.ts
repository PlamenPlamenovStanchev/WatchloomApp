import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Turbopack to read hoisted node_modules and shared packages
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
