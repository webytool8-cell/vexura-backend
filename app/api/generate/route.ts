// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';
import { renderFormats } from '../../../lib/render';

type GenerateRequest = {
  type: 'icon' | 'illustration';
  // other fields as needed
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const type = body.type;

    // 1️⃣ Map type to GenerationType safely
    const genType: GenerationType =
      type === 'icon' ? GenerationType.ICON : GenerationType.ILLUSTRATION;

    // 2️⃣ Generate vector (your existing generation logic)
    // Wrap in try/catch in case generation fails
    let vector: any = {};
    try {
      vector = await generateVector(genType, body); // <-- your generation function
    } catch (err) {
      console.error('Vector generation failed:', err);
      vector = {};
    }

    // 3️⃣ Ensure vector has safe structure
    vector = vector ?? {};
    vector.elements = Array.isArray(vector.elements) ? vector.elements : [];

    // 4️⃣ Run quality checks safely
    const warnings = runQualityChecks(vector, genType);

    // 5️⃣ Render SVG safely
    const svgOutput = renderFormats(vector);

    // 6️⃣ Return response
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
