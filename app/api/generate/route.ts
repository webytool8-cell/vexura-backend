// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';
import { renderFormats } from '../../../lib/render/svg';

type GenerateRequest = {
  prompt: string;
  type: 'icon' | 'illustration';
  // add more fields if needed
};

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { prompt, type }: GenerateRequest = await request.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers }
      );
    }

    // Map frontend type to GenerationType
    const generationType: GenerationType =
      type === 'illustration' ? GenerationType.ILLUSTRATION : GenerationType.ICON;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

    // Optional pose rules for illustrations
    const poseRules = generationType === GenerationType.ILLUSTRATION
      ? deriveHumanPoseRules(prompt)
      : '';

    const fullPrompt = `
You are a professional vector illustrator.

TASK:
Generate a ${generationType} SVG based on:
"${prompt}"

${poseRules}

STRICT RULES:
- 400x400 viewBox
- Use ONLY: path, circle, rect, ellipse, polygon, line
- Clean JSON output only
- No markdown
- No explanations
- Natural proportions
- No mirrored limbs
- Limbs must connect at joints
- Avoid symmetry in poses
- Use smooth Bézier curves (C, Q)

RETURN FORMAT:
{
  "name": "Vector Name",
  "width": 400,
  "height": 400,
  "elements": [...]
}
`;

    // 1️⃣ Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    const data = await response.json();
    const rawText = data.content?.[0]?.text ?? '';

    console.log('AI raw response:', rawText); // ✅ for debugging

    // 2️⃣ Safe JSON parsing
    let vector: any = { elements: [] };
    try {
      const match = rawText.match(/\{[\s\S]*\}/); // extract JSON object
      if (!match) throw new Error('No JSON object found in AI response');

      vector = JSON.parse(match[0]);

      // Ensure safe defaults
      vector.elements = Array.isArray(vector.elements) ? vector.elements : [];
      vector.width = vector.width ?? 400;
      vector.height = vector.height ?? 400;
    } catch (err) {
      console.error('Vector parsing failed:', err, rawText);
      return new Response(
        JSON.stringify({ error: 'Backend reported generation failure' }),
        { status: 500, headers }
      );
    }

    // 3️⃣ Run quality checks safely
    const warnings = runQualityChecks(vector, generationType);

    // 4️⃣ Render SVG safely
    let svgOutput = '<svg></svg>';
    try {
      svgOutput = renderFormats(vector)?.svg ?? '<svg></svg>';
    } catch (err) {
      console.error('SVG rendering failed:', err);
    }

    // 5️⃣ Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        vector,
        svg: svgOutput,
        warnings,
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error('Orchestration error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers }
    );
  }
}

// ---------------- POSE LOGIC ----------------
function deriveHumanPoseRules(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('wave') || p.includes('waving')) {
    return `
POSE RULES:
- One arm raised
- Other arm relaxed
- Arms must not mirror
- Elbow slightly bent
`;
  }

  if (p.includes('holding')) {
    return `
POSE RULES:
- One arm bent holding object
- Other arm neutral
- Hands must connect to arms
`;
  }

  if (p.includes('walk') || p.includes('running')) {
    return `
POSE RULES:
- Legs offset in stride
- Arms counter-swing
- No symmetry
`;
  }

  return `
POSE RULES:
- Neutral relaxed pose
- Asymmetrical limbs
- Natural joint flow
`;
}

// ---------------- OPTIONS ----------------
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
