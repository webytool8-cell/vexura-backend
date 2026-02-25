import { NextResponse } from 'next/server';
import { executeAutomationPipeline } from '@/lib/automation/pipeline';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, price, type } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt string is required' },
        { status: 400 }
      );
    }

    const result = await executeAutomationPipeline(prompt, { price, type });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
