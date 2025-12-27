/**
 * @swagger
 * /api/kit:
 *   get:
 *     summary: Obtener lista de kits
 *     description: Retorna todos los kits disponibles en el sistema de diseño
 *     tags:
 *       - Kit
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [development, research, design, tokens]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por título o descripción
 *     responses:
 *       200:
 *         description: Lista de kits obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Kit'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               data:
 *                 - id: "kit-repo"
 *                   title: "Consulta de Repositorio"
 *                   description: "Accede al repositorio de código fuente"
 *                   icon: "Github"
 *                   category: "development"
 *                   tags: ["código", "documentación"]
 *                   updatedAt: "2024-12-01T10:00:00Z"
 *               timestamp: "2024-12-04T12:00:00Z"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * components:
 *   schemas:
 *     Kit:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - description
 *         - icon
 *         - category
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Identificador único del kit
 *           example: "kit-repo"
 *         title:
 *           type: string
 *           description: Nombre del kit
 *           example: "Consulta de Repositorio"
 *         description:
 *           type: string
 *           description: Descripción del kit
 *           example: "Accede al repositorio de código fuente"
 *         icon:
 *           type: string
 *           description: Nombre del icono de Lucide
 *           example: "Github"
 *         category:
 *           type: string
 *           enum: [development, research, design, tokens]
 *           description: Categoría del kit
 *         downloadUrl:
 *           type: string
 *           format: uri
 *           description: URL de descarga
 *         docsUrl:
 *           type: string
 *           format: uri
 *           description: URL de documentación
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Etiquetas del kit
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             details:
 *               type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { kitsMock } from "@/mocks/kit";
import type { Kit, KitCategory } from "@/types/kit";
import { successResponse, errorResponse, applyDevDelay, isDevApiMode } from "@/lib/api-utils";
import { validateAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const isDevMode = isDevApiMode(request);

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase();
    const clientId = searchParams.get("clientId");
    const workspaceId = searchParams.get("workspaceId");

    // En modo dev, usar mocks
    if (isDevMode) {
      await applyDevDelay(request);

      let filteredKits: Kit[] = [...kitsMock];

      if (category) {
        filteredKits = filteredKits.filter((kit) => kit.category === category);
      }

      if (search) {
        filteredKits = filteredKits.filter(
          (kit) =>
            kit.title.toLowerCase().includes(search) ||
            kit.description.toLowerCase().includes(search) ||
            kit.tags?.some((tag: string) => tag.toLowerCase().includes(search))
        );
      }

      return successResponse(filteredKits);
    }

    // Modo producción: usar Prisma
    // 1. Validar autenticación
    let auth;
    try {
      auth = await validateAuth(request);
    } catch (error: any) {
      return errorResponse(error.message || "No autorizado", 401);
    }

    const userId = auth.userId;

    // 2. Obtener el usuario para verificar si es superAdmin
    // Importación dinámica para asegurar que usamos el cliente actualizado
    const { prisma } = require("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { superAdmin: true },
    });

    if (!user) {
      return errorResponse("Usuario no encontrado", 404);
    }

    // 3. Construir filtro de visibilidad (OR conditions)
    // Lógica estrictamente contextual:
    // Si hay un contexto (workspaceId o clientId), los resultados DEBEN pertenecer a ese contexto.

    const where: any = { isActive: true };

    if (workspaceId || clientId) {
      const contextFilters: any[] = [];

      // A. Kits de equipo: solo si coinciden con el workspaceId proporcionado
      if (workspaceId) {
        contextFilters.push({
          scope: "workspace",
          workspaceId: workspaceId,
        });
      }

      // B. Kits de empresa: solo si coinciden con el clientId proporcionado
      if (clientId) {
        contextFilters.push({
          scope: "client",
          clientId: clientId,
        });
      }

      // C. Kits personales: solo si soy el dueño Y coinciden con el contexto proporcionado
      if (workspaceId) {
        contextFilters.push({
          scope: "personal",
          ownerId: userId,
          workspaceId: workspaceId,
        });
      } else if (clientId) {
        contextFilters.push({
          scope: "personal",
          ownerId: userId,
          clientId: clientId,
        });
      }

      where.OR = contextFilters;
    } else if (!user.superAdmin) {
      // Si NO hay contexto y NO es superAdmin, por seguridad solo mostramos sus propios kits personales
      where.ownerId = userId;
      where.scope = "personal";
    }
    // Nota: Si es superAdmin y no hay contexto, 'where' se queda solo con { isActive: true } (ve todo)

    if (category) {
      where.category = category;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { has: search } },
          ],
        },
      ];
    }

    const kits = await prisma.kit.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    const response: Kit[] = kits.map((kit: any) => ({
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
    }));

    return successResponse(response);
  } catch (error) {
    console.error("Error fetching kits:", error);
    return errorResponse("Error al obtener los kits", 500);
  }
}

const createKitSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  icon: z.string().min(1, "El icono es requerido"),
  category: z.enum(["development", "research", "design", "tokens"]),
  scope: z.enum(["personal", "workspace", "client"]),
  tags: z.array(z.string()).optional().default([]),
  clientId: z.string().optional(),
  workspaceId: z.string().optional(),
});

/**
 * @swagger
 * /api/kit:
 *   post:
 *     summary: Crear un nuevo kit
 *     description: Crea un nuevo kit en el sistema
 *     tags:
 *       - Kit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - icon
 *               - category
 *               - scope
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Kit de Componentes"
 *               description:
 *                 type: string
 *                 example: "Componentes esenciales para proyectos"
 *               icon:
 *                 type: string
 *                 example: "Package"
 *               category:
 *                 type: string
 *                 enum: [development, research, design, tokens]
 *                 example: "development"
 *               scope:
 *                 type: string
 *                 enum: [personal, workspace, client]
 *                 example: "workspace"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["componentes", "UI"]
 *               clientId:
 *                 type: string
 *               workspaceId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kit creado exitosamente
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
export async function POST(request: NextRequest) {
  try {
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

    // En modo dev, usar mocks
    if (isDevMode) {
      await applyDevDelay(request);
      const body = await request.json();
      const validatedData = createKitSchema.parse(body);

      // Crear mock kit
      const mockKit: Kit = {
        id: `kit-${Date.now()}`,
        ...validatedData,
        ownerId: validatedData.scope === "personal" ? userId : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return successResponse(mockKit, 201);
    }

    // Modo producción: usar Prisma
    const body = await request.json();
    console.log("[API /kit] 📥 Recibiendo payload de creación:", JSON.stringify(body, null, 2));
    const validatedData = createKitSchema.parse(body);

    // Obtener información del usuario
    const { prisma } = require("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, displayName: true, id: true },
    });

    if (!user) {
      console.error(`[API /kit] ❌ Usuario ${userId} no encontrado en la DB`);
      return errorResponse("Usuario no encontrado", 404);
    }

    // Preparar datos del kit
    const kitData: any = {
      title: validatedData.title,
      description: validatedData.description,
      icon: validatedData.icon,
      category: validatedData.category as KitCategory,
      scope: validatedData.scope,
      tags: validatedData.tags || [],
      createdBy: user.displayName || user.email || "Usuario desconocido",
      isActive: true,
    };

    // Asignar IDs de contexto según el alcance
    if (validatedData.scope === "personal") {
      kitData.ownerId = user.id;
      // Los kits personales también se anclan al contexto donde se crearon
      if (validatedData.workspaceId) kitData.workspaceId = validatedData.workspaceId;
      if (validatedData.clientId) kitData.clientId = validatedData.clientId;
    } else if (validatedData.scope === "workspace") {
      if (!validatedData.workspaceId) {
        return errorResponse("El ID del workspace es requerido para alcance de equipo", 400);
      }
      kitData.workspaceId = validatedData.workspaceId;
      // También asociamos el cliente si viene en el payload
      if (validatedData.clientId) kitData.clientId = validatedData.clientId;
    } else if (validatedData.scope === "client") {
      if (!validatedData.clientId) {
        return errorResponse("El ID del cliente es requerido para alcance de empresa", 400);
      }
      kitData.clientId = validatedData.clientId;
    }

    console.log("[API /kit] 🔨 Creando kit en DB con datos:", JSON.stringify(kitData, null, 2));

    const kit = await prisma.kit.create({
      data: kitData,
    });

    console.log(`[API /kit] ✅ Kit creado exitosamente con ID: ${kit.id}`);

    return successResponse(
      {
        id: kit.id,
        title: kit.title,
        description: kit.description,
        icon: kit.icon,
        category: kit.category,
        scope: kit.scope,
        ownerId: kit.ownerId || undefined,
        clientId: kit.clientId || undefined,
        workspaceId: kit.workspaceId || undefined,
        tags: kit.tags,
        createdAt: kit.createdAt.toISOString(),
        updatedAt: kit.updatedAt.toISOString(),
        createdBy: kit.createdBy || undefined,
      },
      201
    );
  } catch (error) {
    console.error("Error creating kit:", error);

    if (error instanceof z.ZodError) {
      return errorResponse("Error de validación", 400, error.errors);
    }

    return errorResponse("Error al crear el kit", 500);
  }
}
