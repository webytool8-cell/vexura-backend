import { NextResponse } from 'next/server';
import { exchangePinterestCodeForToken } from '@/lib/automation/pinterest-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error,
        errorDescription: searchParams.get('error_description')
      },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing "code" query parameter.'
      },
      { status: 400 }
    );
  }

  try {
    const token = await exchangePinterestCodeForToken(code);

    return NextResponse.json({
      success: true,
      message:
        'Pinterest OAuth exchange succeeded. Save access_token and refresh_token into your environment store before enabling auto-post in production.',
      token
    });
  } catch (exchangeError: any) {
    return NextResponse.json(
      {
        success: false,
        error: exchangeError?.message || 'Pinterest OAuth code exchange failed.'
      },
      { status: 500 }
    );
  }
}
