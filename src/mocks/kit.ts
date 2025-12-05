/**
 * Mock data para la vista Kit
 * Estos datos simulan lo que vendría del backend
 */

export interface Kit {
  id: string;
  title: string;
  description: string;
  icon: string; // nombre del icono de lucide-react
  category: "development" | "research" | "design" | "tokens";
  downloadUrl?: string;
  docsUrl?: string;
  tags?: string[];
  updatedAt: string;
}

export const kitsMock: Kit[] = [
  {
    id: "kit-repo",
    title: "Consulta de Repositorio",
    description: "Accede al repositorio de código fuente y la documentación técnica.",
    icon: "Github",
    category: "development",
    downloadUrl: "https://github.com/example/design-system",
    docsUrl: "https://docs.example.com",
    tags: ["código", "documentación", "github"],
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "kit-research",
    title: "Research",
    description: "Todos los artefactos y hallazgos de la investigación de usuarios.",
    icon: "FileText",
    category: "research",
    docsUrl: "https://research.example.com",
    tags: ["investigación", "usuarios", "hallazgos"],
    updatedAt: "2024-11-28T14:30:00Z",
  },
  {
    id: "kit-branding",
    title: "Branding",
    description: "Logos, paleta de colores, tipografía y guías de estilo de la marca.",
    icon: "SwatchBook",
    category: "design",
    downloadUrl: "https://brand.example.com/download",
    tags: ["marca", "logos", "colores", "tipografía"],
    updatedAt: "2024-11-25T09:00:00Z",
  },
  {
    id: "kit-components",
    title: "Kit de Componentes Principales",
    description: "El conjunto esencial de componentes de UI para cualquier proyecto nuevo.",
    icon: "Package",
    category: "development",
    downloadUrl: "https://npm.example.com/ui-kit",
    docsUrl: "https://components.example.com",
    tags: ["componentes", "UI", "react"],
    updatedAt: "2024-12-03T16:45:00Z",
  },
  {
    id: "kit-tokens",
    title: "Paquete de Inicio de Tokens",
    description: "Tokens de diseño para colores, tipografía y espaciado.",
    icon: "Palette",
    category: "tokens",
    downloadUrl: "https://npm.example.com/tokens",
    docsUrl: "https://tokens.example.com",
    tags: ["tokens", "variables", "CSS"],
    updatedAt: "2024-12-02T11:20:00Z",
  },
  {
    id: "kit-ecommerce",
    title: "Kit de UI para E-commerce",
    description: "Componentes diseñados para experiencias de venta en línea.",
    icon: "ShoppingCart",
    category: "development",
    downloadUrl: "https://npm.example.com/ecommerce-kit",
    docsUrl: "https://ecommerce.example.com",
    tags: ["e-commerce", "tienda", "checkout"],
    updatedAt: "2024-11-30T08:15:00Z",
  },
];
