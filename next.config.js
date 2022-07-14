/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')
const nextConfig = {
    reactStrictMode: true,
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
}

module.exports = nextConfig
