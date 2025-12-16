
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const duffel = process.env.DUFFEL_ACCESS_TOKEN;
    const stripe = process.env.STRIPE_SECRET_KEY;

    return NextResponse.json({
        duffel: {
            configured: !!duffel,
            prefix: duffel ? duffel.substring(0, 12) : 'MISSING',
            is_test: duffel ? duffel.includes('test') : false
        },
        stripe: {
            configured: !!stripe,
            prefix: stripe ? stripe.substring(0, 8) : 'MISSING',
            is_test: stripe ? stripe.includes('test') : false
        }
    });
}
