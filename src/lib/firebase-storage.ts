/**
 * Helpers para Firebase Storage
 * Funciones para subir y gestionar archivos en Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL, UploadResult } from "firebase/storage";
import { storage, isStorageAvailable } from "@/lib/firebase";

/**
 * Sube un archivo a Firebase Storage
 * @param file - El archivo a subir
 * @param path - Ruta donde se guardará el archivo (ej: "kits/kit-id/file-name.pdf")
 * @returns URL pública del archivo subido
 */
export async function uploadFile(
  file: File,
  path: string
): Promise<{ url: string; size: number; mimeType: string }> {
  if (!isStorageAvailable() || !storage) {
    throw new Error("Firebase Storage no está disponible. Verifica la configuración.");
  }

  try {
    // Crear referencia al archivo
    const storageRef = ref(storage, path);

    // Subir el archivo
    const snapshot: UploadResult = await uploadBytes(storageRef, file);

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      size: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw new Error(
      error instanceof Error
        ? `Error al subir archivo: ${error.message}`
        : "Error desconocido al subir archivo"
    );
  }
}

/**
 * Genera una ruta única para un archivo de kit
 * @param kitId - ID del kit
 * @param fileName - Nombre original del archivo
 * @returns Ruta única para el archivo
 */
export function generateKitFilePath(kitId: string, fileName: string): string {
  // Limpiar el nombre del archivo (remover caracteres especiales)
  const cleanFileName = fileName.replaceAll(/[^a-zA-Z0-9.-]/g, "_");
  // Agregar timestamp para evitar colisiones
  const timestamp = Date.now();
  return `kits/${kitId}/${timestamp}_${cleanFileName}`;
}
