// app/api/generate/route.ts

import { NextResponse } from 'next/server';
import { renderSVG } from '../../../lib/render';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';

type GenerateRequest = {
  type: 'icon' | 'illustration';
  prompt: string;
  style?: string;
  colorPalette?: string;
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { type, prompt, style, colorPalette } = body;

    // 1️⃣ Generate vector
    const vector = generateVector(type, prompt, style, colorPalette);

    // 2️⃣ Run quality checks / warnings
    // Cast type string to GenerationType
    const genType: GenerationType =
      type === 'icon' ? GenerationType.Icon : GenerationType.Illustration;

    const warnings = runQualityChecks(vector, genType);

    // 3️⃣ Fix missing elements
    if (!vector.elements || vector.elements.length === 0) {
      vector.elements = [
        { type: 'rect', x: 0, y: 0, width: vector.width || 100, height: vector.height || 100, fill: 'lightgray' },
      ];
      warnings.push('No elements were generated. Placeholder applied.');
    }

    // 4️⃣ Render SVG
    const svgOutput = renderSVG(vector);

    return NextResponse.json({
      success: true,
      svg: svgOutput,
      warnings,
    });
  } catch (err: any) {
    console.error('Generation error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Unknown error' });
  }
}

// -------------------------
// Mock / simple generator logic
// -------------------------
function generateVector(type: string, prompt: string, style?: string, colorPalette?: string) {
  const base: any = { width: 100, height: 100, elements: [] };

  if (type === 'icon') {
    // Example: Eye icon mock
    if (prompt.toLowerCase().includes('eye')) {
      base.elements.push(
        { type: 'circle', cx: 50, cy: 50, r: 20, fill: 'black' },
        { type: 'circle', cx: 50, cy: 50, r: 8, fill: 'white' } // pupil
      );
    } else {
      base.elements.push({ type: 'circle', cx: 50, cy: 50, r: 30, fill: 'black' });
    }
  } else if (type === 'illustration') {
    // Example: Human figure mock
    base.elements.push(
      { type: 'rect', x: 45, y: 40, width: 10, height: 40, fill: 'blue' }, // body
      { type: 'circle', cx: 50, cy: 20, r: 10, fill: 'peachpuff' } // head
    );
  }

  return base;
}
