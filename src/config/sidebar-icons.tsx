/**
 * Mapeo de nombres de iconos a componentes de Lucide
 * Usado por la configuración del sidebar
 */

import {
  BookUser,
  KanbanSquare,
  LayoutDashboard,
  Package,
  Bot,
  View,
  Beaker,
  ClipboardList,
  Target,
  Users,
  ShieldAlert,
  Sparkles,
  PenSquare,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const sidebarIcons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  PenSquare,
  Workflow,
  Sparkles,
  KanbanSquare,
  View,
  ShieldAlert,
  Users,
  Target,
  ClipboardList,
  Beaker,
  Bot,
  BookUser,
};

/**
 * Obtener el componente de icono por nombre
 */
export function getIcon(name: string): LucideIcon {
  return sidebarIcons[name] ?? Package;
}
