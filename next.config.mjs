/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/_next/static/media/:path*',
        destination: '/mirror_next/static/media/:path*',
      },
      {
        source: '/image',
        destination: '/_next/image',
      },
      {
        source: '/_vercel/insights/script.js',
        destination: '/empty-analytics.js',
      },
      {
        source: '/_vercel/speed-insights/script.js',
        destination: '/empty-analytics.js',
      },
    ];
  },
};

export default nextConfig;
