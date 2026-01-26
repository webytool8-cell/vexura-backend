import { renderFormats } from '../../../lib/render/svg';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';
import { buildPrompt } from '../../../lib/promptBuilder';

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { prompt, type, style, colorPalette } = await request.json();
    if (!prompt) return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers });

    const vectorType: GenerationType = type === 'illustration' ? 'illustration' : 'icon';
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });

    // Build prompt
    const finalPrompt = buildPrompt(prompt, vectorType, style, colorPalette);

    // Call Anthropic API
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
        messages: [{ role: 'user', content: finalPrompt }],
      }),
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
