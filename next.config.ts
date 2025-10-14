import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "100mb",
        },
    },
    images: {
        remotePatterns: [
            // Vercel Blob public hosts (subdomains like 'dcnpruvgeemnaxr5.public.blob.vercel-storage.com')
            {
                protocol: "https",
                hostname: "*.public.blob.vercel-storage.com",
            },
            // Generic vercel-storage hosts
            {
                protocol: "https",
                hostname: "*.vercel-storage.com",
            },
        ],
    },
};

export default nextConfig;
