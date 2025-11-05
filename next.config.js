/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.cbc.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.cbc.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thumbnails.cbc.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.cbc.ca',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig

