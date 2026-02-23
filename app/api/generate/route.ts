// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";
import { correctGeometry } from "../../../lib/geometry/correct";
import { renderSVG } from "../../../lib/render/svg";
import { buildSystemPrompt } from "../../../prompts/system-prompt"; // NEW IMPORT

type GenerateRequest = {
  prompt: string;
  type: "icon" | "illustration";
  style?: string;
  intent?: string;
};

export async function POST(request: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body: GenerateRequest = await request.json();
    const { prompt, type, style, intent } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers,
      });
    }

    const generationType: GenerationType =
      type === "icon" ? GenerationType.ICON : GenerationType.ILLUSTRATION;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

    // Call AI orchestrator with new pattern-aware system
    const vector = await callAIOrchestrator(
      prompt,
      apiKey,
      type,
      style,
      intent
    );

    // Ensure elements exist
    vector.elements = Array.isArray(vector.elements) ? vector.elements : [];

    if (vector.elements.length === 0) {
      vector.elements.push({
        type: "rect",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: "#cccccc",
      });
    }

    // Apply geometry correction
    const corrected = correctGeometry(vector);
    vector.elements = corrected.elements;

    // Run quality checks
    const warnings = runQualityChecks(vector, generationType);

    // Render SVG
    const svgOutput = renderSVG(vector);

    return NextResponse.json({
      success: true,
      vector,
      svg: svgOutput ?? "<svg></svg>",
      warnings,
    });
  } catch (err: any) {
    console.error("Generation error:", err);
    return NextResponse.json({
      success: false,
      error: err.message ?? "Generation failed",
    });
  }
}

// ---------------- AI Orchestrator ----------------

async function callAIOrchestrator(
  prompt: string,
  apiKey: string,
  type?: string,
  style?: string,
  intent?: string
): Promise<any> {

  const isOrganic =
    style === "organic" ||
    intent === "abstract" ||
    intent === "conceptual" ||
    type === "illustration";

  console.log("🎨 Generation Mode:", isOrganic ? "ORGANIC" : "GEOMETRIC");
  console.log("📝 Prompt:", prompt);

  // Use new pattern-aware system prompt builder
  const systemPrompt = isOrganic 
    ? buildOrganicSystemPrompt(prompt)
    : buildSystemPrompt(prompt); // Uses pattern detection from lib/quality

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
    }),
  });

  const data = await res.json();
  const text = data.content?.[0]?.text;

  if (!text) throw new Error("AI response empty");

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid SVG JSON");

  return JSON.parse(match[0]);
}

// Organic system prompt (for illustrations)
function buildOrganicSystemPrompt(prompt: string): string {
  return `
You are a professional vector illustrator creating organic, flowing designs.

OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "name": "Icon Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}

ORGANIC ILLUSTRATION RULES:

1. NATURAL FORMS:
   - Use smooth curves and flowing paths
   - Embrace asymmetry where natural
   - Rounded corners and soft edges
   - Can use multiple colors

2. COMPOSITION:
   - Center around (200, 200)
   - 40px padding (60-340 safe zone)
   - Balanced visual weight

3. PATHS:
   - Use Bézier curves (Q, C commands)
   - Smooth, natural-looking curves
   - Close paths with Z

4. COMPLEXITY:
   - Can use 10-20 elements for detailed illustrations
   - Layers and depth allowed
   - Overlapping shapes for visual interest

5. FORBIDDEN:
   - NO class/data-id attributes
   - NO transforms
   - NO gradients or filters

USER PROMPT: "${prompt}"
`;
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
