import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";
import { renderSVG } from "../../../lib/render/svg";

type GenerateRequest = {
  prompt: string;
  type: "icon" | "illustration";
};

/**
 * Semantic categories allowed to be organic
 */
const ORGANIC_SUBJECTS = [
  "human",
  "person",
  "face",
  "body",
  "animal",
  "creature",
  "plant",
  "tree",
  "flower",
  "leaf",
  "mountain",
  "rock",
  "water",
  "river",
  "cloud",
  "smoke",
  "fire",
  "terrain",
  "landscape",
];

/**
 * Builds scoped style rules
 */
function buildStyleInstruction(type: "icon" | "illustration") {
  if (type === "icon") {
    return `
Style rules for icons:
- Strictly geometric
- No organic curves
- No hand-drawn appearance
- Clean vector primitives only
`;
  }

  return `
Style rules for illustrations:
- Default style is geometric and structured
- Flat vector illustration
- Clean lines and consistent stroke weights

Organic styling rules:
- Organic curves, irregular edges, and flowing shapes are allowed ONLY for elements representing:
  ${ORGANIC_SUBJECTS.join(", ")}
- Organic styling must be scoped ONLY to those elements
- All other elements MUST remain geometric
- Organic elements must not influence surrounding geometry
`;
}

/**
 * Final prompt builder
 */
function buildPrompt(type: "icon" | "illustration", userPrompt: string) {
  return `
You are a professional vector illustrator.

Output SVG ONLY.

Global rules:
- Use clean SVG paths
- No raster effects
- No filters
- No blur
- No gradients unless explicitly requested
- No randomness

${buildStyleInstruction(type)}

User request:
"${userPrompt}"
`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;

    if (!body.prompt || !body.type) {
      return NextResponse.json(
        { error: "Missing prompt or type" },
        { status: 400 }
      );
    }

    const generationPrompt = buildPrompt(body.type, body.prompt);

    // ✅ FIX: correct function signature
    const generationResult = await runQualityChecks(
      body.type === "icon"
        ? GenerationType.ICON
        : GenerationType.ILLUSTRATION,
      generationPrompt
    );

    if (!generationResult?.svg) {
      throw new Error("Generation failed");
    }

    const svg = renderSVG(generationResult.svg);

    return NextResponse.json({ svg });
  } catch (err) {
    console.error("SVG generation error:", err);
    return NextResponse.json(
      { error: "SVG generation failed" },
      { status: 500 }
    );
  }
}
