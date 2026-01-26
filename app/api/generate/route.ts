// app/api/generate/route.ts
import { renderFormats } from '../../../lib/render/svg';
import { runQualityChecks } from '../../../lib/quality/checks';

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const {
      prompt,
      type,
      style,
      palette,
      customColors
    } = await request.json();

    if (!prompt || !style || !palette) {
      return new Response(
        JSON.stringify({ error: 'Prompt, style, and palette are required.' }),
        { status: 400, headers }
      );
    }

    const vectorType: 'icon' | 'illustration' =
      type === 'illustration' ? 'illustration' : 'icon';

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers }
      );
    }

    const styleInstructions = {
      icon: {
        minimal: 'Extremely simple shapes, minimal paths, no decoration.',
        outline: 'Stroke-only vectors, no fills, consistent stroke width.',
        filled: 'Solid filled shapes, no strokes.',
        geometric: 'Sharp angles, precise geometry, minimal curves.'
      },
      illustration: {
        flat: 'Flat layered shapes, clean composition, no gradients.',
        organic: 'Smooth flowing curves inspired by nature and anatomy.',
        abstract: 'Expressive symbolic forms, non-literal shapes.',
        technical: 'Structured, precise, diagram-like illustration.'
      }
    };

    const paletteInstructions = {
      mono: 'Use a single color with possible tints.',
      warm: 'Use warm colors like red, orange, yellow.',
      cool: 'Use cool colors like blue, teal, purple.',
      pastel: 'Use soft pastel tones.',
      vibrant: 'Use bright high-saturation colors.',
      custom: `Use ONLY these colors: ${customColors?.join(', ')}`
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `
You are a professional ${vectorType} designer.

STYLE:
${styleInstructions[vectorType][style]}

COLOR PALETTE:
${paletteInstructions[palette]}

TASK:
Generate a clean, professional SVG vector for:
"${prompt}"

Return ONLY valid JSON in this exact format:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": []
}

Rules:
- Use ONLY: circle, rect, ellipse, polygon, path, line
- 400x400 viewBox
- 3–12 elements
- Hex colors only
- No text elements
- Return ONLY JSON
          `
        }]
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    const text = data.content[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON from AI');

    const vector = JSON.parse(jsonMatch[0]);

    const warnings = runQualityChecks(
      vector,
      vectorType,
      style,
      palette,
      customColors
    );

    const svg = renderFormats.svg(vector);

    return new Response(
      JSON.stringify({ vector, svg, warnings }),
      { status: 200, headers }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Generation failed' }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
