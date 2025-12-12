/**
 * Utilidades para el visor de archivos
 */

export type FileTypeCategory = "pdf" | "image";

/**
 * Tipos MIME soportados para preview
 */
const PREVIEWABLE_MIME_TYPES = {
  pdf: ["application/pdf"],
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
} as const;

/**
 * Verifica si un archivo es compatible con el visor de preview
 * @param mimeType - Tipo MIME del archivo
 * @returns true si el archivo puede ser previsualizado
 */
export function isPreviewableFile(mimeType?: string | null): boolean {
  if (!mimeType) return false;

  const normalizedMimeType = mimeType.toLowerCase().trim();

  return (
    PREVIEWABLE_MIME_TYPES.pdf.includes(
      normalizedMimeType as (typeof PREVIEWABLE_MIME_TYPES.pdf)[number]
    ) ||
    PREVIEWABLE_MIME_TYPES.image.includes(
      normalizedMimeType as (typeof PREVIEWABLE_MIME_TYPES.image)[number]
    )
  );
}

/**
 * Categoriza el tipo de archivo
 * @param mimeType - Tipo MIME del archivo
 * @returns Categoría del archivo ('pdf' | 'image') o null si no es compatible
 */
export function getFileTypeCategory(mimeType?: string | null): FileTypeCategory | null {
  if (!mimeType) return null;

  const normalizedMimeType = mimeType.toLowerCase().trim();

  if (
    PREVIEWABLE_MIME_TYPES.pdf.includes(
      normalizedMimeType as (typeof PREVIEWABLE_MIME_TYPES.pdf)[number]
    )
  ) {
    return "pdf";
  }

  if (
    PREVIEWABLE_MIME_TYPES.image.includes(
      normalizedMimeType as (typeof PREVIEWABLE_MIME_TYPES.image)[number]
    )
  ) {
    return "image";
  }

  return null;
}
