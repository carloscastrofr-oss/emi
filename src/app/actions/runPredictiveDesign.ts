
"use server";

import * as XLSX from "xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

const REQUIRED_COLUMNS = ["Feature", "User story (short)", "Priority", "Target Sprint", "Max Screens"];

// Mock list of Design System components
const DS_COMPONENTS_LIST = [
    "button-primary", "button-secondary", "button-destructive",
    "input-text", "input-password", "textarea", "checkbox", "radio-group",
    "select", "label", "form-item",
    "card", "card-header", "card-content", "card-footer",
    "dialog", "alert-dialog", "sheet", "popover",
    "avatar", "badge", "progress", "skeleton",
    "table", "table-header", "table-row", "table-cell",
    "tabs", "accordion", "collapsible",
    "icon-success", "icon-error", "icon-warning", "icon-info"
];


function buildPrompt(rows: any[], components: string[]): string {
    return `
You are a cross-functional squad (PM, UX Lead, UI Designer, Frontend, Research).
Your task:

STEP 1 — PRODUCT & DESIGN STRATEGY
For EACH feature in the JSON below, produce a concise strategy doc with these exact keys:
• "problemStatement" (1 frase)
• "targetUsers" (bullets, incl. personas if given)
• "valueProposition" (1-2 frases)
• "successMetrics" (2-3 KPIs)
• "designPrinciples" (3 bullets)
• "risks" (1-2 bullets)

STEP 2 — DESIGN PACK (for Figma)
Return an array “frames” where every item has these exact keys:
  {
    "frameName": "<Feature> / <Screen>",
    "description": "…",             // shown in Figma note
    "components": ["button-primary", …], // DS tokens
    "width": 1440,
    "height": 1024
  }

Rules:
• Max journey steps: 8 • Max frames = field “Max Screens” OR 8
• Use ONLY components that exist in our DS (list provided at end).
• Answer STRICTLY in valid JSON for each feature, as an array of objects like:
  [{
    "feature": "...",
    "strategy": { … },
    "designPack": { "frames":[ … ] }
  }]

JSON input:
${JSON.stringify(rows, null, 2)}

Design System components:
${JSON.stringify(components)}
    `.trim();
}


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

    const prompt = buildPrompt(rows, DS_COMPONENTS_LIST);
    
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    const firstBracket = responseText.indexOf('[');
    const lastBracket = responseText.lastIndexOf(']');
    
    if (firstBracket === -1 || lastBracket === -1) {
        return FAIL("EMPTY_ANALYSIS", { message: "No valid JSON array found in AI response." });
    }

    const jsonStr = responseText.substring(firstBracket, lastBracket + 1);
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
