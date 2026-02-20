import { NextResponse } from 'next/server';
import { executeAutomationPipeline } from '@/lib/automation/pipeline';

export async function POST(request: Request) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await executeAutomationPipeline(prompt, options);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Automation failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
