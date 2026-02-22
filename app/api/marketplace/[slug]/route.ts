import { NextResponse } from 'next/server';
import { getMarketplaceListing, incrementViews } from '@/lib/database/marketplace';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const listing = await getMarketplaceListing(params.slug);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Increment view counter (async, don't wait)
    incrementViews(params.slug).catch(console.error);
    
    return NextResponse.json(listing);
    
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
