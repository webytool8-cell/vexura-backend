import { NextResponse } from 'next/server';
import { getMarketplaceListing } from '@/lib/database/marketplace';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const listing = await getMarketplaceListing(params.slug);
  
  if (!listing) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(listing);
}
