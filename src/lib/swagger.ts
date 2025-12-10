/**
 * Configuración de Swagger/OpenAPI
 */

import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "EMI Design OS API",
        version: "1.0.0",
        description:
          "API del sistema de diseño EMI. Proporciona endpoints para gestionar kits, componentes, y más.",
        contact: {
          name: "EMI Team",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Servidor de desarrollo",
        },
      ],
      tags: [
        {
          name: "Kit",
          description: "Operaciones relacionadas con kits de diseño",
        },
        {
          name: "Sesión",
          description: "Operaciones relacionadas con la sesión del usuario",
        },
      ],
    },
  });
  return spec;
};
