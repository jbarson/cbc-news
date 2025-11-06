/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.cbc.ca',
      },
      {
        protocol: 'https',
        hostname: 'www.cbc.ca',
      },
      {
        protocol: 'https',
        hostname: 'thumbnails.cbc.ca',
      },
      {
        protocol: 'https',
        hostname: 'media.cbc.ca',
      },
      {
        protocol: 'https',
        hostname: 'images.radio-canada.ca',
      },
      {
        protocol: 'https',
        hostname: '**.cbc.ca',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow API requests to same origin
              "connect-src 'self'",
              // Allow images from CBC domains and any HTTPS source (for RSS content)
              "img-src 'self' https: data: blob:",
              // Next.js requires 'unsafe-eval' for its runtime (code splitting, HMR, etc.)
              "script-src 'self' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

