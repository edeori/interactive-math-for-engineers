/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@repo/curriculum",
    "@repo/exercise-engine",
    "@repo/shared-types",
  ],
};

export default nextConfig;
