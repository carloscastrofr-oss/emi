/**
 * Script para poblar datos de usuario de ejemplo
 * Crea usuario, clientes, workspaces y relaciones necesarias
 */

// Cargar variables de entorno ANTES de importar Prisma
import { config } from "dotenv";
import { resolve } from "path";

// Cargar .env.local primero
config({ path: resolve(process.cwd(), ".env.local") });

// Asegurar DATABASE_URL
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://emi_user:emi_dev_password@localhost:5432/emi_dev";
}

// Ahora importar Prisma
import { PrismaClient, Role, ClientPlan } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUser() {
  try {
    const userEmail = "carloscastro.fr@multiplica.com";
    const userRole: Role = "product_designer";

    console.log("🌱 Iniciando seed de usuario...\n");

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    let userId: string;

    if (existingUser) {
      console.log(`⚠️  Usuario con email ${userEmail} ya existe. Usando ID existente.`);
      userId = existingUser.id;

      // Actualizar rol si es necesario
      if (existingUser.role !== userRole) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: userRole },
        });
        console.log(`✅ Rol actualizado a: ${userRole}`);
      }
    } else {
      // Generar un ID compatible con Firebase UID (formato similar)
      // Firebase UIDs son strings de ~28 caracteres
      userId = `user_${crypto.randomUUID().replace(/-/g, "").substring(0, 20)}`;

      // Crear usuario
      await prisma.user.create({
        data: {
          id: userId,
          email: userEmail,
          displayName: "Carlos Castro",
          photoUrl: null,
          role: userRole,
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
        },
      });
      console.log(`✅ Usuario creado: ${userEmail} (ID: ${userId})`);
    }

    // Crear clientes de ejemplo
    console.log("\n📦 Creando clientes...");

    const clients = [
      {
        id: `client_${crypto.randomUUID().replace(/-/g, "").substring(0, 20)}`,
        name: "Multiplica",
        slug: "multiplica",
        logoUrl: null,
        plan: "enterprise" as ClientPlan,
        settings: {
          allowedDomains: ["multiplica.com", "@multiplica.com"],
          defaultRole: "product_designer",
          features: ["advanced_analytics", "team_collaboration", "custom_branding"],
          branding: {
            primaryColor: "#0066CC",
          },
        },
      },
      {
        id: `client_${crypto.randomUUID().replace(/-/g, "").substring(0, 20)}`,
        name: "Design Studio",
        slug: "design-studio",
        logoUrl: null,
        plan: "pro" as ClientPlan,
        settings: {
          allowedDomains: ["designstudio.com"],
          defaultRole: "product_designer",
          features: ["team_collaboration"],
        },
      },
    ];

    const createdClients = [];

    for (const clientData of clients) {
      const existingClient = await prisma.client.findUnique({
        where: { slug: clientData.slug },
      });

      if (existingClient) {
        console.log(`  ⚠️  Cliente "${clientData.name}" ya existe. Usando existente.`);
        createdClients.push(existingClient);
      } else {
        const client = await prisma.client.create({
          data: clientData,
        });
        console.log(`  ✅ Cliente creado: ${client.name} (${client.slug})`);
        createdClients.push(client);
      }
    }

    // Crear workspaces para cada cliente
    console.log("\n🏢 Creando workspaces...");

    if (createdClients.length === 0) {
      throw new Error("No se crearon clientes. No se pueden crear workspaces.");
    }

    const workspaces = [
      {
        clientId: createdClients[0]!.id,
        name: "Proyecto Principal",
        slug: "proyecto-principal",
        description: "Workspace principal para el proyecto de Multiplica",
        settings: {
          features: ["component_library", "design_tokens"],
        },
      },
      {
        clientId: createdClients[0]!.id,
        name: "Proyecto Beta",
        slug: "proyecto-beta",
        description: "Workspace para funcionalidades en beta",
        settings: {
          features: ["experimental_features"],
        },
      },
      {
        clientId: createdClients[1]?.id,
        name: "Design System",
        slug: "design-system",
        description: "Sistema de diseño centralizado",
        settings: {
          features: ["component_library"],
        },
      },
    ];

    const createdWorkspaces = [];

    for (const workspaceData of workspaces) {
      if (!workspaceData.clientId) continue;

      const existingWorkspace = await prisma.workspace.findUnique({
        where: {
          clientId_slug: {
            clientId: workspaceData.clientId,
            slug: workspaceData.slug,
          },
        },
      });

      if (existingWorkspace) {
        console.log(`  ⚠️  Workspace "${workspaceData.name}" ya existe. Usando existente.`);
        createdWorkspaces.push(existingWorkspace);
      } else {
        const workspace = await prisma.workspace.create({
          data: {
            clientId: workspaceData.clientId,
            name: workspaceData.name,
            slug: workspaceData.slug,
            description: workspaceData.description,
            settings: workspaceData.settings,
          },
        });
        console.log(`  ✅ Workspace creado: ${workspace.name} (${workspace.slug})`);
        createdWorkspaces.push(workspace);
      }
    }

    // Crear accesos de usuario a clientes
    console.log("\n🔐 Creando accesos a clientes...");

    for (const client of createdClients) {
      const existingAccess = await prisma.userClientAccess.findUnique({
        where: {
          userId_clientId: {
            userId,
            clientId: client.id,
          },
        },
      });

      if (!existingAccess) {
        await prisma.userClientAccess.create({
          data: {
            userId,
            clientId: client.id,
            role: userRole,
          },
        });
        console.log(`  ✅ Acceso creado para cliente: ${client.name}`);
      } else {
        console.log(`  ⚠️  Acceso ya existe para cliente: ${client.name}`);
      }
    }

    // Crear accesos de usuario a workspaces
    console.log("\n🔐 Creando accesos a workspaces...");

    for (const workspace of createdWorkspaces) {
      const existingAccess = await prisma.userWorkspaceAccess.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: workspace.id,
          },
        },
      });

      if (!existingAccess) {
        await prisma.userWorkspaceAccess.create({
          data: {
            userId,
            workspaceId: workspace.id,
            role: userRole,
          },
        });
        console.log(`  ✅ Acceso creado para workspace: ${workspace.name}`);
      } else {
        console.log(`  ⚠️  Acceso ya existe para workspace: ${workspace.name}`);
      }
    }

    // Crear configuración de sesión por defecto
    console.log("\n⚙️  Configurando sesión por defecto...");

    const defaultClient = createdClients[0];
    if (!defaultClient) {
      throw new Error("No hay cliente por defecto disponible");
    }

    const defaultWorkspace = createdWorkspaces.find((w) => w.clientId === defaultClient.id);

    const existingConfig = await prisma.userSessionConfig.findUnique({
      where: { userId },
    });

    if (!existingConfig) {
      await prisma.userSessionConfig.create({
        data: {
          userId,
          defaultClientId: defaultClient.id,
          defaultWorkspaceId: defaultWorkspace?.id || null,
        },
      });
      console.log(`  ✅ Configuración de sesión creada`);
      console.log(`     Cliente por defecto: ${defaultClient.name}`);
      if (defaultWorkspace) {
        console.log(`     Workspace por defecto: ${defaultWorkspace.name}`);
      }
    } else {
      // Actualizar si ya existe
      await prisma.userSessionConfig.update({
        where: { userId },
        data: {
          defaultClientId: defaultClient.id,
          defaultWorkspaceId: defaultWorkspace?.id || null,
        },
      });
      console.log(`  ✅ Configuración de sesión actualizada`);
    }

    // Resumen final
    console.log("\n" + "=".repeat(50));
    console.log("✅ Seed completado exitosamente!");
    console.log("=".repeat(50));
    console.log(`\n📊 Resumen:`);
    console.log(`   Usuario: ${userEmail}`);
    console.log(`   ID: ${userId}`);
    console.log(`   Rol: ${userRole}`);
    console.log(`   Clientes: ${createdClients.length}`);
    console.log(`   Workspaces: ${createdWorkspaces.length}`);
    console.log(`\n💡 Puedes usar este usuario para probar el endpoint /api/sesion\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("\n❌ Error durante el seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

seedUser();
