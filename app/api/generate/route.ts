// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { runQualityChecks, GenerationType } from "@/lib/quality/checks";
import { renderFormats } from "@/lib/render";
import { orchestrateGeneration } from "@/lib/orchestrator";

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

    // ✅ Strong enum mapping (no strings downstream)
    const generationType: GenerationType =
      body.type === "icon"
        ? GenerationType.ICON
        : GenerationType.ILLUSTRATION;

    // 🧠 Orchestrator call (THIS is your real generator)
    const vector = await orchestrateGeneration({
      prompt: body.prompt,
      type: generationType,
      options: body.options ?? {},
    });

    if (!vector || !Array.isArray(vector.elements)) {
      throw new Error("Invalid vector structure returned from orchestrator");
    }

    // 🧪 Quality checks (correct argument order)
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
