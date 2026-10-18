import type { NextConfig } from "next";

// A fully static marketing site (landing, privacy, terms): exported to plain HTML.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
};

export default nextConfig;
