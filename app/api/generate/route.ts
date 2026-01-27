// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { runQualityChecks } from '../../../lib/quality/checks';
import { renderFormats } from '../../../lib/render/svg';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, prompt, vector } = body;

    if (!vector || !vector.elements || !vector.elements.length) {
      return NextResponse.json({
        success: false,
        error: 'Vector data missing or empty.',
      });
    }

    // ---------- 1. Run quality checks ----------
    const warnings = runQualityChecks(vector, type);

    // ---------- 2. Optionally fetch illustration references ----------
    // Placeholder if you implement reference system later
    const illustrationReferences: string[] = [];

    // ---------- 3. Render SVG ----------
    const svgOutput = renderFormats.svg(vector);

    // ---------- 4. Return response ----------
    return NextResponse.json({
      success: true,
      svg: svgOutput,
      warnings,
      references: illustrationReferences,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Unknown error',
    });
  }
}
