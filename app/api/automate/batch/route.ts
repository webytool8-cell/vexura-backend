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
    
    for (const prompt of prompts) {
      try {
        const result = await executeAutomationPipeline(prompt);
        results.push({ success: true, prompt, ...result });
        
        // Rate limit delay
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
      } catch (error: any) {
        results.push({ success: false, prompt, error: error.message });
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
