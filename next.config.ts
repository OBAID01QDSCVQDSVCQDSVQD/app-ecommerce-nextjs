import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    // (لا تضع allowedDevOrigins هنا)
  },
};

export default nextConfig;
