import { NextResponse } from 'next/server';
import { listMarketplaceItems } from '@/lib/database/marketplace';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const items = await listMarketplaceItems(limit, offset);
    
    return NextResponse.json({
      items,
      count: items.length,
      limit,
      offset
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
