/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración estándar de Next.js
  reactStrictMode: true,
  
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

