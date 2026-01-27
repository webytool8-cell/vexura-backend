// app/api/generate/route.ts
import { renderFormats } from '../../../lib/render/svg';
import {
  runQualityChecks,
  autoRepairVector,
  Vector,
} from '../../../lib/quality/checks';
import fs from 'fs';
import path from 'path';

// Load illustration reference SVGs once
const illustrationReferenceDir = path.join(process.cwd(), 'lib', 'quality', 'illustration-references');
const illustrationReferenceSvgs = fs.existsSync(illustrationReferenceDir)
  ? fs.readdirSync(illustrationReferenceDir).filter(f => f.endsWith('.svg'))
  : [];

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

    const vectorType = type === 'illustration' ? 'illustration' : 'icon';
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });
    }

    // Call AI API (Anthropic)
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
          content: `You are a vector ${vectorType} generator. Generate a clean SVG vector for this prompt: "${prompt}"

Return ONLY valid JSON in this exact format:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": [
    {"type": "circle", "cx": 200, "cy": 200, "r": 80, "fill": "#3b82f6", "stroke": "none", "strokeWidth": 0}
  ]
}

Rules:
- Use only circle, rect, ellipse, polygon, path, line
- 400x400 viewBox
- 3-12 elements max
- Hex colors only
- Clean, minimal design
- Return ONLY JSON, nothing else`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || data.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse vector JSON from AI response');
    const vector: Vector = JSON.parse(jsonMatch[0]);

    // ---------- AUTO-REPAIR ----------
    vector.elements = autoRepairVector(vector.elements, vectorType, illustrationReferenceSvgs);

    // ---------- QUALITY CHECKS ----------
    const warnings = runQualityChecks(vector, vectorType);

    // ---------- RENDER SVG ----------
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
