import { NextResponse } from 'next/server';
import { deleteMarketplaceItem, getMarketplaceListing, incrementViews } from '@/lib/database/marketplace';

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

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const adminToken = process.env.MARKETPLACE_ADMIN_TOKEN;
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Marketplace admin token is not configured' },
        { status: 500 }
      );
    }

    const supplied = request.headers.get('x-admin-token');
    if (!supplied || supplied !== adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existing = await getMarketplaceListing(params.slug);
    if (!existing) {
      return NextResponse.json({ success: true, deleted: false, slug: params.slug });
    }

    await deleteMarketplaceItem(params.slug);

    return NextResponse.json({ success: true, deleted: true, slug: params.slug });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
