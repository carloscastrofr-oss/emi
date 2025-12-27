import { NextRequest } from "next/server";
import { successResponse, errorResponse, applyDevDelay, isDevApiMode } from "@/lib/api-utils";
import { validateAuth } from "@/lib/api-auth";

type KitFileTreeNode =
  | {
      id: string;
      name: string;
      kind: "folder";
      children: KitFileTreeNode[];
    }
  | {
      id: string;
      name: string;
      kind: "file";
      kitId: string;
      mimeType?: string;
      isSupportedForAi: boolean;
      workspaceId?: string;
    };

interface KitFileTreeResponse {
  items: KitFileTreeNode[];
}

function isMimeTypeSupportedForAi(mimeType?: string | null, name?: string | null): boolean {
  if (!mimeType && !name) return false;

  const lowerName = name?.toLowerCase() ?? "";

  if (mimeType) {
    if (mimeType.startsWith("text/")) return true;
    if (mimeType === "application/json") return true;
    if (mimeType === "text/markdown") return true;
    if (mimeType === "application/pdf") return true;
  }

  if (lowerName.endsWith(".txt")) return true;
  if (lowerName.endsWith(".md") || lowerName.endsWith(".markdown")) return true;
  if (lowerName.endsWith(".json")) return true;
  if (lowerName.endsWith(".csv")) return true;
  if (lowerName.endsWith(".pdf")) return true;

  return false;
}

export async function GET(request: NextRequest) {
  try {
    await applyDevDelay(request);

    const isDevMode = isDevApiMode(request);

    if (!isDevMode) {
      try {
        await validateAuth(request);
      } catch (error: any) {
        const errorMessage = error?.message ?? "No autenticado";
        return errorResponse(errorMessage, 401);
      }
    }

    const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? undefined;

    const { prisma } = require("@/lib/prisma");

    const whereClause: any = {
      isActive: true,
    };

    if (!isDevMode && workspaceId) {
      whereClause.OR = [
        { scope: "workspace", workspaceId },
        { scope: "client", clientId: { not: null } }, // Permitir todos los de cliente por ahora
      ];
    }

    const kits = await prisma.kit.findMany({
      where: whereClause,
      include: {
        files: {
          orderBy: { title: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });

    const items: KitFileTreeNode[] = kits.map((kit: any) => {
      const children: KitFileTreeNode[] = kit.files.map((file: any) => ({
        id: file.id,
        name: file.title || file.name,
        kind: "file",
        kitId: file.kitId,
        mimeType: file.mimeType ?? undefined,
        isSupportedForAi: isMimeTypeSupportedForAi(file.mimeType, file.name),
        workspaceId: kit.workspaceId ?? undefined,
      }));

      return {
        id: kit.id,
        name: kit.title,
        kind: "folder",
        children,
      };
    });

    const payload: KitFileTreeResponse = {
      items,
    };

    return successResponse(payload);
  } catch (error) {
    console.error("[Kit Tree GET] Error building kit file tree:", error);
    return errorResponse("Error al obtener el árbol de archivos de kits", 500);
  }
}
