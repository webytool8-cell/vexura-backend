import { NextResponse } from 'next/server';
import { getPinterestAuthReadiness } from '@/lib/automation/pinterest-auth';

export async function GET() {
  const readiness = getPinterestAuthReadiness();

  return NextResponse.json({
    success: true,
    pinterest: readiness,
    missing: Object.entries(readiness)
      .filter(([key, value]) => key.endsWith('Configured') && value === false)
      .map(([key]) => key)
  });
}
