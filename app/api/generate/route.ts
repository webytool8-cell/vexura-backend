// app/api/generate/route.ts
import { renderFormats } from '../../../lib/render/svg';
import { runQualityChecks } from '../../../lib/quality/checks';

/* -----------------------------
   Auto-Inference Helpers
-------------------------------- */

function inferStyle(type: 'icon' | 'illustration', prompt: string) {
  const p = prompt.toLowerCase();

  if (type === 'icon') {
    if (p.includes('outline') || p.includes('stroke')) return 'outline';
    if (p.includes('solid') || p.includes('filled')) return 'filled';
    if (p.includes('geo') || p.includes('sharp')) return 'geometric';
    return 'minimal';
  }

  // illustration
  if (p.includes('nature') || p.includes('animal') || p.includes('human'))
    return 'organic';
  if (p.includes('diagram') || p.includes('system') || p.includes('ui'))
    return 'technical';
  if (p.includes('abstract'))
    return 'abstract';
  return 'flat';
}

function inferPalette(prompt: string) {
  const p = prompt.toLowerCase();

  if (p.includes('sun') || p.includes('fire') || p.includes('warm'))
    return 'warm';
  if (p.includes('night') || p.includes('water') || p.includes('cool'))
    return 'cool';
  if (p.includes('soft') || p.includes('cute'))
    return 'pastel';
  if (p.includes('neon') || p.includes('bold'))
    return 'vibrant';
  return 'mono';
}

/* -----------------------------
   API Handler
-------------------------------- */

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
      customColors = [],
    } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers }
      );
    }

    const vectorType: 'icon' | 'illustration' =
      type === 'illustration' ? 'illustration' : 'icon';

    // Resolve AUTO logic
    const resolvedStyle =
      !style || style === 'auto'
        ? inferStyle(vectorType, prompt)
        : style;

    const resolvedPalette =
      !palette || palette === 'auto'
        ? inferPalette(prompt)
        : palette;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          details: 'ANTHROPIC_API_KEY environment variable missing',
        }),
        { status: 500, headers }
      );
    }

    /* -----------------------------
       AI Prompt Construction
    -------------------------------- */

    const aiPrompt = `
You are a professional ${vectorType} illustrator.

Goal:
Generate a high-quality SVG ${vectorType} suitable for designers, similar in quality to Freepik or Vecteezy assets.

User prompt:
"${prompt}"

Style:
${resolvedStyle}

Color palette:
${resolvedPalette}
${customColors.length ? `Custom colors: ${customColors.join(', ')}` : ''}

Rules:
- Return ONLY valid JSON
- No markdown, no explanations
- SVG must be clean and production-ready
- 400x400 viewBox
- Use ONLY: circle, rect, ellipse, polygon, path, line
- Icons: simple, geometric, consistent stroke logic
- Illustrations: flowing curves, organic shapes, layered depth
- Avoid randomness in proportions

JSON format:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": []
}
`.trim();

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
        messages: [{ role: 'user', content: aiPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} – ${errorText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract vector JSON');
    }

    const vector = JSON.parse(jsonMatch[0]);

    const warnings = runQualityChecks(
      vector,
      vectorType,
      resolvedStyle,
      resolvedPalette,
      customColors
    );

    const svg = renderFormats.svg(vector);

    return new Response(
      JSON.stringify({
        vector,
        svg,
        warnings,
        meta: {
          type: vectorType,
          style: resolvedStyle,
          palette: resolvedPalette,
        },
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Generation failed' }),
      { status: 500, headers }
    );
  }
}

/* -----------------------------
   CORS Preflight
-------------------------------- */

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
