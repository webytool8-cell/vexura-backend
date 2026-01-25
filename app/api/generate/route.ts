import { renderFormats } from "@/lib/render";

export async function POST() {
  const mockVector = {
    name: "Test",
    width: 400,
    height: 400,
    elements: [
      { type: "circle", cx: 200, cy: 200, r: 80, fill: "#6366f1" }
    ]
  };

  return new Response(
    JSON.stringify({
      qualityScore: 1,
      formats: renderFormats(mockVector)
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
