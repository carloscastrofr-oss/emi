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
import { validateAuth } from "@/lib/api-auth";
import type { KitItem } from "@/types/kit";

const addFileSchema = z.object({
  type: z.literal("file"),
  title: z.string().min(1, "El título es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  fileUrl: z.string().url("La URL del archivo es inválida"),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  scope: z.enum(["workspace", "client"]),
  uploadedBy: z.string().email("El email es inválido"),
  workspaceId: z.string().optional(),
  clientId: z.string().optional(),
});

const addLinkSchema = z.object({
  type: z.literal("link"),
  title: z.string().min(1, "El título es requerido"),
  url: z.string().url("La URL es inválida"),
  description: z.string().optional(),
  scope: z.enum(["workspace", "client"]),
  workspaceId: z.string().optional(),
  clientId: z.string().optional(),
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

    // Obtener userId para verificar permisos
    let userId: string | null = null;
    let userWorkspaceIds: string[] = [];
    let userClientIds: string[] = [];

    try {
      const auth = await validateAuth(request);
      userId = auth.userId;

      // Obtener accesos del usuario a workspaces y clientes
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          workspaceAccesses: {
            select: { workspaceId: true },
          },
          clientAccesses: {
            select: { clientId: true },
          },
        },
      });

      if (user) {
        userWorkspaceIds = user.workspaceAccesses.map((access) => access.workspaceId);
        userClientIds = user.clientAccesses.map((access) => access.clientId);
      }
    } catch {
      // Si no hay autenticación, no se pueden ver archivos
      return errorResponse("No autenticado", 401);
    }

    // Obtener archivos y enlaces
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

    console.log("[Kit Files GET] Archivos encontrados en DB:", {
      total: files.length,
      files: files.map((f) => ({
        id: f.id,
        title: f.title,
        scope: f.scope,
        workspaceId: f.workspaceId,
        clientId: f.clientId,
      })),
    });

    // Si el usuario no tiene accesos configurados, mostrar todos los archivos (comportamiento permisivo)
    // Esto es útil durante el desarrollo o cuando el sistema de permisos aún no está completamente configurado
    const hasNoAccessConfigured = userWorkspaceIds.length === 0 && userClientIds.length === 0;

    console.log("[Kit Files GET] Estado de permisos:", {
      userId,
      userWorkspaceIds,
      userClientIds,
      hasNoAccessConfigured,
    });

    // Filtrar por permisos según scope
    const filteredFiles = files.filter((file) => {
      // Si no hay accesos configurados, mostrar todos los archivos (incluso sin workspaceId/clientId)
      if (hasNoAccessConfigured) {
        return true;
      }

      // Si el archivo no tiene workspaceId/clientId, mostrarlo (archivos antiguos o sin configuración)
      if (!file.workspaceId && !file.clientId) {
        return true;
      }

      if (file.scope === "workspace") {
        if (!file.workspaceId) {
          return false;
        }
        return userWorkspaceIds.includes(file.workspaceId);
      } else if (file.scope === "client") {
        if (!file.clientId) {
          return false;
        }
        return userClientIds.includes(file.clientId);
      }
      return false;
    });

    const filteredLinks = links.filter((link) => {
      // Si no hay accesos configurados, mostrar todos los enlaces (incluso sin workspaceId/clientId)
      if (hasNoAccessConfigured) {
        return true;
      }

      // Si el enlace no tiene workspaceId/clientId, mostrarlo (enlaces antiguos o sin configuración)
      if (!link.workspaceId && !link.clientId) {
        return true;
      }

      if (link.scope === "workspace") {
        if (!link.workspaceId) {
          return false;
        }
        return userWorkspaceIds.includes(link.workspaceId);
      } else if (link.scope === "client") {
        if (!link.clientId) {
          return false;
        }
        return userClientIds.includes(link.clientId);
      }
      return false;
    });

    const items: KitItem[] = [
      ...filteredFiles.map((file) => ({
        type: "file" as const,
        id: file.id,
        kitId: file.kitId,
        title: file.title,
        name: file.name,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || undefined,
        mimeType: file.mimeType || undefined,
        scope: file.scope,
        uploadedBy: file.uploadedBy,
        workspaceId: file.workspaceId || undefined,
        clientId: file.clientId || undefined,
        uploadedAt: file.uploadedAt.toISOString(),
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      })),
      ...filteredLinks.map((link) => ({
        type: "link" as const,
        id: link.id,
        kitId: link.kitId,
        title: link.title,
        url: link.url,
        description: link.description || undefined,
        scope: link.scope,
        workspaceId: link.workspaceId || undefined,
        clientId: link.clientId || undefined,
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

    console.log("[Kit Files GET] Items después del filtrado:", {
      total: items.length,
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        scope: item.scope,
        workspaceId: item.workspaceId,
        clientId: item.clientId,
      })),
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
            title: validatedData.title,
            name: validatedData.name,
            fileUrl: validatedData.fileUrl,
            fileSize: validatedData.fileSize,
            mimeType: validatedData.mimeType,
            scope: validatedData.scope,
            uploadedBy: validatedData.uploadedBy,
            workspaceId: validatedData.workspaceId,
            clientId: validatedData.clientId,
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
            scope: validatedData.scope,
            workspaceId: validatedData.workspaceId,
            clientId: validatedData.clientId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          201
        );
      }
    }

    // Modo producción: usar Prisma
    if (validatedData.type === "file") {
      const fileData = {
        kitId: id,
        title: validatedData.title,
        name: validatedData.name,
        fileUrl: validatedData.fileUrl,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        scope: validatedData.scope,
        uploadedBy: validatedData.uploadedBy,
        workspaceId: validatedData.workspaceId,
        clientId: validatedData.clientId,
      };

      console.log("[Kit Files POST] Guardando archivo con datos:", fileData);

      const file = await prisma.kitFile.create({
        data: fileData,
      });

      console.log("[Kit Files POST] Archivo guardado:", {
        id: file.id,
        workspaceId: file.workspaceId,
        clientId: file.clientId,
        scope: file.scope,
      });

      return successResponse(
        {
          type: "file" as const,
          id: file.id,
          kitId: file.kitId,
          title: file.title,
          name: file.name,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize || undefined,
          mimeType: file.mimeType || undefined,
          scope: file.scope,
          uploadedBy: file.uploadedBy,
          workspaceId: file.workspaceId || undefined,
          clientId: file.clientId || undefined,
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
          scope: validatedData.scope,
          workspaceId: validatedData.workspaceId,
          clientId: validatedData.clientId,
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
          scope: link.scope,
          workspaceId: link.workspaceId || undefined,
          clientId: link.clientId || undefined,
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
