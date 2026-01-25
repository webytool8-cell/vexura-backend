import { renderFormats } from "@/lib/render";
import { iconChecks } from "@/lib/quality/checks";

export async function POST(req) {
  // Parse request
  const { prompt } = await req.json();

  // Mock AI output (for now, replace later with Anthropic/Unsplash calls)
  const mockVector = {
    name: prompt,
    width: 400,
    height: 400,
    elements: [
      { type: "circle", cx: 200, cy: 200, r: 80, fill: "none", stroke: "#374151", strokeWidth: 4 }
    ]
  };

  const checks = iconChecks(mockVector);
  const qualityScore = Object.values(checks).filter(Boolean).length / Object.values(checks).length;

  return new Response(
    JSON.stringify({
      name: prompt,
      qualityScore,
      formats: renderFormats(mockVector),
      meta: {
        elements: mockVector.elements.length,
        style: "icon"
      }
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
