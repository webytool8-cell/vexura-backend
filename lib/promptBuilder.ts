// lib/promptBuilder.ts

import { GenerationType } from "./checks";
import { detectIllustrationBias } from "./checks";

interface BuildPromptArgs {
  userPrompt: string;
  type: GenerationType;
  autoStyle: boolean;
  autoColor: boolean;
}

export function buildPrompt({
  userPrompt,
  type,
  autoStyle,
  autoColor,
}: BuildPromptArgs) {
  if (type === "icon") {
    return `
You are generating a HIGH-QUALITY SVG ICON.

Rules:
- Clean geometry
- Symmetrical or intentionally balanced
- Minimal detail
- Strong silhouette
- Works at 24x24 and 48x48
- Flat vector paths only
- No gradients unless explicitly requested
- No strokes converted to outlines
- Icon must be visually centered

User request:
"${userPrompt}"
`;
  }

  // Illustration logic
  const bias = detectIllustrationBias(userPrompt);

  if (bias === "organic") {
    return `
You are generating a DESIGNER-GRADE SVG ILLUSTRATION.

Style:
- Organic
- Natural curves
- Flowing shapes
- Asymmetry allowed
- Human, emotional, expressive
- Smooth Bézier curves
- Avoid rigid geometry and modular icon language
- Illustration should feel hand-crafted but clean
- No icon-like simplification
- No grid-based construction
- No sharp angles unless conceptually required

Composition:
- Depth and motion
- Visual rhythm
- Slight imperfections allowed
- Balanced negative space

Output:
- SVG only
- Editable vector paths
- No raster effects

User request:
"${userPrompt}"
`;
  }

  // Technical / modular illustration
  return `
You are generating a VECTOR ILLUSTRATION for UI / PRODUCT USE.

Style:
- Clean
- Modular
- Geometric
- Structured
- Clear layers
- Controlled curves
- Consistent stroke logic
- System-friendly

Composition:
- Predictable spacing
- Readable forms
- Design-system friendly

Output:
- SVG only
- Editable paths
- No raster effects

User request:
"${userPrompt}"
`;
}
