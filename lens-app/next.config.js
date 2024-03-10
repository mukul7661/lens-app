/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ik.imagekit.io", "gw.ipfs-lens.dev"],
  },
};

module.exports = nextConfig;
