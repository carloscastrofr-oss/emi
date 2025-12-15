import { NextRequest, NextResponse } from "next/server";

/**
 * API route para extraer texto de PDFs
 * Se ejecuta en Node.js puro (sin webpack), por lo que las librerías de PDF funcionan correctamente
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extraer texto usando la función compartida (funciona en Node.js puro)
    const { extractPdfTextFromBuffer } = await import("@/lib/pdf-extractor");
    const text = await extractPdfTextFromBuffer(buffer);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error in PDF extraction API:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
  }
}
