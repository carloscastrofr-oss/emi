
'use server';
import * as XLSX from 'xlsx';
import { GoogleGenerativeAI } from '@google/generative-ai';

const REQUIRED_COLUMNS = ['Feature', 'User story (short)', 'Priority', 'Target Sprint', 'Max Screens'];

const DS_COMPONENTS_LIST = [
  'button-primary', 'button-secondary', 'button-destructive',
  'input-text', 'input-password', 'textarea', 'checkbox', 'radio-group',
  'select', 'label', 'form-item',
  'card', 'card-header', 'card-content', 'card-footer',
  'dialog', 'alert-dialog', 'sheet', 'popover',
  'avatar', 'badge', 'progress', 'skeleton',
  'table', 'table-header', 'table-row', 'table-cell',
  'tabs', 'accordion', 'collapsible',
  'icon-success', 'icon-error', 'icon-warning', 'icon-info'
];


const PROMPT_TEMPLATE = (rowsJson: string, dsList: string[]) => `
Eres un **equipo multidisciplinario** (PM, UX Lead, UI Designer, Front-End, Research) trabajando
en un Design System. Debes analizar el planning y devolver:

───────────────────
PASO 1 · ESTRATEGIA (en español)
Para CADA feature:
• "enunciadoProblema" → 1 frase concisa
• "usuariosObjetivo"  → bullets (personas, segmentos, accesibilidad)
• "propuestaValor"    → máx 2 frases
• "casosDeUso"        → lista exhaustiva: flujo principal, alternos, errores, estados vacíos,
                        mobile first, accesibilidad (WCAG AA), edge cases
• "exitosClaves"      → 2-3 KPIs (métrica + definición)
• "principiosDiseno"  → 3 bullets alineados al DS
• "riesgos"           → 1-2 bullets (técnicos o del producto)

PASO 2 · DISEÑO (Design Pack)
  {
    "frameName": "<Feature>/<Pantalla>",
    "descripcion": "…",
    "components": ["button-primary", …]   // solo de la lista DS,
    "width": 1440,
    "height": 1024
  }
• Incluye UNA pantalla por **cada caso de uso** identificado (máx el campo “Max Screens”).
• Si es flujo móvil añade campo "\\"mobile\\": true" y usa width 375 × height 812.

Formato final → JSON estricto:
[
  {
    "feature": "…",
    "estrategia": { … },
    "designPack": { "frames": [ … ] }
  }
]

JSON de entrada:
${rowsJson}

Lista de componentes DS válidos:
${JSON.stringify(dsList)}
`.trim();


export async function runPredictiveDesign(formData: FormData) {
  const FAIL = (code: string, extra: Record<string, any> = {}) => ({ status: 'error', code, ...extra } as const);

  const planningFile = formData.get('planningFile') as File | null;
  
  if (!planningFile || planningFile.size === 0) {
    return FAIL('EMPTY_FILE');
  }

  const buf = Buffer.from(await planningFile.arrayBuffer());
  const wb = XLSX.read(buf);
  const rows = XLSX.utils.sheet_to_json<any>(
    wb.Sheets[wb.SheetNames[0]], { defval: '' }
  );

  if (rows.length === 0) {
    return FAIL('EMPTY_FILE', { message: 'The Excel sheet is empty.' });
  }

  const cols = Object.keys(rows[0] ?? {});
  const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c));
  if (missing.length > 0) {
    return FAIL('MISSING_COLUMNS', { missing });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return FAIL('NO_API_KEY');
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const prompt = PROMPT_TEMPLATE(JSON.stringify(rows, null, 2), DS_COMPONENTS_LIST);
    
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    const firstBracket = responseText.indexOf('[');
    const lastBracket = responseText.lastIndexOf(']');
    
    if (firstBracket === -1 || lastBracket === -1) {
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if(firstBrace !== -1 && lastBrace !== -1) {
            responseText = `[${responseText.substring(firstBrace, lastBrace + 1)}]`;
        } else {
             return FAIL('EMPTY_ANALYSIS', { message: 'No valid JSON array or object found in AI response.' });
        }
    } else {
        responseText = responseText.substring(firstBracket, lastBracket + 1);
    }
    
    const analysis = JSON.parse(responseText);

    if (!Array.isArray(analysis) || analysis.length === 0) {
      return FAIL('EMPTY_ANALYSIS', { message: 'Analysis result is not a non-empty array.' });
    }

    return { status: 'ok', analysis } as const;

  } catch (e: any) {
    console.error('Gemini AI failure or JSON parsing error:', e);
    return FAIL('AI_FAILURE', { message: e.message });
  }
}
