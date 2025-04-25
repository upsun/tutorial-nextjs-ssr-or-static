import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,
 
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,
 
  distDir: 'out',
};

export default nextConfig;
