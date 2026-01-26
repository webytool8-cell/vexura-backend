// app/api/generate/route.ts
import { renderFormats } from '../../../lib/render/svg';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { prompt, type } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers });
    }

    const vectorType: GenerationType = type === 'illustration' ? 'illustration' : 'icon';

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });

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
          content: `You are a vector ${vectorType} generator. Generate a clean SVG based on prompt: "${prompt}"
Use references from the illustration folder for humans if mentioned in prompt.
Return ONLY JSON in this format:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": []
}
Use only: circle, rect, ellipse, polygon, path, line.
Use smooth, natural curves for human limbs and heads; avoid simple circles for heads.
3-12 elements, 3-5 colors max. Return JSON ONLY.`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse vector JSON from AI response');

    const vector = JSON.parse(jsonMatch[0]);
    const warnings = runQualityChecks(vector, vectorType);
    const svg = renderFormats.svg(vector);

    return new Response(JSON.stringify({ vector, svg, warnings }), { status: 200, headers });
  } catch (error: any) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Generation failed' }), { status: 500, headers });
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
