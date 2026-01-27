// app/api/generate/route.ts
import { renderFormats } from "../../../lib/render"; // use index.ts
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";

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
    const { prompt, type }: GenerateRequest = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers,
      });
    }

    const generationType: GenerationType =
      type === "illustration" ? GenerationType.ILLUSTRATION : GenerationType.ICON;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

    // ---------------- GENERATE VECTOR ----------------
    const fullPrompt = `
You are a professional vector illustrator.

TASK:
Generate a ${type} SVG based on:
"${prompt}"

STRICT RULES:
- 400x400 viewBox
- Use ONLY: path, circle, rect, ellipse, polygon, line
- Clean JSON output only
- No markdown
- No explanations
- Natural proportions
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
    vector.elements = Array.isArray(vector.elements) ? vector.elements : [];

    const warnings = runQualityChecks(vector, generationType);
    const svg = renderFormats(vector)?.svg ?? "<svg></svg>";

    return new Response(JSON.stringify({ vector, svg, warnings }), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("Generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
}
