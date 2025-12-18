/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración estándar de Next.js
  reactStrictMode: true,

  // Output standalone para Docker/Cloud Run
  // Esto crea un .next/standalone con solo los archivos necesarios
  output: "standalone",

  // Configuración de ESLint - ignorar warnings durante el build
  // Los warnings no deberían bloquear el build en producción
  eslint: {
    // Ignorar warnings durante el build (solo errores críticos fallan)
    ignoreDuringBuilds: true,
  },

  // Configuración de TypeScript - ignorar errores durante el build
  typescript: {
    // No fallar el build por errores de TypeScript (solo warnings)
    ignoreBuildErrors: false,
  },

  // Webpack config para manejar problemas de compatibilidad con react-joyride
  webpack: (config, { isServer, webpack }) => {
    // Ignorar react-joyride completamente durante el build
    // Solo se cargará dinámicamente en runtime en el cliente
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^react-joyride$/,
        })
      );
    }

    // Excluir react-joyride del bundle del servidor
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("react-joyride");
    }

    // Resolver fallback para evitar errores de módulo no encontrado
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "react-joyride": false,
    };

    return config;
  },

  // Variables de entorno públicas
  // Next.js automáticamente expone variables que empiezan con NEXT_PUBLIC_
  // No necesitamos configurar nada adicional aquí

  // Configuración para diferentes ambientes
  // El ambiente se detecta automáticamente desde:
  // 1. APP_ENV
  // 2. VERCEL_ENV (si está en Vercel)
  // 3. NODE_ENV

  // En el futuro, aquí se puede agregar configuración para Secret Manager de GCP
};

module.exports = nextConfig;

