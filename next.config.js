/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['jqtmrdiyysovrncppvgs.supabase.co', 'zyjjxvndrdinfzbpmjyl.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

