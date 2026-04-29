import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/2026-super-sticker-man' : '',
  assetPrefix: isProd ? '/2026-super-sticker-man/' : '',
  images: { unoptimized: true },
}

export default nextConfig
