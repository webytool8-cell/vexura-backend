import { NextResponse } from 'next/server';
import { createMarketplaceListing } from '@/lib/database/marketplace';
import { enrichMetadataFromJSON } from '@/lib/automation/metadata-enricher';

export async function POST(request: Request) {
  try {
    const { vectorData, fileName } = await request.json();
    
    if (!vectorData) {
      return NextResponse.json(
        { error: 'Vector data is required' },
        { status: 400 }
      );
    }

    // Validate vector structure
    if (!vectorData.name || !vectorData.elements) {
      return NextResponse.json(
        { error: 'Invalid vector format. Must include "name" and "elements"' },
        { status: 400 }
      );
    }

    // Generate metadata from filename and vector data
    const enriched = enrichMetadataFromJSON(vectorData, fileName);

    // Save to database
    const listing = await createMarketplaceListing(enriched);

    console.log('✅ Manual upload successful:', listing.slug);

    return NextResponse.json({
      success: true,
      slug: listing.slug,
      id: listing.id,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${listing.slug}`
    });

  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
