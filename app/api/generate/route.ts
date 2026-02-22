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
    const vector = await callAIOrchestrator(fullPrompt, apiKey, generationType);

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
  type?: string
): Promise<any> {

  const lowerPrompt = fullPrompt.toLowerCase();

  // 🔍 Detect organic intent
  const isOrganic =
    lowerPrompt.includes("wave") ||
    lowerPrompt.includes("cloud") ||
    lowerPrompt.includes("user") ||
    lowerPrompt.includes("profile") ||
    lowerPrompt.includes("flame") ||
    lowerPrompt.includes("organic") ||
    lowerPrompt.includes("fluid") ||
    lowerPrompt.includes("leaf") ||
    lowerPrompt.includes("water") ||
    lowerPrompt.includes("wind");

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
You are a professional vector illustrator specializing in smooth organic forms and flowing silhouettes.

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown, no explanations, no code fences.
Schema:
{
  "name": "Illustration Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}

CANVAS:
- 400x400 viewBox
- Minimum padding: 40px
- Optical balance, not strict symmetry

ORGANIC GEOMETRY RULES:
- Use smooth continuous Bézier curves
- Allow natural asymmetry
- Avoid rigid grid snapping
- Avoid mechanical straight-line bias
- Use unified flowing silhouettes
- No stacking primitive circles/triangles to fake curves
- Curvature continuity required
- Balanced but fluid proportions

STYLE:
- Stroke-only
- Stroke width: 32
- stroke-linecap: round
- stroke-linejoin: round
- No gradients, shadows, filters
- Avoid harsh angular corners unless concept requires it

CRITICAL:
Prioritize flow, curvature rhythm, and natural visual movement over strict geometric rigidity.
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
