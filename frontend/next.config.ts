import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Set the output file tracing root to avoid lockfile warnings
  outputFileTracingRoot: __dirname,
  // Enable standalone output for Docker
  output: 'standalone',
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'PAUL Azerbaijan',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'paul.az',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.paul.az',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '46.62.152.225',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    // Use environment variable for API URL, fallback to relative path for production
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
      {
        source: '/sanctum/:path*',
        destination: `${apiBaseUrl}/sanctum/:path*`,
      },
      {
        source: '/storage/:path*',
        destination: `${apiBaseUrl}/storage/:path*`,
      },
    ];
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
