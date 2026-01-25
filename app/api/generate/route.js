// app/api/generate/route.js
import { renderFormats } from "../../../lib/render/svg";
import { iconChecks } from "../../../lib/quality/checks";

// Simple fallback generator
function createSimpleFallback(prompt) {
  return {
    name: prompt || "Fallback Icon",
    width: 400,
    height: 400,
    elements: [
      { type: "ellipse", cx: 200, cy: 340, rx: 80, ry: 12, fill: "#00000010", stroke: "none" },
      { type: "circle", cx: 200, cy: 200, r: 100, fill: "none", stroke: "#374151", strokeWidth: 4 },
      { type: "circle", cx: 200, cy: 200, r: 60, fill: "#6366f1", stroke: "none", opacity: 0.3 },
      { type: "circle", cx: 200, cy: 200, r: 60, fill: "none", stroke: "#4f46e5", strokeWidth: 2 }
    ]
  };
}

export async function POST(request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: "API key not configured",
          details: "ANTHROPIC_API_KEY environment variable is missing"
        }),
        { status: 500, headers }
      );
    }

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `You are a vector icon generator. Generate a clean, professional SVG icon based on this prompt: "${prompt}"

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "name": "Icon Name",
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
- Return ONLY JSON, nothing else`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error(`Anthropic API returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || "";

    // Extract JSON safely
    let vector = createSimpleFallback(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        vector = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse JSON from Anthropic:", e);
      }
    }

    // Optional: run quality checks
    const qualityScore = iconChecks ? iconChecks(prompt)?.score || 0.8 : 0.8;

    return new Response(
      JSON.stringify({ vector, qualityScore }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Generation error:", error);

    return new Response(
      JSON.stringify({
        vector: createSimpleFallback("Fallback Icon"),
        qualityScore: 0.5,
        error: error.message || "Generation failed"
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
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
