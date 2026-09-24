/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*.e2b.app', 'localhost:3000', '127.0.0.1:3000'],
    },
  },
};

export default nextConfig;
