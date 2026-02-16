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

    vector.elements = vector.elements.map((el: any) => ({
  ...el,
  fill: "none",
  stroke: el.stroke || "#000000",
  strokeWidth: 32,
  strokeLinecap: "round",
  strokeLinejoin: "round",
}));


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
You are a professional vector icon designer. Generate clean, geometric SVG icons following modern UI icon design standards (iOS, Material Design, Fluent, macOS).

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
- Optical centering (adjust mathematically centered elements to appear visually centered)
- Icon should work at small sizes (24px-48px) when scaled down

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

PROFESSIONAL UI ICON STANDARDS:
- Stroke weight: Use consistent 16-24px strokes OR solid fills (no mixing unless intentional)
- Corner radius: Apply consistent rounded corners (radius: 8-16px) for modern feel
- Visual weight: Maintain consistent optical weight across the icon
- Negative space: Use intentional negative space for clarity and recognition
- Metaphor clarity: Icon must be immediately recognizable at small sizes
- Pixel grid alignment: Ensure edges align to pixel boundaries when scaled to common sizes (16px, 24px, 32px, 48px)

STYLE CONSISTENCY:
- Match one style system: outlined (stroke-based) OR filled (solid shapes)
- Stroke caps: Use round caps for strokes (stroke-linecap="round")
- Stroke joins: Use round joins for strokes (stroke-linejoin="round")
- Line endings: Never use squared-off terminals on curves
- Minimal anchor points (use geometric primitives efficiently)
- No gradients, shadows, filters, or effects
- No decorative or unnecessary shapes
- Deterministic geometry only (no randomness)

STROKE SYSTEM:
- Stroke-only (no fills)
- Stroke width: 32 units
- stroke-linecap: round
- stroke-linejoin: round
- Consistent stroke weight across entire icon
- No variable thickness

SPACING:
- Internal negative space must be consistent
- Elements should feel optically balanced
- No crowded areas
- No fragile thin connections

SCALABILITY REQUIREMENTS:
- Icon must remain legible when scaled to 24px × 24px
- Critical details must be visible at small sizes
- Avoid thin strokes (<12px) that disappear when scaled down
- Test mental model: "Would this work as an app icon or toolbar button?"

CRITICAL: Focus on geometric precision, optical balance, and instant recognizability. Every shape placement must follow exact calculation, not visual approximation. Icons should feel professional, modern, and platform-appropriate.
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
