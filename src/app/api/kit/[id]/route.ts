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
import {
  successResponse,
  errorResponse,
  applyDevDelay,
  isDevApiMode,
  noBackendResponse,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { kitsMock } from "@/mocks/kit";
import type { Kit } from "@/types/kit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isDevMode = isDevApiMode(request);

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
    const kit = await prisma.kit.findUnique({
      where: { id },
      include: {
        files: true,
        links: true,
      },
    });

    if (!kit) {
      return errorResponse("Kit no encontrado", 404);
    }

    const response: Kit = {
      id: kit.id,
      title: kit.title,
      description: kit.description,
      icon: kit.icon,
      category: kit.category,
      downloadUrl: kit.downloadUrl || undefined,
      docsUrl: kit.docsUrl || undefined,
      tags: kit.tags,
      createdAt: kit.createdAt.toISOString(),
      updatedAt: kit.updatedAt.toISOString(),
      createdBy: kit.createdBy || undefined,
      isActive: kit.isActive,
      files: kit.files.map((file) => ({
        id: file.id,
        kitId: file.kitId,
        name: file.name,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || undefined,
        mimeType: file.mimeType || undefined,
        uploadedAt: file.uploadedAt.toISOString(),
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      })),
      links: kit.links.map((link) => ({
        id: link.id,
        kitId: link.kitId,
        title: link.title,
        url: link.url,
        description: link.description || undefined,
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
