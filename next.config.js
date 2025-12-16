/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
})

const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'source.unsplash.com' },
            { protocol: 'https', hostname: 'i.pravatar.cc' },
        ],
    },
}

// PWA Disabled temporarily to allow Turbopack build (Next 16)
// module.exports = withPWA(nextConfig)
module.exports = nextConfig;
