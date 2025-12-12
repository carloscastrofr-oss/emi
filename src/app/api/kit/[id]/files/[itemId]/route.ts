import { NextRequest } from "next/server";
import { successResponse, errorResponse, isDevApiMode, applyDevDelay } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { validateAuth } from "@/lib/api-auth";
import { ref, deleteObject } from "firebase/storage";
import { storage, isStorageAvailable } from "@/lib/firebase";

/**
 * DELETE /api/kit/[id]/files/[itemId]
 * Elimina un archivo o enlace de un kit
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: kitId, itemId } = await params;
    const isDevMode = isDevApiMode(request);

    // En modo dev, simular eliminación
    if (isDevMode) {
      await applyDevDelay(request);
      return successResponse({ deleted: true }, 200);
    }

    // Validar autenticación
    await validateAuth(request);

    // Verificar que el kit existe
    const kit = await prisma.kit.findUnique({
      where: { id: kitId },
    });

    if (!kit) {
      return errorResponse("Kit no encontrado", 404);
    }

    // Buscar el archivo o enlace
    const [file, link] = await Promise.all([
      prisma.kitFile.findUnique({
        where: { id: itemId, kitId },
      }),
      prisma.kitLink.findUnique({
        where: { id: itemId, kitId },
      }),
    ]);

    if (!file && !link) {
      return errorResponse("Archivo o enlace no encontrado", 404);
    }

    // Si es un archivo, eliminar de Firebase Storage primero
    if (file) {
      try {
        // Extraer la ruta del archivo de la URL
        // La URL de Firebase Storage tiene el formato:
        // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token=...
        const fileUrl = file.fileUrl;
        const urlMatch = fileUrl.match(/\/o\/([^?]+)/);

        if (urlMatch && urlMatch[1] && isStorageAvailable() && storage) {
          // Decodificar la ruta (Firebase Storage codifica los espacios y caracteres especiales)
          const encodedPath = urlMatch[1];
          const decodedPath = decodeURIComponent(encodedPath);

          // Crear referencia al archivo y eliminarlo
          const fileRef = ref(storage, decodedPath);
          await deleteObject(fileRef);
        }
      } catch (storageError) {
        // Si falla la eliminación del storage, loguear pero continuar
        // (el archivo puede no existir o ya haber sido eliminado)
        console.warn("Error eliminando archivo de Firebase Storage:", storageError);
        // No retornar error aquí, continuar con la eliminación del registro
      }

      // Eliminar el registro de la base de datos
      await prisma.kitFile.delete({
        where: { id: itemId },
      });

      return successResponse({ deleted: true, type: "file" }, 200);
    }

    // Si es un enlace, solo eliminar el registro
    if (link) {
      await prisma.kitLink.delete({
        where: { id: itemId },
      });

      return successResponse({ deleted: true, type: "link" }, 200);
    }

    return errorResponse("Error al eliminar el elemento", 500);
  } catch (error) {
    console.error("Error deleting kit item:", error);
    return errorResponse("Error al eliminar el elemento", 500);
  }
}
