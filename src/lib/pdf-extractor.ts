/**
 * Módulo para extraer texto de PDFs
 * Este módulo se ejecuta en Node.js puro (no empaquetado por webpack)
 * Se usa desde API routes que tienen acceso directo a Node.js
 */

/**
 * Extrae texto de un PDF usando pdfreader (más simple y estable en Node.js)
 * Esta función debe ejecutarse en un contexto de Node.js puro (API route)
 */
export async function extractPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PdfReader = require("pdfreader");

      const items: Array<{ y: number; text: string }> = [];
      let fullText = "";

      const reader = new PdfReader.PdfReader();

      reader.parseBuffer(buffer, (err: Error | null, item: any) => {
        if (err) {
          console.error("Error parsing PDF with pdfreader:", err);
          reject(err);
          return;
        }

        if (!item) {
          // Fin del documento - ordenar y concatenar texto
          const sortedItems = items.sort((a, b) => {
            // Ordenar por posición Y (vertical), luego mantener orden de lectura
            if (Math.abs(a.y - b.y) > 1) {
              return a.y - b.y;
            }
            return 0;
          });

          fullText = sortedItems.map((item) => item.text).join(" ");

          const extractedText = fullText.trim();
          console.log("[pdf-extractor] Extracted text length:", extractedText.length);

          if (extractedText.length < 50) {
            reject(new Error("PDF sin texto extraíble (puede ser escaneado)"));
            return;
          }

          resolve(extractedText);
          return;
        }

        // Agregar texto a la lista
        if (item.text) {
          items.push({
            y: item.y || 0,
            text: item.text,
          });
        }
      });
    } catch (error: any) {
      console.error("Error extracting PDF text:", error);
      reject(new Error(`Error al extraer texto del PDF: ${error.message}`));
    }
  });
}
