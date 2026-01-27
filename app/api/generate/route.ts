// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { renderSVG } from '../../../lib/render';
import { runQualityChecks } from '../../../lib/quality/checks';

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

    // ---- 1. Generate vector based on prompt ----
    // This is your core generation logic. Replace with AI/vector generation if needed.
    const vector = generateVectorMock(type, prompt, style, colorPalette);

    // ---- 2. Run quality checks ----
    const warnings = runQualityChecks(vector, type);

    // ---- 3. Fallback for missing elements ----
    if (!vector.elements || vector.elements.length === 0) {
      // generate a default placeholder element so SVG still renders
      vector.elements = [
        { type: 'rect', x: 0, y: 0, width: vector.width || 100, height: vector.height || 100, fill: 'lightgray' },
      ];
      warnings.push('No elements were generated. Placeholder applied.');
    }

    // ---- 4. Render SVG ----
    const svgOutput = renderSVG(vector);

    // ---- 5. Return response ----
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

// -------- MOCK VECTOR GENERATION (replace with real AI/vector logic) --------
function generateVectorMock(type: string, prompt: string, style?: string, colorPalette?: string) {
  // Placeholder logic to simulate vector output
  const base: any = { width: 100, height: 100, elements: [] };

  if (type === 'icon') {
    base.elements.push({ type: 'circle', cx: 50, cy: 50, r: 30, fill: 'black' });
  } else if (type === 'illustration') {
    base.elements.push(
      { type: 'rect', x: 20, y: 20, width: 60, height: 60, fill: 'blue' },
      { type: 'circle', cx: 50, cy: 50, r: 10, fill: 'red' }
    );
  }

  return base;
}
