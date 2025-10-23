/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["mongoose"]
    },
    images: {
        domains: ['lh3.googleusercontent.com', 'm.godesigner.ru', 'app.requestly.io', 's3-us-west-2.amazonaws.com', 'localhost', 'images.unsplash.com']
    },
    webpack(config) {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        }
        return config
    }
};

export default nextConfig;
