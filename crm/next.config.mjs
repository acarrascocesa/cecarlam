/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Movido de experimental según la nueva versión
  serverExternalPackages: ['@prisma/client'],
  // Usar webpack explícitamente para mantener compatibilidad con la configuración existente
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  output: 'standalone',
  // Deshabilitar Turbopack y usar webpack
  experimental: {
    turbo: false,
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
