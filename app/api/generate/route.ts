// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';
import { renderFormats } from '../../../lib/render';
import { generateVector } from '../../../lib/generation'; // make sure this path is correct

type GenerateRequest = {
  type: 'icon' | 'illustration';
  // add any other fields your generation function needs
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const type = body.type;

    // 1️⃣ Map type string to GenerationType enum
    const genType: GenerationType =
      type === 'icon' ? GenerationType.ICON : GenerationType.ILLUSTRATION;

    // 2️⃣ Generate vector safely
    let vector: any = {};
    try {
      vector = await generateVector(genType, body);
    } catch (err) {
      console.error('Vector generation failed:', err);
      vector = {};
    }

    // 3️⃣ Ensure vector structure is safe
    vector = vector ?? {};
    vector.elements = Array.isArray(vector.elements) ? vector.elements : [];

    // 4️⃣ Run quality checks safely
    const warnings = runQualityChecks(vector, genType);

    // 5️⃣ Render SVG safely
    const svgOutput = renderFormats(vector);

    // 6️⃣ Return full response
    return NextResponse.json({
      success: true,
      vector,
      svg: svgOutput?.svg ?? '<svg></svg>', // fallback SVG
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
