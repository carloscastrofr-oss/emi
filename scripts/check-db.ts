import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { resolve } from "path";

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function checkDB() {
  try {
    // Verificar que podemos conectar
    await prisma.$connect();
    console.log("✅ Conexión exitosa a la base de datos\n");

    // Verificar tablas usando raw query
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;

    console.log("📊 Tablas encontradas:");
    tables.forEach((t) => console.log(`  - ${t.tablename}`));
    console.log("");

    // Verificar modelos principales
    const userCount = await prisma.user.count().catch(() => 0);
    const clientCount = await prisma.client.count().catch(() => 0);
    const workspaceCount = await prisma.workspace.count().catch(() => 0);
    const kitCount = await prisma.kit.count().catch(() => 0);

    console.log("📈 Recuento de registros:");
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Clients: ${clientCount}`);
    console.log(`  - Workspaces: ${workspaceCount}`);
    console.log(`  - Kits: ${kitCount}`);

    // Verificar estructura de User
    const userSample = await prisma.user.findFirst().catch(() => null);
    if (userSample) {
      console.log("\n👤 Ejemplo de usuario encontrado:");
      console.log(`  ID: ${userSample.id}`);
      console.log(`  Email: ${userSample.email}`);
      console.log(`  Super Admin: ${userSample.superAdmin}`);
    }

    // Verificar índices importantes
    console.log("\n🔍 Verificando estructura...");
    const userTable = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `;
    console.log("  Columnas en tabla 'users':");
    userTable.forEach((col) => console.log(`    - ${col.column_name} (${col.data_type})`));

    await prisma.$disconnect();
    console.log("\n✅ Verificación completada exitosamente");
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkDB();
