import { iconPatterns, getPatternForPrompt } from '../lib/quality/icon-patterns';
import { styleGuide } from '../lib/quality/style-guide';
import { getMistakesForIconType } from '../lib/quality/common-mistakes';

export function buildSystemPrompt(userPrompt: string): string {
  // Check for specific pattern
  const pattern = getPatternForPrompt(userPrompt);
  const specificMistakes = getMistakesForIconType(userPrompt);
  
  let prompt = `You are a professional vector icon designer. Generate clean, geometric SVG icons following modern UI icon design standards (iOS, Material Design, Fluent, macOS).

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown, no explanations, no code fences.
{
  "name": "Icon Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}`;

  // Add pattern-specific guidance if detected
  if (pattern) {
    prompt += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PATTERN DETECTED: ${pattern.category.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SPECIFIC RULES FOR THIS ICON TYPE:
${pattern.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}

❌ STRICTLY FORBIDDEN FOR THIS TYPE:
${pattern.strictlyForbidden ? pattern.strictlyForbidden.map(item => `   • ${item}`).join('\n') : 'See universal rules'}

✅ REFERENCE STRUCTURE:
${JSON.stringify(pattern.goodExample, null, 2)}
`;

    if (pattern.commonMistakes) {
      prompt += `
⚠️  COMMON MISTAKES TO AVOID:
${pattern.commonMistakes.map(mistake => `   • ${mistake}`).join('\n')}
`;
    }
  }

  // Add universal rules
  prompt += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 UNIVERSAL ICON RULES (ALWAYS APPLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CANVAS & CENTERING:
   • All elements within ${styleGuide.canvas.safeZone.min}-${styleGuide.canvas.safeZone.max} range
   • Visual center near (${styleGuide.canvas.center.x}, ${styleGuide.canvas.center.y})
   • ${styleGuide.canvas.padding}px padding on all sides

2. COORDINATES (CRITICAL):
   • ALL coordinates must be multiples of ${styleGuide.coordinates.gridSize}
   • Major points: multiples of ${styleGuide.coordinates.snapTo}
   ✓ GOOD: ${styleGuide.coordinates.examples.good.slice(0, 5).join(', ')}
   ✗ BAD: ${styleGuide.coordinates.examples.bad.slice(0, 5).join(', ')}

3. ELEMENT COUNT:
   • Simple: max ${styleGuide.complexity.simple.max} elements
   • Complex: max ${styleGuide.complexity.complex.max} elements
   • HARD LIMIT: ${styleGuide.complexity.hardLimit} elements

4. STROKE SYSTEM:
   • Stroke width: ${styleGuide.strokes.regular}px (recommended)
   • stroke-linecap: ${styleGuide.strokes.attributes['stroke-linecap']}
   • stroke-linejoin: ${styleGuide.strokes.attributes['stroke-linejoin']}
   • Use strokes for simple icons (2-5 elements)
   • Use fills for complex icons (5+ elements)
   • NEVER mix strokes and fills

5. FORBIDDEN ATTRIBUTES:
${styleGuide.forbidden.attributes.map(attr => `   ❌ ${attr}`).join('\n')}

6. SPECIFIC WARNINGS FOR THIS PROMPT:
${specificMistakes.map(m => `   ⚠️  ${m}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PRE-FLIGHT CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before returning JSON, verify:
${styleGuide.validationChecklist.map(check => `□ ${check}`).join('\n')}

Remember: These are ICONS not ILLUSTRATIONS. Think iOS/Material Design system icons.`;

  return prompt;
}
