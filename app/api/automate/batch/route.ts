import { NextResponse } from 'next/server';
import { executeAutomationPipeline } from '@/lib/automation/pipeline';

export async function POST(request: Request) {
  try {
    const { prompts, delayMs = 3000 } = await request.json();

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json(
        { error: 'Prompts array is required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const promptItem of prompts) {
      const prompt = typeof promptItem === 'string' ? promptItem : promptItem?.prompt;
      const price = typeof promptItem === 'object' ? promptItem?.price : undefined;
      const type = typeof promptItem === 'object' ? promptItem?.type : undefined;

      if (!prompt || typeof prompt !== 'string') {
        results.push({ success: false, prompt: String(prompt), error: 'Invalid prompt item' });
        continue;
      }

      try {
        const result = await executeAutomationPipeline(prompt, { price, type });
        results.push({ success: true, prompt, price: price ?? 0, type: type ?? 'auto', ...result });

        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error: any) {
        results.push({ success: false, prompt, type: type ?? 'auto', error: error.message });
      }
    }

    return NextResponse.json({
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
