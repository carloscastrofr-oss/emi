/**
 * Seeds para la base de datos
 * Este archivo se ejecuta con: npm run db:seed
 *
 * Por ahora está vacío, pero puedes agregar datos iniciales aquí
 * cuando lo necesites.
 *
 * Nota: El cliente de Prisma se genera con `npm run db:generate`
 * o automáticamente con `npm run db:migrate:dev`
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Ejecutando seeds...");

  // Ejemplo: Crear kits iniciales
  // const kits = await prisma.kit.createMany({
  //   data: [
  //     {
  //       title: "Kit de Ejemplo",
  //       description: "Descripción del kit",
  //       icon: "Package",
  //       category: "development",
  //       tags: ["ejemplo", "test"],
  //     },
  //   ],
  // });

  console.log("✓ Seeds ejecutados exitosamente");
}

main()
  .catch((e) => {
    console.error("Error ejecutando seeds:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
