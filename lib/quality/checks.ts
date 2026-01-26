// app/api/generate/route.ts
import { renderFormats } from '../../../lib/render/svg';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';

export async function POST(request: Request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { prompt, type }: { prompt: string; type: GenerationType } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers });
    }

    // Validate type
    const vectorType: GenerationType = type === 'illustration' ? 'illustration' : 'icon';

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          details: 'ANTHROPIC_API_KEY environment variable is missing',
        }),
        { status: 500, headers }
      );
    }

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
        messages: [
          {
            role: 'user',
            content: `You are a vector ${vectorType} generator. Generate a clean, professional SVG vector based on this prompt: "${prompt}"

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": [
    {"type": "circle", "cx": 200, "cy": 200, "r": 80, "fill": "#3b82f6", "stroke": "none", "strokeWidth": 0}
  ],
  "reference": "optional_reference_filename.svg"
}

Rules:
- Use ONLY: circle, rect, ellipse, polygon, path, line
- 400x400 viewBox
- 3-12 elements max
- Hex colors only
- Clean, minimal design
- Return ONLY JSON, nothing else`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse vector JSON from AI response');
    const vector = JSON.parse(jsonMatch[0]);

    // Run quality checks
    const { warnings, score } = runQualityChecks(vector, vectorType);

    // Optionally, render SVG
    const svg = renderFormats.svg(vector);

    return new Response(JSON.stringify({ vector, svg, warnings, score }), { status: 200, headers });
  } catch (error: any) {
    console.error('Generation error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Generation failed' }), { status: 500, headers });
  }
}

// Handle CORS preflight
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
