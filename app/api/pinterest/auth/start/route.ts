import { NextResponse } from 'next/server';
import { buildPinterestAuthUrl } from '@/lib/automation/pinterest-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    const mode = searchParams.get('mode') || 'json';
    const authUrl = buildPinterestAuthUrl(state);

    if (mode === 'redirect') {
      return NextResponse.redirect(authUrl);
    }

    return NextResponse.json({
      success: true,
      authUrl
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to create Pinterest auth URL.'
      },
      { status: 500 }
    );
  }
}
