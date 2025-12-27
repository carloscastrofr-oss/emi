/**
 * Tipos para la funcionalidad de Kits
 */

export type KitCategory = "development" | "research" | "design" | "tokens";

export type KitItemScope = "personal" | "workspace" | "client";

export interface Kit {
  id: string;
  title: string;
  description: string;
  icon: string; // nombre del icono de lucide-react
  category: KitCategory;
  scope: KitItemScope;
  ownerId?: string; // ID del usuario (para scope personal)
  clientId?: string; // ID del cliente (para scope client)
  workspaceId?: string; // ID del workspace (para scope workspace)
  downloadUrl?: string;
  docsUrl?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // Email o nombre del creador para mostrar en UI
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
  uploadedBy: string; // Email del usuario que subió el archivo
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
  createdBy: string; // Email del usuario que creó el enlace
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
  scope: KitItemScope;
  tags?: string[];
  ownerId?: string;
  clientId?: string;
  workspaceId?: string;
}

// Tipos para agregar archivos/enlaces
export interface AddKitFileInput {
  title: string; // Título personalizado
  name: string; // Nombre original del archivo
  file: File;
  uploadedBy: string; // Email del usuario
}

export interface AddKitLinkInput {
  title: string;
  url: string;
  description?: string;
  createdBy: string; // Email del usuario
}
