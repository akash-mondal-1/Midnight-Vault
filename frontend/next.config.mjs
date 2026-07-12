/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Vercel deployment — suppress build errors on missing optional modules
  webpack: (config) => {
    // Handle node-specific modules that aren't available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
