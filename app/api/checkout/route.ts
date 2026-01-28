Yes, if you are using TypeScript, it is much better to name the file route.ts instead of route.js to keep your project consistent. Next.js supports both, but using .ts allows you to benefit from type safety.

Here is the TypeScript version of the code.

Create file: app/api/checkout/route.ts
Copy and paste this exact code:

import Stripe from 'stripe'; import { NextResponse } from 'next/server'; // Initialize Stripe const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string); export const runtime = 'nodejs'; // Important: Stripe works best with Node.js runtime export async function POST(req: Request) { try { const body = await req.json(); const { priceId, successUrl, cancelUrl } = body; if (!priceId) { return NextResponse.json({ error: 'Price ID is required' }, { status: 400 }); } // Create Checkout Session const session = await stripe.checkout.sessions.create({ payment_method_types: ['card'], line_items: [ { price: priceId, quantity: 1, }, ], mode: 'subscription', success_url: successUrl, cancel_url: cancelUrl, }); return NextResponse.json({ url: session.url }); } catch (err: any) { console.error('Stripe Checkout Error:', err); return NextResponse.json( { error: 'Internal Server Error', details: err.message }, { status: 500 } ); } }
