
"use server";

import * as XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

const REQUIRED_COLUMNS = ["Feature","User story (short)","Priority","Target Sprint","Max Screens"];

export async function runPredictiveDesign(formData: FormData) {
  const FAIL = (code: string, extra: Record<string, any> = {}) => ({ status: "error", code, ...extra } as const);

  const planningFile = formData.get("planningFile") as File | null;
  const maxScreens = Number(formData.get("maxScreens"));
  const figmaDest = formData.get("figmaDest") as string;

  // 1. Validate file
  if (!planningFile || planningFile.size === 0) {
    return FAIL("EMPTY_FILE");
  }

  const buf = Buffer.from(await planningFile.arrayBuffer());
  const wb = XLSX.read(buf);
  const rows = XLSX.utils.sheet_to_json<any>(
    wb.Sheets[wb.SheetNames[0]], { defval: "" }
  );

  if (rows.length === 0) {
    return FAIL("EMPTY_FILE", { message: "The Excel sheet is empty."});
  }

  // 2. Validate columns
  const cols = Object.keys(rows[0] ?? {});
  const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c));
  if (missing.length > 0) {
    return FAIL("MISSING_COLUMNS", { missing });
  }

  // 3. Setup Gemini
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return FAIL("NO_API_KEY");
  }
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  // 4. Call generateContent
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

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/^```json\n?|```$/g, '').trim();
    const analysis = JSON.parse(responseText || "[]");
    
    // 5. Final check
    if (!Array.isArray(analysis) || analysis.length === 0) {
      return FAIL("EMPTY_ANALYSIS");
    }

    return { status: "ok", figmaDest, maxScreens, analysis } as const;

  } catch (e: any) {
    console.error("Gemini AI failure:", e);
    return FAIL("AI_FAILURE", { message: e.message });
  }
}
