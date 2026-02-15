// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";
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

You strictly follow icon design best practices:
- 400x400 canvas
- Perfect geometry alignment
- Minimal anchor points
- Stroke consistency
- Clean closed paths
- No gradients
- No shadows
- No decorative noise
- Use geometric logic
- Maintain visual balance
- Output JSON only
`,

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
