import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  // En desarrollo, deshabilitar shadow database para evitar problemas
  // La validación se hará directamente contra la base de datos principal
  shadowDatabaseUrl: env("DATABASE_URL"),
});
