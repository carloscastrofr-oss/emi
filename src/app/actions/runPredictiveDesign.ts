
"use server";
export const runtime = "nodejs";

import * as XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

const REQUIRED_COLUMNS = ["Feature","User story (short)","Priority","Target Sprint","Max Screens"];

export async function runPredictiveDesign(formData: FormData) {
  const planningFile = formData.get("planningFile") as File | null;
  const maxScreens = Number(formData.get("maxScreens"));
  const figmaDest = formData.get("figmaDest") as string;

  /* 1 · Validación de archivo */
  if (!planningFile || planningFile.size === 0) {
    return { status:"error", code:"EMPTY_FILE" } as const;
  }

  /* 2 · Parse XLS */
  const buf = Buffer.from(await planningFile.arrayBuffer());
  const wb  = XLSX.read(buf);
  const rows = XLSX.utils.sheet_to_json<any>(
    wb.Sheets[wb.SheetNames[0]], { defval:"" }
  );

  if (rows.length === 0) {
    return { status: "error", code: "EMPTY_SHEET" } as const;
  }

  /* 3 · Validar columnas */
  const cols = Object.keys(rows[0] ?? {});
  const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c));
  if (missing.length > 0) {
    return { status:"error", code:"MISSING_COLUMNS", missing } as const;
  }

  /* 4 · Analizar con Gemini Pro */
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no está configurada en el entorno.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model:"gemini-pro" });

    const prompt = `
      Eres Product/UX Strategist. Para CADA fila del siguiente JSON
      devuelve un objeto:
        {
          "feature": "...",
          "journeySteps":[{"id": 1, "title": "..."}],
          "wireframes":[{"screen": "...", "title": "...", "desc": "..."}],
          "dsComponents":["button-primary", "..."]
        }
      JSON:
      ${JSON.stringify(rows, null, 2)}
    `.trim();

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to fix incomplete JSON that Gemini sometimes returns
    const cleanedJsonString = responseText.replace(/^```json\n|```$/g, '').trim();

    const analysis = JSON.parse(cleanedJsonString);

    if (!analysis || (Array.isArray(analysis) && analysis.length === 0)) {
        return { status: "error", code: "AI_FAILURE", message: "La IA no generó un análisis válido."} as const;
    }

    return { status:"ok", figmaDest, maxScreens, analysis } as const;

  } catch (e:any) {
    console.error("Error en Gemini:", e);
    return { status:"error", code:"AI_FAILURE", message: e.message } as const;
  }
}

