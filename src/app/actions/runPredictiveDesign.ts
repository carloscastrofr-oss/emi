
"use server";

import * as XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

const REQUIRED_COLUMNS = ["Feature","User story (short)","Priority","Target Sprint","Max Screens"];

// This function is defined at the page level now.
// export const runtime = "nodejs";

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

  // 3. Select Gemini model with fallback
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return FAIL("NO_API_KEY");
  }
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  let modelName: string | undefined;

  try {
    const { models } = await genAI.listModels();
    
    // Prioritize modern, preferred models
    const preferredModels = ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest", "gemini-pro"];
    
    for (const preferred of preferredModels) {
        const found = models.find(m => m.name === `models/${preferred}` && m.supportedGenerationMethods?.includes("generateContent"));
        if (found) {
            modelName = preferred;
            break;
        }
    }

    // If no preferred model is found, find any usable model
    if (!modelName) {
        const usableModel = models.find(m => m.supportedGenerationMethods?.includes("generateContent"));
        if (usableModel) {
             modelName = usableModel.name.split("/").pop();
        }
    }
  } catch (e) {
     console.error("SDK listModels failed. The API key might be invalid or missing permissions.", e);
     // No REST fallback here, as the SDK is the canonical way. Failure here is critical.
  }

  if (!modelName) {
    return FAIL("NO_MODEL_FOUND", { message: "No model supporting 'generateContent' was found for your API key." });
  }

  console.log(`Using model: ${modelName}`);

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
    const model = genAI.getGenerativeModel({ model: modelName });
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
