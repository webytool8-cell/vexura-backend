import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Initialize the client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `
ROLE: You are a vector icon generation engine.
OUTPUT: JSON only. No markdown. No chatter.
FORMAT: 
{
  "name": "Object Name",
  "width": 400,
  "height": 400,
  "elements": [
    { "type": "circle", "cx": 200, "cy": 200, "r": 50, "fill": "black" },
    ...
  ]
}
CONSTRAINTS:
- Use only standard SVG shapes: circle, rect, ellipse, polygon, line, path.
- Canvas is 400x400.
- Icon must be simple, bold, and scalable.
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `Generate a vector icon for: ${prompt}` }
      ],
      temperature: 0.5,
    });

    const responseText = msg.content[0].text;

    // Clean the output
    let cleanJson = responseText;
    if (responseText.includes('```json')) {
        cleanJson = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('{')) {
        const first = responseText.indexOf('{');
        const last = responseText.lastIndexOf('}');
        cleanJson = responseText.substring(first, last + 1);
    }

    const vectorData = JSON.parse(cleanJson);

    return NextResponse.json({
      cached: false,
      vector: vectorData
    });

  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json(
      { error: "Generation failed", details: error.message },
      { status: 500 }
    );
  }
}
