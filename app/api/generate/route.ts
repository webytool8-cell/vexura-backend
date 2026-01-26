// app/api/generate/route.ts

import { NextResponse } from "next/server";
import { detectType } from "@/lib/checks";
import { buildPrompt } from "@/lib/promptBuilder";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      prompt,
      type, // "icon" | "illustration" | "auto"
      advanced = {},
      random = false,
    } = body;

    if (!prompt && !random) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const resolvedPrompt = random
      ? generateRandomPrompt(type)
      : prompt;

    const resolvedType =
      type === "auto" || !type
        ? detectType(resolvedPrompt)
        : type;

    const finalPrompt = buildPrompt({
      userPrompt: resolvedPrompt,
      type: resolvedType,
      autoStyle: advanced.style === "auto",
      autoColor: advanced.color === "auto",
    });

    // 🔴 Replace this with your actual image/SVG generation call
    const result = await fakeGenerate(finalPrompt);

    return NextResponse.json({
      type: resolvedType,
      prompt: resolvedPrompt,
      svg: result,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function generateRandomPrompt(type?: string) {
  const iconPrompts = [
    "security shield icon",
    "cloud upload icon",
    "settings gear icon",
    "user profile icon",
    "notification bell icon",
  ];

  const illustrationPrompts = [
    "a person exploring ideas in a creative workspace",
    "organic abstract shapes representing creativity",
    "human and technology working together",
    "flowing forms representing innovation",
    "editorial illustration about growth and learning",
  ];

  const pool =
    type === "illustration"
      ? illustrationPrompts
      : type === "icon"
      ? iconPrompts
      : [...iconPrompts, ...illustrationPrompts];

  return pool[Math.floor(Math.random() * pool.length)];
}

// TEMP placeholder
async function fakeGenerate(prompt: string) {
  return `<svg><!-- Generated SVG based on: ${prompt} --></svg>`;
}
