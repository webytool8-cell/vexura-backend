import { NextResponse } from 'next/server';
import { getMarketplaceStats } from '@/lib/database/marketplace';

export async function GET() {
  try {
    const stats = await getMarketplaceStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
