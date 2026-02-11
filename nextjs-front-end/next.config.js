/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "export", // required for static export
    //trailingSlash: true,
    images: {
        unoptimized: true, // IPFS cannot handle Next.js image optimization
    },
    assetPrefix: "./", // ensures assets use relative paths (important for IPFS)
    // ⬇️ ADD THIS SECTION ⬇️
    env: {
        NEXT_PUBLIC_JSON_RPC_PROVIDER: process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
    },
}

module.exports = nextConfig
