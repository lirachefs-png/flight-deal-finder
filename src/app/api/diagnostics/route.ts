import { NextResponse } from 'next/server';

export async function GET() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    return NextResponse.json({
        env_check: {
            STRIPE_SECRET_KEY: stripeKey ? `Present (${stripeKey.substring(0, 7)}... Length: ${stripeKey.length})` : 'MISSING',
            DUFFEL_ACCESS_TOKEN: duffelToken ? `Present (${duffelToken.substring(0, 7)}... Length: ${duffelToken.length})` : 'MISSING',
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pubKey ? `Present (${pubKey.substring(0, 7)}... Length: ${pubKey.length})` : 'MISSING',
            NODE_ENV: process.env.NODE_ENV,
        },
        timestamp: new Date().toISOString()
    });
}
