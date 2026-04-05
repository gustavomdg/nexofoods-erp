/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@gastrosys/db", "@gastrosys/api", "@gastrosys/types", "@gastrosys/validators"],
  serverExternalPackages: ["@prisma/client", "prisma"],

};

export default nextConfig;
