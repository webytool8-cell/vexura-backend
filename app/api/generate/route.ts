// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "@/lib/quality/checks";
import { renderFormats } from "@/lib/render";
import { generateVector } from "@/lib/generation/generateVector";

type GenerateRequest = {
  type: "icon" | "illustration";
  prompt: string;
  options?: Record<string, any>;
};

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body?.prompt || !body?.type) {
      return NextResponse.json(
        { success: false, error: "Missing prompt or type" },
        { status: 400 }
      );
    }

    // 🔒 Strong enum mapping (no strings past this point)
    const generationType: GenerationType =
      body.type === "icon"
        ? GenerationType.ICON
        : GenerationType.ILLUSTRATION;

    // 🧠 Generate vector
    const vector = await generateVector({
      prompt: body.prompt,
      type: generationType,
      options: body.options ?? {},
    });

    if (!vector || !Array.isArray(vector.elements)) {
      throw new Error("Invalid vector structure");
    }

    // 🧪 Run quality checks (FIXED ARG ORDER)
    const warnings = runQualityChecks(
      body.prompt,
      generationType
    );

    // 🖼 Render SVG
    const rendered = renderFormats(vector);

    if (!rendered?.svg) {
      throw new Error("SVG rendering failed");
    }

    return NextResponse.json({
      success: true,
      vector,
      svg: rendered.svg,
      warnings,
    });
  } catch (error: any) {
    console.error("<< Orchestration Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Generation Failed",
        details: error?.message ?? null,
      },
      { status: 500 }
    );
  }
}
