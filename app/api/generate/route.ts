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
You are an elite professional vector icon designer.

You strictly follow professional icon construction standards.

CANVAS:
- 400x400 viewBox
- Centered composition
- Balanced margins (minimum 40px padding on all sides)

STRUCTURAL GEOMETRY RULES:
- All icons must be built as a unified silhouette.
- Elements must share a common center axis (x=200 vertical symmetry when applicable).
- Shapes must align using exact mathematical relationships.
- Circles used together must share consistent radii or calculated offsets.
- Triangles or polygons must align precisely to circle tangency points.
- No floating shapes.
- No visual overlaps unless intentionally merged into a single silhouette.
- Overlapping primitives must form a clean continuous outline.
- Avoid visible shape stacking artifacts.

ALIGNMENT REQUIREMENTS:
- Horizontal center alignment required unless intentionally asymmetrical.
- Use exact coordinates, not approximate visual placement.
- When combining primitives, ensure geometric continuity.
- All anchor points must align to integer values.
- Maintain consistent stroke widths if used.

SIMPLICITY RULES:
- Minimal anchor points.
- No unnecessary decorative shapes.
- No gradients.
- No shadows.
- No filters.
- No randomness.

OUTPUT REQUIREMENTS:
- JSON only.
- No explanation.
- No markdown.
- Return exactly:

{
  "name": "Icon Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}
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
