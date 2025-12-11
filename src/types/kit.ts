/**
 * Tipos para la funcionalidad de Kits
 */

export type KitCategory = "development" | "research" | "design" | "tokens";

export interface Kit {
  id: string;
  title: string;
  description: string;
  icon: string; // nombre del icono de lucide-react
  category: KitCategory;
  downloadUrl?: string;
  docsUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isActive?: boolean;
  files?: KitFile[];
  links?: KitLink[];
}

export interface KitFile {
  id: string;
  kitId: string;
  name: string;
  fileUrl: string; // URL de Firebase Storage
  fileSize?: number; // tamaño en bytes
  mimeType?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface KitLink {
  id: string;
  kitId: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipo combinado para listar archivos y enlaces juntos
export type KitItem = ({ type: "file" } & KitFile) | ({ type: "link" } & KitLink);

// Tipos para crear kits
export interface CreateKitInput {
  title: string;
  description: string;
  icon: string;
  category: KitCategory;
  tags?: string[];
}

// Tipos para agregar archivos/enlaces
export interface AddKitFileInput {
  name: string;
  file: File;
}

export interface AddKitLinkInput {
  title: string;
  url: string;
  description?: string;
}
