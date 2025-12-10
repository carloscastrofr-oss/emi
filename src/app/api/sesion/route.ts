/**
 * @swagger
 * /api/sesion:
 *   get:
 *     summary: Obtener datos de sesión del usuario
 *     description: Retorna los datos completos de sesión incluyendo usuario, clientes accesibles, workspaces y configuraciones
 *     tags:
 *       - Sesión
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos de sesión obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SessionData'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: "user-123"
 *                   email: "usuario@example.com"
 *                   displayName: "Usuario Ejemplo"
 *                   role: "product_designer"
 *                 clients:
 *                   - id: "client-1"
 *                     name: "Cliente A"
 *                     slug: "cliente-a"
 *                     workspaces:
 *                       - id: "workspace-1"
 *                         name: "Workspace Principal"
 *                         slug: "workspace-principal"
 *                 defaultClient: "client-1"
 *                 defaultWorkspace: "workspace-1"
 *               timestamp: "2024-12-04T12:00:00Z"
 *       401:
 *         description: No autenticado o token inválido
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
 *
 * components:
 *   schemas:
 *     SessionData:
 *       type: object
 *       required:
 *         - user
 *         - clients
 *         - defaultClient
 *         - defaultWorkspace
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/SessionUserData'
 *         clients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ClientWithWorkspaces'
 *         defaultClient:
 *           type: string
 *           nullable: true
 *         defaultWorkspace:
 *           type: string
 *           nullable: true
 *         config:
 *           type: object
 *
 *     SessionUserData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         displayName:
 *           type: string
 *           nullable: true
 *         photoUrl:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [ux_ui_designer, product_designer, product_design_lead, admin, super_admin]
 *         preferences:
 *           type: object
 *           nullable: true
 *         emailVerified:
 *           type: boolean
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ClientWithWorkspaces:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         logoUrl:
 *           type: string
 *           nullable: true
 *         plan:
 *           type: string
 *           enum: [free, pro, enterprise]
 *         settings:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         workspaces:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WorkspaceData'
 *
 *     WorkspaceData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         clientId:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         settings:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse, isDevApiMode, applyDevDelay } from "@/lib/api-utils";
import { AUTH_COOKIE } from "@/lib/auth-cookies";
import type {
  SessionData,
  SessionUserData,
  ClientWithWorkspaces,
  WorkspaceData,
  WorkspaceSettings,
} from "@/types/session";

/**
 * Decodifica un token JWT para obtener el payload (sin verificar la firma)
 * En producción, debería usarse firebase-admin para verificar la firma
 */
function decodeJWT(token: string): { uid?: string; [key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Obtiene el userId del token de Firebase
 */
function getUserIdFromToken(token: string): string | null {
  const decoded = decodeJWT(token);
  return (decoded?.uid as string) || (decoded?.user_id as string) || null;
}

export async function GET(request: NextRequest) {
  try {
    // Aplicar delay en modo dev si es necesario
    await applyDevDelay(request);

    // Obtener token de la cookie
    const authCookie = request.cookies.get(AUTH_COOKIE);
    const token = authCookie?.value;

    if (!token) {
      return errorResponse("No se encontró token de autenticación", 401);
    }

    // Decodificar token para obtener userId
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return errorResponse("Token de autenticación inválido", 401);
    }

    // Si estamos en modo dev API, devolver datos mock
    if (isDevApiMode(request)) {
      const mockData: SessionData = {
        user: {
          id: userId,
          email: "usuario@example.com",
          displayName: "Usuario de Prueba",
          photoUrl: null,
          role: "product_designer",
          preferences: {
            theme: "system",
            language: "es",
            notifications: {
              email: true,
              push: true,
              inApp: true,
            },
          },
          emailVerified: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
        },
        clients: [
          {
            id: "client-1",
            name: "Cliente de Prueba",
            slug: "cliente-prueba",
            logoUrl: undefined,
            plan: "pro",
            settings: {},
            createdAt: new Date(),
            workspaces: [
              {
                id: "workspace-1",
                clientId: "client-1",
                name: "Workspace Principal",
                slug: "workspace-principal",
                description: "Workspace por defecto",
                settings: {},
                createdAt: new Date(),
              },
            ],
          },
        ],
        defaultClient: "client-1",
        defaultWorkspace: "workspace-1",
      } as SessionData;

      return successResponse(mockData);
    }

    // Consultar datos desde Prisma
    // Importación dinámica para evitar problemas de inicialización
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { prisma } = require("@/lib/prisma");

    // 1. Obtener usuario con accesos a clientes
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientAccesses: {
          include: {
            client: true,
          },
        },
        workspaceAccesses: {
          include: {
            workspace: {
              include: {
                client: true,
              },
            },
          },
        },
        sessionConfig: {
          include: {
            defaultClient: true,
            defaultWorkspace: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse("Usuario no encontrado", 404);
    }

    // 2. Formatear datos del usuario
    const userData: SessionUserData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      role: user.role,
      preferences: (user.preferences as unknown) || null,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    // 3. Obtener IDs de clientes a los que tiene acceso
    const accessibleClientIds = new Set(
      user.clientAccesses.map((access: (typeof user.clientAccesses)[0]) => access.clientId)
    );

    // 4. Agrupar workspaces por cliente
    type WorkspaceAccess = (typeof user.workspaceAccesses)[0];
    const workspacesByClient = new Map<string, WorkspaceAccess[]>();
    user.workspaceAccesses.forEach((access: WorkspaceAccess) => {
      const workspace = access.workspace;
      if (accessibleClientIds.has(workspace.clientId)) {
        const existing = workspacesByClient.get(workspace.clientId) || [];
        existing.push(access);
        workspacesByClient.set(workspace.clientId, existing);
      }
    });

    // 5. Formatear clientes con sus workspaces accesibles
    const clients: ClientWithWorkspaces[] = user.clientAccesses.map(
      (access: (typeof user.clientAccesses)[0]) => {
        const client = access.client;
        const workspaceAccesses = workspacesByClient.get(client.id) || [];
        const workspaces: WorkspaceData[] = workspaceAccesses.map((wsAccess: WorkspaceAccess) => ({
          id: wsAccess.workspace.id,
          clientId: wsAccess.workspace.clientId,
          name: wsAccess.workspace.name,
          slug: wsAccess.workspace.slug,
          description: wsAccess.workspace.description || undefined,
          settings: wsAccess.workspace.settings as unknown as WorkspaceSettings | null | undefined,
          createdAt: wsAccess.workspace.createdAt,
        }));

        return {
          id: client.id,
          name: client.name,
          slug: client.slug,
          logoUrl: client.logoUrl ?? undefined,
          plan: client.plan,
          settings: (client.settings as unknown) ?? undefined,
          createdAt: client.createdAt,
          workspaces,
        };
      }
    );

    // 6. Obtener configuraciones por defecto
    const defaultClientId = user.sessionConfig?.defaultClientId || null;
    const defaultWorkspaceId = user.sessionConfig?.defaultWorkspaceId || null;

    // Construir respuesta
    const sessionData: SessionData = {
      user: userData,
      clients,
      defaultClient: defaultClientId,
      defaultWorkspace: defaultWorkspaceId,
    };

    return successResponse(sessionData);
  } catch (error) {
    console.error("Error al obtener datos de sesión:", error);
    return errorResponse("Error al obtener datos de sesión", 500, error);
  }
}
