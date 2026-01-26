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
    const body = await request.json();
    const prompt: string = body.prompt;
    const type: 'icon' | 'illustration' =
      body.type === 'illustration' ? 'illustration' : 'icon';

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers }
      );
    }

    // Get API key
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

    // Mode-aware system instructions
    const modeInstructions =
      type === 'illustration'
        ? `
You are a vector illustration generator.

Focus on:
- Organic, flowing curves
- Natural asymmetry
- Expressive path work inspired by nature, animals, wind, water, muscle, or growth
- Fewer rigid geometric primitives
- Path-based shapes with smooth Bézier curves
- Illustration-first thinking (not iconography)

Avoid:
- Perfect symmetry
- Overly simple geometric symbolism
- Flat icon-style abstraction
`
        : `
You are a vector icon generator.

Focus on:
- Clean geometry
- Strong symmetry and balance
- Simplified symbolic forms
- Clear visual readability at small sizes
- Minimal, structured shapes

Avoid:
- Excessive detail
- Organic irregularity
- Illustrative complexity
`;

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
            content: `
${modeInstructions}

Generate a professional SVG vector based on this prompt:
"${prompt}"

Return ONLY valid JSON in this exact format (no markdown, no commentary):

{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": [
    {
      "type": "path",
      "d": "M100 200 C150 100, 250 100, 300 200",
      "fill": "#000000",
      "stroke": "none",
      "strokeWidth": 0
    }
  ]
}

Rules:
- Use ONLY: circle, rect, ellipse, polygon, path, line
- 400x400 viewBox
- 3–12 elements max
- Hex colors only
- SVG must be valid
- Return ONLY JSON
`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text: string = data.content?.[0]?.text;

    if (!text) {
      throw new Error('Empty response from AI');
    }

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse vector JSON from AI response');
    }

    const vector = JSON.parse(jsonMatch[0]);

    // Run updated quality checks (mode-aware)
    const warnings = runQualityChecks(vector, type);

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
