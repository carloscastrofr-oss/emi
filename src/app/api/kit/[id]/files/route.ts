/**
 * @swagger
 * /api/kit/{id}/files:
 *   get:
 *     summary: Obtener archivos y enlaces de un kit
 *     description: Retorna todos los archivos y enlaces asociados a un kit
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
 *         description: Lista de archivos y enlaces obtenida exitosamente
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Agregar archivo o enlace a un kit
 *     description: Agrega un nuevo archivo o enlace a un kit
 *     tags:
 *       - Kit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [file]
 *                   name:
 *                     type: string
 *                   fileUrl:
 *                     type: string
 *                   fileSize:
 *                     type: number
 *                   mimeType:
 *                     type: string
 *               - type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [link]
 *                   title:
 *                     type: string
 *                   url:
 *                     type: string
 *                   description:
 *                     type: string
 *     responses:
 *       201:
 *         description: Archivo o enlace agregado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Kit no encontrado
 *       500:
 *         description: Error del servidor
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse, applyDevDelay, isDevApiMode } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import type { KitItem } from "@/types/kit";

const addFileSchema = z.object({
  type: z.literal("file"),
  name: z.string().min(1, "El nombre es requerido"),
  fileUrl: z.string().url("La URL del archivo es inválida"),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
});

const addLinkSchema = z.object({
  type: z.literal("link"),
  title: z.string().min(1, "El título es requerido"),
  url: z.string().url("La URL es inválida"),
  description: z.string().optional(),
});

const addItemSchema = z.discriminatedUnion("type", [addFileSchema, addLinkSchema]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isDevMode = isDevApiMode(request);

    // En modo dev, retornar array vacío
    if (isDevMode) {
      await applyDevDelay(request);
      return successResponse([]);
    }

    // Modo producción: usar Prisma
    const kit = await prisma.kit.findUnique({
      where: { id },
    });

    if (!kit) {
      return errorResponse("Kit no encontrado", 404);
    }

    const [files, links] = await Promise.all([
      prisma.kitFile.findMany({
        where: { kitId: id },
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.kitLink.findMany({
        where: { kitId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const items: KitItem[] = [
      ...files.map((file) => ({
        type: "file" as const,
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
      ...links.map((link) => ({
        type: "link" as const,
        id: link.id,
        kitId: link.kitId,
        title: link.title,
        url: link.url,
        description: link.description || undefined,
        createdAt: link.createdAt.toISOString(),
        updatedAt: link.updatedAt.toISOString(),
      })),
    ];

    // Ordenar por fecha (más recientes primero)
    items.sort((a, b) => {
      const dateA = a.type === "file" ? a.uploadedAt : a.createdAt;
      const dateB = b.type === "file" ? b.uploadedAt : b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return successResponse(items);
  } catch (error) {
    console.error("Error fetching kit files:", error);
    return errorResponse("Error al obtener los archivos del kit", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isDevMode = isDevApiMode(request);

    // Verificar que el kit existe
    if (!isDevMode) {
      const kit = await prisma.kit.findUnique({
        where: { id },
      });

      if (!kit) {
        return errorResponse("Kit no encontrado", 404);
      }
    }

    const body = await request.json();
    const validatedData = addItemSchema.parse(body);

    if (isDevMode) {
      await applyDevDelay(request);
      // Retornar mock
      if (validatedData.type === "file") {
        return successResponse(
          {
            type: "file",
            id: `file-${Date.now()}`,
            kitId: id,
            name: validatedData.name,
            fileUrl: validatedData.fileUrl,
            fileSize: validatedData.fileSize,
            mimeType: validatedData.mimeType,
            uploadedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          201
        );
      } else {
        return successResponse(
          {
            type: "link",
            id: `link-${Date.now()}`,
            kitId: id,
            title: validatedData.title,
            url: validatedData.url,
            description: validatedData.description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          201
        );
      }
    }

    // Modo producción: usar Prisma
    if (validatedData.type === "file") {
      const file = await prisma.kitFile.create({
        data: {
          kitId: id,
          name: validatedData.name,
          fileUrl: validatedData.fileUrl,
          fileSize: validatedData.fileSize,
          mimeType: validatedData.mimeType,
        },
      });

      return successResponse(
        {
          type: "file" as const,
          id: file.id,
          kitId: file.kitId,
          name: file.name,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize || undefined,
          mimeType: file.mimeType || undefined,
          uploadedAt: file.uploadedAt.toISOString(),
          createdAt: file.createdAt.toISOString(),
          updatedAt: file.updatedAt.toISOString(),
        },
        201
      );
    } else {
      const link = await prisma.kitLink.create({
        data: {
          kitId: id,
          title: validatedData.title,
          url: validatedData.url,
          description: validatedData.description,
        },
      });

      return successResponse(
        {
          type: "link" as const,
          id: link.id,
          kitId: link.kitId,
          title: link.title,
          url: link.url,
          description: link.description || undefined,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        },
        201
      );
    }
  } catch (error) {
    console.error("Error adding kit file/link:", error);

    if (error instanceof z.ZodError) {
      return errorResponse("Error de validación", 400, error.errors);
    }

    return errorResponse("Error al agregar el archivo/enlace", 500);
  }
}
