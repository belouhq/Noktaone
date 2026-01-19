/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supprimer les console.log en production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Garder seulement les erreurs et warnings
    } : false,
  },
  // Configuration webpack pour filtrer les messages TensorFlow
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Filtrer les messages TensorFlow/MediaPipe dans la console
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
}

module.exports = nextConfig
