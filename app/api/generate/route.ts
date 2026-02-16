// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";
import { correctGeometry } from "../../../lib/geometry/correct";
import { renderSVG } from "../../../lib/render/svg";

type GenerateRequest = {
  prompt: string;
  type: "icon" | "illustration";
};

export async function POST(request: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body: GenerateRequest = await request.json();
    const { prompt, type } = body;

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

    // Build AI prompt with organic rules applied only to humans, animals, natural objects
    const fullPrompt = buildPrompt(generationType, prompt);

    // Call AI orchestrator
    const vector = await callAIOrchestrator(fullPrompt, apiKey);

    // Ensure elements exist
    vector.elements = Array.isArray(vector.elements) ? vector.elements : [];

    if (vector.elements.length === 0) {
      // Provide a placeholder element to avoid "No elements provided" error
      vector.elements.push({
        type: "rect",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: "#cccccc",
      });
    }

    // Apply organic styling only to humans, animals, nature
    vector.elements = vector.elements.map((el: any) => {
      if (isOrganicCandidate(el)) {
        return { ...el, style: { ...el.style, organic: true } };
      }
      return el;
    });

    // Apply geometry correction layer
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

// ---------------- Helpers ----------------

function buildPrompt(type: GenerationType, prompt: string): string {
  const basePrompt = `
You are a professional vector illustrator.

TASK:
Generate a ${type} SVG based on:
"${prompt}"

STRICT RULES:
- 400x400 viewBox
- Use ONLY: path, circle, rect, ellipse, polygon, line
- Clean JSON output only
- No markdown or explanations
- Natural proportions
- Limbs must connect at joints if human
- Smooth Bézier curves

RETURN FORMAT:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}
`;

  return basePrompt;
}

async function callAIOrchestrator(fullPrompt: string, apiKey: string): Promise<any> {
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

      // ✅ Proper system message
system: `
You are a professional vector icon designer. Generate clean, geometric SVG icons following these exact specifications.

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown, no explanations, no code fences.
Schema:
{
  "name": "Icon Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}

CANVAS SPECIFICATIONS:
- viewBox: 400x400
- Minimum padding: 40px on all sides
- Center composition in remaining space

GEOMETRIC CONSTRUCTION RULES:
1. Build icons as unified silhouettes - prefer single <path> elements over multiple overlapping shapes
2. Use exact mathematical alignment:
   - Vertical symmetry axis at x=200 (when applicable)
   - All coordinates must be integers
   - Circles sharing composition must use consistent radii or calculated ratios
   - Polygons must align to precise tangency points on circles
   - No floating or disconnected elements

3. When combining multiple primitives:
   - They must form continuous outlines without visible seams
   - Overlaps must create clean merged silhouettes
   - Avoid stacking artifacts or double-strokes

STYLE CONSTRAINTS:
- Minimal anchor points (use geometric primitives efficiently)
- Consistent stroke width if strokes are used
- No gradients, shadows, filters, or effects
- No decorative or unnecessary shapes
- Deterministic geometry only (no randomness)

CRITICAL: Focus on geometric precision and mathematical relationships between all elements. Every shape placement must follow exact calculation, not visual approximation.
`
,

      // ✅ User prompt separate
      messages: [
        {
          role: "user",
          content: fullPrompt
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


function isOrganicCandidate(el: any): boolean {
  // Only humans, animals, plants, natural objects are organic
  if (!el || !el.type) return false;
  const organicTypes = ["human", "animal", "tree", "plant", "rock", "mountain"];
  return organicTypes.includes(el.type.toLowerCase());
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
