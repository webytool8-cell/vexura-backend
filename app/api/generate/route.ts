// app/api/generate/route.ts
import { renderFormats } from '../../../lib/render/svg';
import { runQualityChecks } from '../../../lib/quality/checks';

export async function POST(request: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { prompt, type } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers }
      );
    }

    // Validate type
    const vectorType = type === 'illustration' ? 'illustration' : 'icon';

    // API key
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
    {"type": "circle", "cx": 200, "cy": 200, "r": 80, "fill": "#3b82f6", "stroke": "none"}
  ]
}

Rules:
- Use ONLY: circle, rect, ellipse, polygon, path, line
- 400x400 viewBox
- 3-12 elements max
- Hex colors only
- Clean, minimal design
- Return ONLY JSON, nothing else`
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    console.log('AI raw output:', rawText);

    // Extract JSON safely
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({
          error: 'Failed to parse vector JSON from AI response',
          raw: rawText,
        }),
        { status: 500, headers }
      );
    }

    let vector;
    try {
      vector = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON from AI response',
          raw: rawText,
        }),
        { status: 500, headers }
      );
    }

    // Validate vector structure
    if (!vector || !Array.isArray(vector.elements)) {
      return new Response(
        JSON.stringify({
          error: 'Vector data missing or invalid',
          raw: rawText,
        }),
        { status: 500, headers }
      );
    }

    // Run quality checks
    const warnings = runQualityChecks(vector, vectorType);

    // Render SVG
    const svg = renderFormats.svg(vector);

    return new Response(
      JSON.stringify({ vector, svg, warnings }),
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
