import { NextRequest, NextResponse } from "next/server";
import { renderFormats } from "../../../lib/render/svg";
import { iconChecks } from "../../../lib/quality/checks";

// Simple fallback generator for icons
function createSimpleFallback(prompt: string) {
  return {
    name: prompt,
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

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // ------------------------
    // Step 1: Perform quality checks
    // ------------------------
    const checks = iconChecks(prompt);

    // ------------------------
    // Step 2: Generate formats
    // ------------------------
    let formats;
    try {
      formats = renderFormats({ prompt });
    } catch (e) {
      console.error("Render formats failed:", e);
      formats = renderFormats(createSimpleFallback(prompt));
    }

    // ------------------------
    // Step 3: Build response
    // ------------------------
    const response = {
      name: prompt,
      qualityScore: checks.score || 0.8,
      formats,
      meta: {
        elements: formats[0]?.elements?.length || 4,
        style: "icon"
      }
    };

    return NextResponse.json(response);

  } catch (err) {
    console.error("Generation failed:", err);

    // Fallback response
    return NextResponse.json({
      name: "Fallback Icon",
      qualityScore: 0.5,
      formats: renderFormats(createSimpleFallback("Fallback Icon")),
      meta: { elements: 4, style: "icon" }
    });
  }
}
