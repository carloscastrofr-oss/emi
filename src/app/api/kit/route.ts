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
import { kitsMock, type Kit } from "@/mocks/kit";
import {
  successResponse,
  errorResponse,
  applyDevDelay,
  isDevApiMode,
  noBackendResponse,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import type { KitCategory } from "@/types/kit";

export async function GET(request: NextRequest) {
  try {
    const isDevMode = isDevApiMode(request);

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase();

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
            kit.tags?.some((tag) => tag.toLowerCase().includes(search))
        );
      }

      return successResponse(filteredKits);
    }

    // Modo producción: usar Prisma
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const kits = await prisma.kit.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    const response: Kit[] = kits.map((kit) => ({
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
  tags: z.array(z.string()).optional().default([]),
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
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["componentes", "UI"]
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

    // En modo dev, usar mocks
    if (isDevMode) {
      await applyDevDelay(request);
      const body = await request.json();
      const validatedData = createKitSchema.parse(body);

      // Crear mock kit
      const mockKit: Kit = {
        id: `kit-${Date.now()}`,
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return successResponse(mockKit, 201);
    }

    // Modo producción: usar Prisma
    const body = await request.json();
    const validatedData = createKitSchema.parse(body);

    const kit = await prisma.kit.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        icon: validatedData.icon,
        category: validatedData.category as KitCategory,
        tags: validatedData.tags || [],
      },
    });

    return successResponse(
      {
        id: kit.id,
        title: kit.title,
        description: kit.description,
        icon: kit.icon,
        category: kit.category,
        tags: kit.tags,
        createdAt: kit.createdAt.toISOString(),
        updatedAt: kit.updatedAt.toISOString(),
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
