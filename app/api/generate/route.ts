// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';
import { renderFormats } from '../../../lib/render';

type GenerateRequest = {
  type: 'icon' | 'illustration';
  // add other fields as needed
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const type = body.type;

    // Map type string to GenerationType
    const genType: GenerationType =
      type === 'icon' ? GenerationType.ICON : GenerationType.ILLUSTRATION;

    // Create a default vector object (replace with real generation later)
    let vector: any = {
      elements: [
        // Example element to prevent undefined errors
        { id: 1, shape: 'circle', color: '#000000', size: 50, x: 50, y: 50 },
      ],
    };

    // Run quality checks safely
    const warnings = runQualityChecks(vector, genType);

    // Render SVG safely
    const svgOutput = renderFormats(vector);

    // Return response
    return NextResponse.json({
      success: true,
      vector,
      svg: svgOutput?.svg ?? '<svg></svg>', // fallback
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
