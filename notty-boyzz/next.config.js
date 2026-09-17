/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Ensure static assets and rewrites work seamlessly
  async rewrites() {
    return [
      {
        source: '/control',
        destination: '/control-desk',
      },
    ];
  },
};

module.exports = nextConfig;
