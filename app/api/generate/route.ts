// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';
import { renderFormats } from '../../../lib/render';

type GenerateRequest = {
  type: 'icon' | 'illustration';
  // add other fields as needed
};

// Mock generator for now
function mockGenerateVector(type: GenerationType) {
  if (type === GenerationType.ICON) {
    return {
      elements: [
        { id: 1, shape: 'circle', fill: '#FF0000', x: 50, y: 50, r: 20 },
        { id: 2, shape: 'rect', fill: '#00FF00', x: 30, y: 30, width: 40, height: 20 },
      ],
    };
  } else {
    // Illustration example
    return {
      elements: [
        { id: 1, shape: 'circle', fill: '#0000FF', x: 100, y: 100, r: 40 },
        { id: 2, shape: 'line', stroke: '#000', x1: 80, y1: 80, x2: 120, y2: 120, strokeWidth: 3 },
        { id: 3, shape: 'rect', fill: '#FFA500', x: 50, y: 150, width: 100, height: 50 },
      ],
    };
  }
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const type = body.type;

    // Map type string to GenerationType
    const genType: GenerationType =
      type === 'icon' ? GenerationType.ICON : GenerationType.ILLUSTRATION;

    // 1️⃣ Generate vector using mock generator
    const vector = mockGenerateVector(genType);

    // 2️⃣ Run quality checks safely
    const warnings = runQualityChecks(vector, genType);

    // 3️⃣ Render SVG safely
    const svgOutput = renderFormats(vector);

    // 4️⃣ Return response
    return NextResponse.json({
      success: true,
      vector,
      svg: svgOutput?.svg ?? '<svg></svg>',
      warnings,
    });
  } catch (err) {
    console.error('Orchestration error:', err);
    return NextResponse.json({
      success: false,
      error: 'Generation failed',
    });
  }
}
