/**
 * @swagger
 * /api/sesion/defaults:
 *   put:
 *     summary: Actualizar cliente y workspace por defecto
 *     description: Actualiza los valores de cliente y workspace por defecto del usuario en su configuración de sesión
 *     tags:
 *       - Sesión
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - defaultClientId
 *               - defaultWorkspaceId
 *             properties:
 *               defaultClientId:
 *                 type: string
 *                 description: ID del cliente por defecto
 *                 example: "client-1"
 *               defaultWorkspaceId:
 *                 type: string
 *                 description: ID del workspace por defecto
 *                 example: "workspace-1"
 *     responses:
 *       200:
 *         description: Defaults actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     defaultClientId:
 *                       type: string
 *                       example: "client-1"
 *                     defaultWorkspaceId:
 *                       type: string
 *                       example: "workspace-1"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               data:
 *                 defaultClientId: "client-1"
 *                 defaultWorkspaceId: "workspace-1"
 *               timestamp: "2024-12-04T12:00:00Z"
 *       400:
 *         description: Error de validación - cliente o workspace no accesible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado - No se proporcionó token o es inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cliente o workspace no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, isDevApiMode, applyDevDelay } from "@/lib/api-utils";
import { validateAuth } from "@/lib/api-auth";

interface UpdateDefaultsRequest {
  defaultClientId: string;
  defaultWorkspaceId: string;
}

export async function PUT(request: NextRequest) {
  try {
    // Aplicar delay en modo dev si es necesario
    await applyDevDelay(request);

    // Si estamos en modo dev API, devolver respuesta mock
    if (isDevApiMode(request)) {
      const mockData = {
        defaultClientId: "client-1",
        defaultWorkspaceId: "workspace-1",
      };
      return successResponse(mockData);
    }

    // Validar el token de autenticación
    const { userId } = await validateAuth(request);

    // Obtener el body de la request
    let body: UpdateDefaultsRequest;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Body inválido. Se esperaba JSON.", 400);
    }

    // Validar que se proporcionaron los campos requeridos
    if (!body.defaultClientId || !body.defaultWorkspaceId) {
      return errorResponse(
        "Faltan campos requeridos: defaultClientId y defaultWorkspaceId son obligatorios.",
        400
      );
    }

    const { defaultClientId, defaultWorkspaceId } = body;

    // Consultar datos desde Prisma
    // Asegurar que DATABASE_URL esté disponible antes de importar Prisma
    if (!process.env.DATABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { config } = require("dotenv");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { resolve } = require("path");
      config({ path: resolve(process.cwd(), ".env.local") });
    }

    // Importación dinámica para evitar problemas de inicialización
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { prisma } = require("@/lib/prisma");

    // 1. Verificar que el usuario tenga acceso al cliente
    const clientAccess = await prisma.userClientAccess.findUnique({
      where: {
        userId_clientId: {
          userId,
          clientId: defaultClientId,
        },
      },
    });

    if (!clientAccess) {
      return errorResponse("No tienes acceso a este cliente.", 403);
    }

    // 2. Verificar que el workspace pertenezca al cliente
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: defaultWorkspaceId,
      },
    });

    if (!workspace) {
      return errorResponse("Workspace no encontrado.", 404);
    }

    if (workspace.clientId !== defaultClientId) {
      return errorResponse("Este workspace no pertenece al cliente seleccionado.", 400);
    }

    // 3. Verificar que el usuario tenga acceso al workspace
    const workspaceAccess = await prisma.userWorkspaceAccess.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: defaultWorkspaceId,
        },
      },
    });

    if (!workspaceAccess) {
      return errorResponse("No tienes acceso a este workspace.", 403);
    }

    // 4. Actualizar o crear UserSessionConfig
    const sessionConfig = await prisma.userSessionConfig.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        defaultClientId,
        defaultWorkspaceId,
      },
      update: {
        defaultClientId,
        defaultWorkspaceId,
      },
    });

    // 5. Retornar los defaults actualizados
    return successResponse({
      defaultClientId: sessionConfig.defaultClientId ?? "",
      defaultWorkspaceId: sessionConfig.defaultWorkspaceId ?? "",
    });
  } catch (error) {
    console.error("Error en el endpoint /api/sesion/defaults:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Error interno del servidor al actualizar defaults",
      500,
      error
    );
  }
}
