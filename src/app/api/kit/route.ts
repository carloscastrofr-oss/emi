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
import { kitsMock, type Kit } from "@/mocks/kit";
import { successResponse, errorResponse, applyDevDelay } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    // Aplicar delay en modo dev
    await applyDevDelay(request);

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase();

    // Filtrar kits
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
  } catch (error) {
    console.error("Error fetching kits:", error);
    return errorResponse("Error al obtener los kits", 500);
  }
}
