// app/api/generate/route.ts
import { renderFormats } from "../../../lib/render/svg";
import { iconChecks } from "../../../lib/quality/checks";

export async function POST(request: Request) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    // Validate type: either "icon" or "illustration"
    if (!["icon", "illustration"].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Type must be either "icon" or "illustration"' }),
        { status: 400, headers }
      );
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "API key not configured",
          details: "ANTHROPIC_API_KEY environment variable is missing",
        }),
        { status: 500, headers }
      );
    }

    // Build the prompt for Anthropic
    const roleInstruction =
      type === "icon"
        ? "You are a vector icon generator. Generate a clean, professional SVG icon."
        : "You are a vector illustration generator. Generate a detailed, clean SVG illustration.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `${roleInstruction} Use this prompt: "${prompt}"
Return ONLY valid JSON in this format:
{
  "name": "Asset Name",
  "width": 400,
  "height": 400,
  "elements": [
    {"type": "circle", "cx": 200, "cy": 200, "r": 80, "fill": "#3b82f6", "stroke": "none", "strokeWidth": 0}
  ]
}
Rules:
- Use ONLY: circle, rect, ellipse, polygon, path, line
- 400x400 viewBox
- 3-12 elements max
- Hex colors only
- Clean, minimal design
- Return ONLY JSON, nothing else`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || data.text || "";

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }
    const vector = JSON.parse(jsonMatch[0]);

    // Run optional icon checks if type is icon
    if (type === "icon") {
      iconChecks(vector); // Just run checks, does not modify vector
    }

    // Render SVG using your existing renderFormats
    const svgOutput = renderFormats.svg(vector);

    return new Response(
      JSON.stringify({ vector, svg: svgOutput }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("Generation error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Generation failed",
      }),
      { status: 500, headers }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
