import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@centlalia/client'],
  typedRoutes: true,
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
