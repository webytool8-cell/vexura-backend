import { NextResponse } from 'next/server';
import { createMarketplaceListing } from '@/lib/database/marketplace';
import { enrichMetadataFromJSON } from '@/lib/automation/metadata-enricher';
import { validateAndFixIcon, calculateQualityScore } from '@/lib/validators/icon-validator'; // ADD THIS

function shouldEnforceMonochrome(promptText?: string): boolean {
  if (!promptText) return false;
  return /\b(monochrome|monotone|black\s*(and|&)\s*white|grayscale|single\s*color)\b/i.test(promptText);
}

export async function POST(request: Request) {
  try {
    const { vectorData, fileName, prompt } = await request.json();
    
    if (!vectorData) {
      return NextResponse.json(
        { error: 'Vector data is required' },
        { status: 400 }
      );
    }

    // Validate structure
    if (!vectorData.name || !vectorData.elements) {
      return NextResponse.json(
        { error: 'Invalid vector format. Must include "name" and "elements"' },
        { status: 400 }
      );
    }

    // VALIDATE AND FIX (NEW!)
    const validation = validateAndFixIcon(vectorData, { enforceMonochrome: shouldEnforceMonochrome(prompt) });
    const score = calculateQualityScore(validation);
    
    if (validation.errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Icon validation failed',
          errors: validation.errors,
          warnings: validation.warnings
        },
        { status: 400 }
      );
    }
    
    // Use fixed version
    const fixedVector = validation.fixed;

    // Generate metadata
    const enriched = enrichMetadataFromJSON(fixedVector, fileName);
    
    // Add validation info
    enriched.validation = {
      score,
      warnings: validation.warnings,
      autoFixed: validation.warnings.length > 0
    };

    // Save to database
    const listing = await createMarketplaceListing(enriched);

    console.log('✅ Manual upload successful:', listing.slug);

    return NextResponse.json({
      success: true,
      slug: listing.slug,
      id: listing.id,
      score,
      warnings: validation.warnings,
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
