/**
 * Tipos para la funcionalidad de Kits
 */

export type KitCategory = "development" | "research" | "design" | "tokens";

export type KitItemScope = "workspace" | "client";

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
  title: string; // Título personalizado del archivo
  name: string; // Nombre original del archivo
  fileUrl: string; // URL de Firebase Storage
  fileSize?: number; // tamaño en bytes
  mimeType?: string;
  scope: KitItemScope; // Alcance de visibilidad
  uploadedBy: string; // Email del usuario que subió el archivo
  workspaceId?: string; // ID del workspace donde se subió
  clientId?: string; // ID del cliente donde se subió
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
  scope: KitItemScope; // Alcance de visibilidad
  createdBy: string; // Email del usuario que creó el enlace
  workspaceId?: string; // ID del workspace donde se creó
  clientId?: string; // ID del cliente donde se creó
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
  title: string; // Título personalizado
  name: string; // Nombre original del archivo
  file: File;
  scope: KitItemScope;
  uploadedBy: string; // Email del usuario
  workspaceId?: string;
  clientId?: string;
}

export interface AddKitLinkInput {
  title: string;
  url: string;
  description?: string;
  scope: KitItemScope;
  createdBy: string; // Email del usuario
  workspaceId?: string;
  clientId?: string;
}
