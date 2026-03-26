/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/site_IA',
    images: { unoptimized: true },
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true }
};

export default nextConfig;
