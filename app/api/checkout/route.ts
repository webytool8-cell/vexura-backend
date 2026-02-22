import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      throw new Error('Missing NEXT_PUBLIC_SITE_URL');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // change to "payment" if one-time
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success`,
      cancel_url: `${siteUrl}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: err.message,
      },
      { status: 500 }
    );
  }
}

