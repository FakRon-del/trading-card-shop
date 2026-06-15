import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pokemontcg.io',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
    ],
  },
}

export default nextConfig