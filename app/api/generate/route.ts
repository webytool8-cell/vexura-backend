// app/api/generate/route.ts

import { NextResponse } from "next/server";
import { detectType } from "../../../lib/quality/checks";
import { buildPrompt } from "../../../lib/promptBuilder";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, type = "auto", random = false } = body;

    if (!prompt && !random) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const finalPrompt = random
      ? generateRandomPrompt(type)
      : prompt;

    const resolvedType =
      type === "auto"
        ? detectType(finalPrompt)
        : type;

    const systemPrompt = buildPrompt({
      userPrompt: finalPrompt,
      type: resolvedType,
      autoStyle: true,
      autoColor: true,
    });

    // Placeholder generation
    const svg = `<svg><!-- ${systemPrompt} --></svg>`;

    return NextResponse.json({
      type: resolvedType,
      prompt: finalPrompt,
      svg,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}

function generateRandomPrompt(type?: string) {
  const icon = [
    "shield icon",
    "settings gear",
    "user profile",
    "cloud upload",
    "lock security",
  ];

  const illustration = [
    "organic abstract flowing shapes",
    "human interacting with technology",
    "editorial illustration about creativity",
    "dynamic abstract background",
  ];

  if (type === "icon") return icon[Math.floor(Math.random() * icon.length)];
  if (type === "illustration")
    return illustration[Math.floor(Math.random() * illustration.length)];

  return [...icon, ...illustration][
    Math.floor(Math.random() * (icon.length + illustration.length))
  ];
}
