// app/api/generate/route.ts
import { renderFormats } from "../../../lib/render/svg";
import {
  runQualityChecks,
  GenerationType
} from "../../../lib/quality/checks";

export async function POST(request: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { prompt, type } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers }
      );
    }

    const generationType: GenerationType =
      type === "illustration" ? "illustration" : "icon";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const poseRules =
      generationType === "illustration"
        ? deriveHumanPoseRules(prompt)
        : "";

    const fullPrompt = `
You are a professional vector illustrator.

TASK:
Generate a ${generationType} SVG based on:
"${prompt}"

${poseRules}

STRICT RULES:
- 400x400 viewBox
- Use ONLY: path, circle, rect, ellipse, polygon, line
- Clean JSON output only
- No markdown
- No explanations
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

    const match = text?.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid SVG JSON");

    const vector = JSON.parse(match[0]);
    const warnings = runQualityChecks(vector, generationType);
    const svg = renderFormats.svg(vector);

    return new Response(
      JSON.stringify({ vector, svg, warnings }),
      { status: 200, headers }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
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
