import type { NextConfig } from "next";

// GitHub Pages serves a project repo under /<repo>, so we need a basePath in
// production. In dev (`next dev`) we keep it empty so http://localhost:3000 works.
const repo = "voya-travel-advisor";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export", // emit a fully static site to web/out
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true }, // no server to run the default image optimizer
  trailingSlash: true, // emit /when/index.html so direct links don't 404 on Pages
};

export default nextConfig;
