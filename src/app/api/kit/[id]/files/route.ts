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
 *     description: Agrega un nuevo archivo o enlace a un kit. Hereda el alcance del kit.
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
 *                   title:
 *                     type: string
 *                   name:
 *                     type: string
 *                   fileUrl:
 *                     type: string
 *                   fileSize:
 *                     type: number
 *                   mimeType:
 *                     type: string
 *                   uploadedBy:
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
 *                   createdBy:
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
import { validateAuth } from "@/lib/api-auth";
import type { KitItem } from "@/types/kit";

const addFileSchema = z.object({
  type: z.literal("file"),
  title: z.string().min(1, "El título es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  fileUrl: z.string().url("La URL del archivo es inválida"),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  uploadedBy: z.string().email("El email es inválido"),
});

const addLinkSchema = z.object({
  type: z.literal("link"),
  title: z.string().min(1, "El título es requerido"),
  url: z.string().url("La URL es inválida"),
  description: z.string().optional(),
  createdBy: z.string().email("El email es inválido"),
});

const addItemSchema = z.discriminatedUnion("type", [addFileSchema, addLinkSchema]);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isDevMode = isDevApiMode(request);

    // En modo dev, retornar array vacío o mocks si existieran
    if (isDevMode) {
      await applyDevDelay(request);
      return successResponse([]);
    }

    // 1. Validar autenticación
    let auth;
    try {
      auth = await validateAuth(request);
    } catch (error: any) {
      return errorResponse(error.message || "No autorizado", 401);
    }

    const userId = auth.userId;

    const { prisma } = require("@/lib/prisma");

    // 2. Obtener el kit y el usuario para verificar visibilidad
    const [kit, user] = await Promise.all([
      prisma.kit.findUnique({
        where: { id },
        select: {
          id: true,
          scope: true,
          ownerId: true,
          clientId: true,
          workspaceId: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          workspaceAccesses: { select: { workspaceId: true } },
          clientAccesses: { select: { clientId: true } },
        },
      }),
    ]);

    if (!kit) {
      console.error(`[API /kit/${id}/files] ❌ Kit no encontrado`);
      return errorResponse("Kit no encontrado", 404);
    }

    if (!user) {
      console.error(`[API /kit/${id}/files] ❌ Usuario ${userId} no encontrado`);
      return errorResponse("Usuario no encontrado", 404);
    }

    // 3. Verificar si el usuario tiene acceso al kit
    const userWorkspaceIds = user.workspaceAccesses.map((a: any) => a.workspaceId);
    const userClientIds = user.clientAccesses.map((a: any) => a.clientId);

    let hasAccess = false;

    // SuperAdmin tiene acceso total
    if (user.superAdmin) {
      hasAccess = true;
    } else if (kit.scope === "personal") {
      hasAccess = kit.ownerId === userId;
    } else if (kit.scope === "workspace") {
      hasAccess = kit.workspaceId ? userWorkspaceIds.includes(kit.workspaceId) : false;
    } else if (kit.scope === "client") {
      hasAccess = kit.clientId ? userClientIds.includes(kit.clientId) : false;
    }

    if (!hasAccess) {
      console.warn(
        `[API /kit/${id}/files] ⚠️ Usuario ${userId} intentó acceder sin permisos al kit ${id}`
      );
      return errorResponse("No tienes permiso para ver los archivos de este kit", 403);
    }

    // 4. Obtener archivos y enlaces del kit
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
      ...files.map((file: any) => ({
        type: "file" as const,
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
      ...links.map((link: any) => ({
        type: "link" as const,
        id: link.id,
        kitId: link.kitId,
        title: link.title,
        url: link.url,
        description: link.description || undefined,
        createdBy: link.createdBy,
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
    console.error("Error fetching kit items:", error);
    return errorResponse("Error al obtener los archivos del kit", 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isDevMode = isDevApiMode(request);

    // 1. Validar autenticación
    let auth;
    try {
      auth = await validateAuth(request);
    } catch (error: any) {
      if (!isDevMode) return errorResponse(error.message || "No autorizado", 401);
      auth = { userId: "mock-user-id" };
    }

    const userId = auth.userId;

    // Modo producción: usar Prisma dinámico
    const { prisma } = require("@/lib/prisma");

    // 2. Verificar que el kit existe y el usuario tiene permiso para editarlo
    if (!isDevMode) {
      const kit = await prisma.kit.findUnique({
        where: { id },
        select: { id: true, scope: true, ownerId: true, workspaceId: true, clientId: true },
      });

      if (!kit) {
        return errorResponse("Kit no encontrado", 404);
      }

      // Solo el dueño puede agregar cosas a un kit personal
      if (kit.scope === "personal" && kit.ownerId !== userId) {
        return errorResponse("No tienes permiso para editar este kit personal", 403);
      }

      // Para workspace y client, por ahora permitimos a cualquiera con acceso al kit
      // En el futuro podríamos restringir a roles específicos (ej: leads)
    }

    const body = await request.json();
    const validatedData = addItemSchema.parse(body);

    if (isDevMode) {
      await applyDevDelay(request);
      if (validatedData.type === "file") {
        return successResponse(
          {
            id: `file-${Date.now()}`,
            kitId: id,
            ...validatedData,
            uploadedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          201
        );
      } else {
        return successResponse(
          {
            id: `link-${Date.now()}`,
            kitId: id,
            ...validatedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          201
        );
      }
    }

    if (validatedData.type === "file") {
      const file = await prisma.kitFile.create({
        data: {
          kitId: id,
          title: validatedData.title,
          name: validatedData.name,
          fileUrl: validatedData.fileUrl,
          fileSize: validatedData.fileSize,
          mimeType: validatedData.mimeType,
          uploadedBy: validatedData.uploadedBy,
        },
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
          uploadedBy: file.uploadedBy,
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
          createdBy: validatedData.createdBy,
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
          createdBy: link.createdBy,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
        },
        201
      );
    }
  } catch (error) {
    console.error("Error adding kit item:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Error de validación", 400, error.errors);
    }
    return errorResponse("Error al agregar el item al kit", 500);
  }
}
