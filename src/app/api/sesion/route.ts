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
 *           nullable: true
 *           enum: [ux_ui_designer, product_designer, product_design_lead, admin]
 *           description: Rol activo del usuario. null si es superAdmin (acceso total)
 *         superAdmin:
 *           type: boolean
 *           description: Indica si el usuario es superAdmin (acceso total al sistema)
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
import { validateAuth } from "@/lib/api-auth";
import { getActiveRoleFromUser } from "@/lib/session-helpers";
import type {
  SessionData,
  SessionUserData,
  ClientWithWorkspaces,
  WorkspaceData,
  WorkspaceSettings,
} from "@/types/session";

export async function GET(request: NextRequest) {
  const requestId = `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[API /sesion] 🟢 GET request iniciado (${requestId})`, {
    url: request.url,
    method: request.method,
    headers: {
      cookie: request.headers.get("cookie") ? "present" : "missing",
      "user-agent": request.headers.get("user-agent")?.substring(0, 50) || "N/A",
    },
  });

  try {
    // Aplicar delay en modo dev si es necesario
    await applyDevDelay(request);

    // IMPORTANTE: Verificar modo dev API ANTES de validar autenticación
    // En modo dev, no necesitamos token válido, usamos datos mock
    if (isDevApiMode(request)) {
      console.log(`[API /sesion] 🟡 Modo dev API activo (${requestId})`);
      // En modo dev, usar userId del token si existe (puede estar expirado)
      // o usar un userId mock
      let mockUserId = "mock-user-id";
      try {
        const auth = await validateAuth(request);
        mockUserId = auth.userId;
      } catch {
        // Si el token no es válido, usar userId mock (normal en modo dev)
        mockUserId = "mock-user-id";
      }
      const mockData: SessionData = {
        user: {
          id: mockUserId,
          email: "usuario@example.com",
          displayName: "Usuario de Prueba",
          photoUrl: null,
          role: "product_designer",
          superAdmin: false, // Mock data siempre tiene superAdmin false
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

      console.log(`[API /sesion] ✅ Retornando datos mock (${requestId})`);
      return successResponse(mockData);
    }

    // Si NO estamos en modo dev, validar autenticación estrictamente
    console.log(`[API /sesion] 🔐 Validando autenticación (${requestId})`);
    let auth;
    try {
      auth = await validateAuth(request);
      console.log(`[API /sesion] ✅ Autenticación válida (${requestId})`, {
        userId: auth.userId,
      });
    } catch (error: any) {
      const errorMessage = error.message || "Token de autenticación inválido";
      console.log(`[API /sesion] ❌ Error de autenticación (${requestId}):`, errorMessage);
      return errorResponse(errorMessage, 401);
    }

    const { userId } = auth;
    console.log(`[API /sesion] 🔍 Consultando datos del usuario (${requestId})`, { userId });

    // Consultar datos desde Prisma
    // Importación dinámica para evitar problemas de inicialización
    // Asegurar que DATABASE_URL esté disponible antes de importar Prisma
    if (!process.env.DATABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { config } = require("dotenv");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { resolve } = require("path");
      config({ path: resolve(process.cwd(), ".env.local") });
    }

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

    // 2. Obtener configuraciones por defecto (necesario para calcular rol activo)
    const defaultClientId = user.sessionConfig?.defaultClientId || null;
    const defaultWorkspaceId = user.sessionConfig?.defaultWorkspaceId || null;

    // 3. Calcular el rol activo según la prioridad: superAdmin > workspace role > client role
    // Nota: Si la migración no se ha ejecutado, user.superAdmin puede ser undefined/null, usar false como fallback
    const userSuperAdmin = user.superAdmin ?? false;

    const activeRole = getActiveRoleFromUser(
      {
        superAdmin: userSuperAdmin,
        clientAccesses: user.clientAccesses.map((access: (typeof user.clientAccesses)[0]) => ({
          clientId: access.clientId,
          role: access.role,
        })),
        workspaceAccesses: user.workspaceAccesses.map(
          (access: (typeof user.workspaceAccesses)[0]) => ({
            workspaceId: access.workspaceId,
            role: access.role,
          })
        ),
      },
      defaultClientId,
      defaultWorkspaceId
    );

    // 4. Formatear datos del usuario
    const userData: SessionUserData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      role: activeRole, // Rol activo calculado (puede ser null si es superAdmin)
      superAdmin: userSuperAdmin,
      preferences: (user.preferences as unknown) || null,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    // 5. Obtener IDs de clientes a los que tiene acceso
    const accessibleClientIds = new Set(
      user.clientAccesses.map((access: (typeof user.clientAccesses)[0]) => access.clientId)
    );

    // 6. Agrupar workspaces por cliente
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

    // 7. Formatear clientes con sus workspaces accesibles
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

    // 8. Construir respuesta
    const sessionData: SessionData = {
      user: userData,
      clients,
      defaultClient: defaultClientId,
      defaultWorkspace: defaultWorkspaceId,
    };

    console.log(`[API /sesion] ✅ Retornando datos de sesión exitosamente (${requestId})`, {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      superAdmin: userData.superAdmin,
      clientsCount: clients.length,
    });

    return successResponse(sessionData);
  } catch (error) {
    console.error(`[API /sesion] ❌ Error al obtener datos de sesión (${requestId}):`, error);
    return errorResponse("Error al obtener datos de sesión", 500, error);
  }
}
