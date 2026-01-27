// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { renderFormats } from '../../../lib/render';
import { runQualityChecks, GenerationType } from '../../../lib/quality/checks';

type GenerateRequest = {
  type: 'icon' | 'illustration';
  vector: any;
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { type, vector } = body;

    // ---- 1️⃣ Cast type string to GenerationType enum ----
    const genType: GenerationType =
      type === 'icon' ? GenerationType.ICON : GenerationType.ILLUSTRATION;

    // ---- 2️⃣ Run quality checks / warnings ----
    const warnings = runQualityChecks(vector, genType);

    // ---- 3️⃣ Fix missing elements if vector.elements is empty ----
    if (!vector.elements || vector.elements.length === 0) {
      vector.elements = [{ type: 'rect', x: 10, y: 10, width: 80, height: 80, fill: 'black' }];
    }

    // ---- 4️⃣ Optional: add more logic to fix malformed nodes/joints ----
    // Example: prevent invisible nodes
    if (vector.elements) {
      vector.elements.forEach((el: any) => {
        if (!el.fill) el.fill = 'black';
      });
    }

    // ---- 5️⃣ Render SVG / response ----
    const svgOutput = renderFormats(vector);

    return NextResponse.json({ success: true, warnings, svg: svgOutput.svg });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
