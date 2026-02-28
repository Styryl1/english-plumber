/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: false,
  outputFileTracingIncludes: {
    '/': [
      './src/mirror/live-index.html',
      './src/mirror/injections/**/*',
      './content/site/mirror-content.json',
      './content/tina/site.json',
      './src/generated/media-manifest.json',
    ],
    '/[...slug]': [
      './src/mirror/live-index.html',
      './src/mirror/injections/**/*',
      './content/site/mirror-content.json',
      './content/tina/site.json',
      './src/generated/media-manifest.json',
    ],
  },
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

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
