// lib/promptBuilder.ts
import { GenerationType } from './quality/checks';
import fs from 'fs';
import path from 'path';

const illustrationRefPath = path.join(process.cwd(), 'lib/quality/illustration-references');

export function buildPrompt(prompt: string, type: GenerationType, style: string, colorPalette: string) {
  let promptText = `You are a vector ${type} generator. Generate a clean, professional SVG vector based on this prompt: "${prompt}"\n`;

  // Style hints
  if (style && style !== 'auto') promptText += `Use the ${style} style.\n`;
  if (colorPalette && colorPalette !== 'auto') promptText += `Use colors from the ${colorPalette} palette.\n`;

  // Human/organic hints
  if (type === 'illustration') {
    promptText += `
For human figures:
- Maintain realistic human proportions (head ~1/7 of total height).
- Use smooth Bézier paths for limbs, hair, and heads; avoid primitive circles for heads.
- Ensure flowing, organic curves.
- Reference the illustrations folder for poses, expressions, and style.
- Use 3-5 harmonious colors.
`;
  }

  // JSON output structure
  promptText += `
Return ONLY valid JSON:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": [
    {"type": "circle|rect|ellipse|polygon|path|line", "name": "elementName", "cx|x": 0, "cy|y": 0, "r|width|height": 0, "d": "", "fill": "#HEX", "stroke": "#HEX", "strokeWidth": 0}
  ]
}
`;

  return promptText;
}
