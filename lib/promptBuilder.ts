// lib/promptBuilder.ts
import { runQualityChecks, GenerationType } from './quality/checks';

/**
 * Build the AI prompt for vector generation.
 * @param prompt User input prompt
 * @param type 'icon' | 'illustration'
 * @param style Optional style selection
 * @param colorPalette Optional color palette selection
 */
export function buildVectorPrompt(
  prompt: string,
  type: GenerationType,
  style?: string,
  colorPalette?: string
) {
  let promptText = `You are a vector ${type} generator. Generate a clean, professional SVG vector based on this prompt: "${prompt}"`;

  // Style instructions
  if (style && style !== 'Auto') {
    promptText += ` Use the ${style.toLowerCase()} style.`;
  }

  // Color palette instructions
  if (colorPalette && colorPalette !== 'Auto') {
    promptText += ` Apply a ${colorPalette.toLowerCase()} color palette.`;
  }

  // Add rules for SVG
  promptText += `
Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "name": "Vector Name",
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
- Return ONLY JSON, nothing else`;

  return promptText;
}

/**
 * Detect if the prompt implies an illustration with human poses or expressions
 */
export function detectIllustrationBias(prompt: string) {
  const humanKeywords = /pose|expression|action|gesture|emotion|character/i;
  return humanKeywords.test(prompt);
}
