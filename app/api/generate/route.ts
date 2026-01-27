// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runQualityChecks, autoRepairVector, GenerationType, getIllustrationReferences } from '../../../lib/quality/checks';
import { renderFormats } from '../../../lib/render/svg';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type, options } = body;

    // Validate type
    const vectorType: GenerationType =
      type === 'illustration' ? GenerationType.ILLUSTRATION : GenerationType.ICON;

    // ---- 1. Generate vector from prompt ----
    // Replace this with your actual generation logic / AI call
    let vector = await generateVectorFromPrompt(prompt, vectorType, options);

    // ---- 2. Auto-repair missing elements / invisible fills ----
    vector = autoRepairVector(vector, vectorType);

    // ---- 3. Run quality checks / scoring ----
    const warnings = runQualityChecks(vector, vectorType);

    // ---- 4. Optionally attach reference info (illustrations only) ----
    let references: string[] = [];
    if (vectorType === GenerationType.ILLUSTRATION) {
      references = getIllustrationReferences();
    }

    // ---- 5. Render SVG / response ----
    const svgOutput = renderFormats(vector);

    return NextResponse.json({
      success: true,
      svg: svgOutput,
      warnings,
      references,
    });
  } catch (err: any) {
    console.error('Error generating vector:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ----- MOCK FUNCTION -----
// Replace this with your AI/vector generation call
async function generateVectorFromPrompt(prompt: string, type: GenerationType, options: any): Promise<any> {
  // Example: returns a placeholder vector
  return {
    width: 128,
    height: 128,
    elements: [
      { type: 'circle', cx: 64, cy: 64, r: 32, fill: 'none', stroke: '#000', strokeWidth: 2, name: 'example-circle' }
    ]
  };
}
