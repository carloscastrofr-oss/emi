
"use server";

import * as XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

const REQUIRED_COLUMNS = ["Feature", "User story (short)", "Priority", "Target Sprint", "Max Screens"];

export async function runPredictiveDesign(formData: FormData) {
  const FAIL = (code: string, extra: Record<string, any> = {}) => ({ status: "error", code, ...extra } as const);

  const planningFile = formData.get("planningFile") as File | null;
  const maxScreens = Number(formData.get("maxScreens"));
  const figmaDest = formData.get("figmaDest") as string;

  if (!planningFile || planningFile.size === 0) {
    return FAIL("EMPTY_FILE");
  }

  const buf = Buffer.from(await planningFile.arrayBuffer());
  const wb = XLSX.read(buf);
  const rows = XLSX.utils.sheet_to_json<any>(
    wb.Sheets[wb.SheetNames[0]], { defval: "" }
  );

  if (rows.length === 0) {
    return FAIL("EMPTY_FILE", { message: "The Excel sheet is empty." });
  }

  const cols = Object.keys(rows[0] ?? {});
  const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c));
  if (missing.length > 0) {
    return FAIL("MISSING_COLUMNS", { missing });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return FAIL("NO_API_KEY");
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
        Eres Product/UX Strategist. Para CADA fila del siguiente JSON
        devuelve un array de objetos JSON, sin texto adicional. Cada objeto debe tener esta estructura:
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
    let responseText = result.response.text();
    
    // Robust JSON extraction
    const firstBracket = responseText.indexOf('[');
    const lastBracket = responseText.lastIndexOf(']');
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');

    let jsonStr = '';
    
    if (firstBracket !== -1 && lastBracket !== -1) {
        // Handle array response
        jsonStr = responseText.substring(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1) {
        // Handle single object response
        jsonStr = responseText.substring(firstBrace, lastBrace + 1);
    } else {
        return FAIL("EMPTY_ANALYSIS", { message: "No valid JSON structure found in AI response." });
    }
    
    const analysis = JSON.parse(jsonStr);

    if (!Array.isArray(analysis) || analysis.length === 0) {
      return FAIL("EMPTY_ANALYSIS", { message: "Analysis result is not a non-empty array." });
    }

    return { status: "ok", figmaDest, maxScreens, analysis } as const;

  } catch (e: any) {
    console.error("Gemini AI failure or JSON parsing error:", e);
    return FAIL("AI_FAILURE", { message: e.message });
  }
}
