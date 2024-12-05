/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')
const withTM = require('next-transpile-modules')([
    'rc-util', // Add any other modules that need to be transpiled
    'antd',
    'rc-pagination',
    'rc-picker',
    'rc-input',
    '@ant-design/icons-svg',
])

const securityHeaders = [
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
    },
]

const nextConfig = withTM({
    reactStrictMode: true,
    transpilePackages: ['geist'],
    webpack5: true,
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            stream: false,
            crypto: false,
            path: false,
            os: false,
        }

        return config
    },
    i18n,
    images: {
        domains: ['meta.viewblock.io', 'image.lexica.art'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.lexica.art',
                port: '',
                pathname: '/[lang]/[username]/didx/wallet',
            },
        ],
    },
    headers() {
        return [
            {
                // Apply these headers to all routes in your application.
                source: '/:path*',
                headers: securityHeaders,
            },
        ]
    },
})

module.exports = nextConfig
