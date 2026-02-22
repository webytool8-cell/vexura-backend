// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";
import { correctGeometry } from "../../../lib/geometry/correct";
import { renderSVG } from "../../../lib/render/svg";

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

    // Build AI prompt with organic rules applied only to humans, animals, natural objects
    const fullPrompt = buildPrompt(generationType, prompt);

    // Call AI orchestrator
   const vector = await callAIOrchestrator(
  fullPrompt,
  apiKey,
  type,
  style,
  intent
  );
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

function buildPrompt(type: GenerationType, prompt: string): 
  string {
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

async function callAIOrchestrator(
  fullPrompt: string,
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

console.log("ORGANIC MODE:", isOrganic);

  // 🧱 MECHANICAL ICON SYSTEM (Your Existing Rules)
  const mechanicalSystem = `
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
- Optical centering
- Icon must scale to 24px–48px cleanly

GEOMETRIC CONSTRUCTION RULES:
- Prefer unified single <path> silhouettes
- Vertical symmetry axis at x=200 when applicable
- Integer coordinates only
- No floating or disconnected elements
- No primitive overlap stacking
- Deterministic geometry only

STROKE SYSTEM:
- Stroke-only
- Stroke width: 32
- stroke-linecap: round
- stroke-linejoin: round
- No variable thickness

STYLE:
- No gradients, shadows, filters
- Minimal anchor points
- Strict geometric precision
`;

  // 🌊 ORGANIC SYSTEM
  const organicSystem = `
You are a professional vector icon designer. Generate clean, geometric SVG icons following modern UI standards.

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown, no explanations.
{
  "name": "Icon Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}

CRITICAL RULES:

1. CENTERING & COMPOSITION:
   - Icon MUST be centered at (200, 200)
   - All elements MUST stay within 40px padding (60-340 range)
   - Use symmetry axis at x=200 whenever possible
   - Test: Measure bounding box, ensure centered

2. GEOMETRIC PRIMITIVES:
   - Use SIMPLE shapes: circle, rect, line, polygon
   - ONE primitive per element (no complex multi-command paths)
   - Circles for round things, rects for boxes, lines for connections
   - Only use <path> for curves that CANNOT be made with primitives

3. PATH CONSTRUCTION (when needed):
   - Maximum 8 commands per path
   - Use absolute coordinates (M, L, C) not relative (m, l, c)
   - Close paths with Z
   - Test each command - does it create the intended shape?

4. STROKE VS FILL:
   - Icons under 5 elements: Use strokes (stroke-width: 16-24px)
   - Icons 5+ elements: Use fills (solid shapes)
   - NEVER mix strokes and fills in same icon
   - Round stroke caps: stroke-linecap="round", stroke-linejoin="round"

5. COORDINATE ALIGNMENT:
   - All coordinates MUST be multiples of 10 or 20
   - Example: 200, 220, 180 (GOOD) vs 226, 245, 152 (BAD)
   - This ensures pixel-perfect scaling

6. SYMMETRY:
   - If icon is symmetric, elements should mirror around x=200
   - Left element at x=120 → Right element at x=280
   - Use geometric relationships, not approximations

7. ELEMENT COUNT:
   - Simple icons: 3-8 elements
   - Complex icons: 8-15 elements maximum
   - If you need more, simplify the design

8. FORBIDDEN:
   - NO class attributes
   - NO data-id attributes  
   - NO preserveAspectRatio
   - NO style attributes
   - NO transforms (use correct coordinates instead)
   - NO gradients, filters, or effects

9. VALIDATION CHECKLIST:
   Before returning JSON, verify:
   □ All elements within 60-340 range (x and y)
   □ Icon visually centered
   □ Coordinates are round numbers (multiples of 10)
   □ Maximum 15 elements
   □ Consistent stroke OR fill (not mixed)
   □ No class/data-id/style attributes

EXAMPLE GOOD OUTPUT:
{
  "name": "Rocket Icon",
  "width": 400,
  "height": 400,
  "elements": [
    {
      "type": "polygon",
      "points": "200,100 160,200 240,200",
      "fill": "#000000"
    },
    {
      "type": "rect",
      "x": 160,
      "y": 200,
      "width": 80,
      "height": 120,
      "fill": "#000000"
    },
    {
      "type": "circle",
      "cx": 200,
      "cy": 250,
      "r": 20,
      "fill": "#ffffff"
    }
  ]
}
`;

  const systemPrompt = isOrganic ? organicSystem : mechanicalSystem;

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
