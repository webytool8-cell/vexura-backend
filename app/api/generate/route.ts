import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "../../../lib/quality/checks";
import { renderSVG } from "../../../lib/render/svg";

type GenerateRequest = {
  prompt: string;
  type: "icon" | "illustration";
};

/**
 * Semantic categories that are allowed to be organic
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
 * Builds a scoped style instruction that:
 * - Defaults everything to geometric
 * - Applies organic curves ONLY to qualifying elements
 */
function buildStyleInstruction(type: "icon" | "illustration", prompt: string) {
  const organicClause = `
Organic styling rules:
- Organic curves, irregular edges, and flowing shapes are allowed ONLY for elements that represent:
  ${ORGANIC_SUBJECTS.join(", ")}
- Organic styling must be scoped ONLY to those elements.
- All other elements MUST remain geometric, clean, and structured.
- Organic elements must not influence surrounding geometry.
`;

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
${organicClause}
`;
}

/**
 * Builds the final LLM instruction
 */
function buildPrompt(type: "icon" | "illustration", userPrompt: string) {
  return `
You are a professional vector illustrator.

Output SVG ONLY.

General rules:
- Use clean SVG paths
- No raster effects
- No filters
- No blur
- No gradients unless explicitly requested
- No randomness

${buildStyleInstruction(type, userPrompt)}

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

    const generationResult = await runQualityChecks({
      type:
        body.type === "icon"
          ? GenerationType.ICON
          : GenerationType.ILLUSTRATION,
      prompt: generationPrompt,
    });

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
