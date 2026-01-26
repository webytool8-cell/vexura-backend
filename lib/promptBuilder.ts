// lib/promptBuilder.ts

import {
  GenerationType,
  detectIllustrationBias,
} from "./quality/checks";

interface BuildPromptArgs {
  userPrompt: string;
  type: GenerationType;
  autoStyle: boolean;
  autoColor: boolean;
}

export function buildPrompt({
  userPrompt,
  type,
}: BuildPromptArgs) {
  if (type === "icon") {
    return `
Generate a PROFESSIONAL SVG ICON.

Rules:
- Simple geometry
- Clear silhouette
- Minimal detail
- Flat vector paths
- Balanced composition
- Icon-safe design

User request:
"${userPrompt}"
`;
  }

  const bias = detectIllustrationBias(userPrompt);

  if (bias === "organic") {
    return `
Generate a DESIGNER-GRADE SVG ILLUSTRATION.

Style:
- Organic
- Natural curves
- Expressive motion
- Flowing shapes
- Asymmetry allowed

Output:
- SVG only
- Editable vector paths
- No raster effects

User request:
"${userPrompt}"
`;
  }

  return `
Generate a CLEAN, MODULAR SVG ILLUSTRATION.

Style:
- Structured
- Geometric
- System-friendly
- UI-appropriate

Output:
- SVG only
- Editable paths

User request:
"${userPrompt}"
`;
}
