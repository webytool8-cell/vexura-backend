import { NextResponse } from 'next/server';
import { searchMarketplace } from '@/lib/database/marketplace';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }
    
    const results = await searchMarketplace(query);
    
    return NextResponse.json({
      results,
      count: results.length,
      query
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
