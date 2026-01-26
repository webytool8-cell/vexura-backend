// app/api/generate/route.ts
import { renderFormats } from '../../../lib/render/svg';
import { runQualityChecks, GenerationType, detectIllustrationBias } from '../../../lib/quality/checks';
import { buildVectorPrompt } from '../../../lib/promptBuilder';

export async function POST(request: Request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { prompt, type, style, colorPalette } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers });
    }

    // Validate type
    const vectorType: GenerationType = type === 'illustration' ? 'illustration' : 'icon';

    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured', details: 'ANTHROPIC_API_KEY environment variable is missing' }),
        { status: 500, headers }
      );
    }

    // Build AI prompt with style, color, and human illustration detection
    let finalPrompt = buildVectorPrompt(prompt, vectorType, style, colorPalette);

    // Add human reference instructions for illustrations if detected
    if (vectorType === 'illustration' && detectIllustrationBias(prompt)) {
      finalPrompt += `
      If the illustration includes humans, consider referencing realistic poses and expressions from the provided references folder.`;
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
        messages: [{ role: 'user', content: finalPrompt }],
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
    const warnings = runQualityChecks(vector, vectorType);

    // Render SVG
    const svg = renderFormats.svg(vector);

    return new Response(JSON.stringify({ vector, svg, warnings }), { status: 200, headers });
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
