// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";
import { renderFormats } from "../../../lib/render";

type GenerateRequest = {
  prompt: string;
  type: "icon" | "illustration";
  // Add other fields if needed
};

export async function POST(request: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { prompt, type } = await request.json() as GenerateRequest;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers }
      );
    }

    // 1️⃣ Map type to GenerationType safely
    const generationType: GenerationType =
      type === "icon" ? GenerationType.ICON : GenerationType.ILLUSTRATION;

    // 2️⃣ Define style references to enforce icon vs illustration style
    const iconReference = `
- Clean, geometric shapes
- Minimal strokes
- Flat colors only, no gradients
- Consistent size and spacing
- Simple, functional design
`;
    const illustrationReference = `
- Stylized illustration
- Natural proportions
- Smooth, continuous lines
- Vibrant but simple colors
- No abstract/organic drift
- Characters and objects clearly defined
`;

    const styleReference =
      generationType === GenerationType.ICON ? iconReference : illustrationReference;

    // 3️⃣ Optionally add pose rules for illustrations
    const poseRules =
      generationType === GenerationType.ILLUSTRATION
        ? deriveHumanPoseRules(prompt)
        : "";

    // 4️⃣ Construct the full prompt for AI
    const fullPrompt = `
You are a professional vector illustrator.

TASK:
Generate a ${generationType} SVG based on:
"${prompt}"

STYLE REFERENCE:
${styleReference}

${poseRules}

STRICT RULES:
- 400x400 viewBox
- Use ONLY: path, circle, rect, ellipse, polygon, line
- Clean JSON output only
- No markdown
- No explanations
- Elements must have proper fill or stroke
- Natural proportions
- No mirrored limbs
- Limbs must connect at joints
- Avoid symmetry in poses
- Use smooth Bézier curves (C, Q)

RETURN FORMAT:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}
`;

    // 5️⃣ Send request to backend AI (Anthropic)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2500,
        messages: [{ role: "user", content: fullPrompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text;

    // 6️⃣ Parse JSON safely
    const match = text?.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid SVG JSON returned");

    const vector = JSON.parse(match[0]);
    // Ensure safe structure
    vector.elements = Array.isArray(vector.elements) ? vector.elements : [];

    // 7️⃣ Run quality checks and render SVG
    const warnings = runQualityChecks(vector, generationType);
    const svgOutput = renderFormats(vector);

    return new Response(
      JSON.stringify({
        success: true,
        vector,
        svg: svgOutput?.svg ?? "<svg></svg>",
        warnings,
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error("Orchestration error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers }
    );
  }
}

// ---------------- POSE LOGIC ----------------
function deriveHumanPoseRules(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("wave") || p.includes("waving")) {
    return `
POSE RULES:
- One arm raised
- Other arm relaxed
- Arms must not mirror
- Elbow slightly bent
`;
  }

  if (p.includes("holding")) {
    return `
POSE RULES:
- One arm bent holding object
- Other arm neutral
- Hands must connect to arms
`;
  }

  if (p.includes("walk") || p.includes("running")) {
    return `
POSE RULES:
- Legs offset in stride
- Arms counter-swing
- No symmetry
`;
  }

  return `
POSE RULES:
- Neutral relaxed pose
- Asymmetrical limbs
- Natural joint flow
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
