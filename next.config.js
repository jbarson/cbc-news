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
    ],
  },
}

module.exports = nextConfig

