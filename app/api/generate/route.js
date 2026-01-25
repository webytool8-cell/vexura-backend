// app/api/generate/route.js
export async function POST(request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers }
      );
    }

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not resolve authentication method. See https://docs.anthropic.com/en/api/getting-started for available authentication methods.' 
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
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are a vector icon generator. Generate a clean, professional SVG icon based on this prompt: "${prompt}"

Return ONLY valid JSON in this exact format (no markdown, no code blocks, no explanations):
{
  "name": "Icon Name",
  "width": 400,
  "height": 400,
  "elements": [
    {"type": "circle", "cx": 200, "cy": 200, "r": 80, "fill": "#3b82f6", "stroke": "none", "strokeWidth": 0}
  ]
}

CRITICAL RULES:
- Use ONLY these element types: circle, rect, ellipse, polygon, path, line
- 400x400 viewBox always
- 3-12 elements maximum for clean design
- Use hex colors only (#RRGGBB format)
- Clean, minimal, professional design
- Include subtle shadows or depth if appropriate
- Return ONLY the JSON object, nothing else`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;
    
    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const vector = JSON.parse(jsonStr);

    // Validate the structure
    if (!vector.elements || !Array.isArray(vector.elements)) {
      throw new Error('Invalid vector structure returned from AI');
    }

    return new Response(
      JSON.stringify({ vector }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Generation failed',
        details: error.toString()
      }),
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
