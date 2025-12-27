/**
 * @swagger
 * /api/kit/{id}:
 *   get:
 *     summary: Obtener un kit por ID
 *     description: Retorna un kit específico con sus archivos y enlaces
 *     tags:
 *       - Kit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del kit
 *     responses:
 *       200:
 *         description: Kit obtenido exitosamente
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error del servidor
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, applyDevDelay, isDevApiMode } from "@/lib/api-utils";
import { kitsMock } from "@/mocks/kit";
import type { Kit } from "@/types/kit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isDevMode = isDevApiMode(request);

    console.log(`[API /kit/${id}] 🔍 Solicitando kit...`);

    // En modo dev, usar mocks
    if (isDevMode) {
      await applyDevDelay(request);
      const kit = kitsMock.find((k) => k.id === id);

      if (!kit) {
        return errorResponse("Kit no encontrado", 404);
      }

      return successResponse(kit);
    }

    // Modo producción: usar Prisma
    const { prisma } = require("@/lib/prisma");
    console.log(`[API /kit/${id}] 🔍 Buscando kit en base de datos...`);

    const kit = await prisma.kit.findUnique({
      where: { id },
      include: {
        files: true,
        links: true,
      },
    });

    if (!kit) {
      console.error(`[API /kit/${id}] ❌ Kit no encontrado en la base de datos`);
      return errorResponse("Kit no encontrado", 404);
    }

    console.log(`[API /kit/${id}] ✅ Kit encontrado: "${kit.title}" (Scope: ${kit.scope})`);

    const response: Kit = {
      id: kit.id,
      title: kit.title,
      description: kit.description,
      icon: kit.icon,
      category: kit.category,
      scope: kit.scope,
      ownerId: kit.ownerId || undefined,
      clientId: kit.clientId || undefined,
      workspaceId: kit.workspaceId || undefined,
      downloadUrl: kit.downloadUrl || undefined,
      docsUrl: kit.docsUrl || undefined,
      tags: kit.tags,
      createdAt: kit.createdAt.toISOString(),
      updatedAt: kit.updatedAt.toISOString(),
      createdBy: kit.createdBy || undefined,
      isActive: kit.isActive,
      files: kit.files.map((file: any) => ({
        id: file.id,
        kitId: file.kitId,
        title: file.title,
        name: file.name,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || undefined,
        mimeType: file.mimeType || undefined,
        uploadedBy: file.uploadedBy,
        uploadedAt: file.uploadedAt.toISOString(),
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      })),
      links: kit.links.map((link: any) => ({
        id: link.id,
        kitId: link.kitId,
        title: link.title,
        url: link.url,
        description: link.description || undefined,
        createdBy: link.createdBy,
        createdAt: link.createdAt.toISOString(),
        updatedAt: link.updatedAt.toISOString(),
      })),
    };

    return successResponse(response);
  } catch (error) {
    console.error("Error fetching kit:", error);
    return errorResponse("Error al obtener el kit", 500);
  }
}
