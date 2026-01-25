// app/api/generate/route.ts
import { renderFormats } from "../../../lib/render/svg";
import { iconChecks } from "../../../lib/quality/checks";

export async function POST(request: Request) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400, headers });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "API key not configured",
          details: "ANTHROPIC_API_KEY environment variable is missing",
        })
