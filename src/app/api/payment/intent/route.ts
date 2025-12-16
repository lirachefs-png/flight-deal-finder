import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

// Static stripe removed - instantiated dynamically in handler
// const stripe = new Stripe(...)

export async function POST(request: Request) {
    try {
        // Dynamic Stripe instantiation handles the client
        // if (!stripe) ... default check removed
        const { order_id } = await request.json();

        if (!order_id) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
        }

        // 1. Fetch Order
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (error || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 2. Create PaymentIntent
        // Validation: Verify amount is a valid number
        const rawAmount = Number(order.amount);
        if (isNaN(rawAmount) || rawAmount <= 0) {
            console.error("Invalid Order Amount:", order.amount);
            return NextResponse.json({ error: `Invalid order amount: ${order.amount}` }, { status: 400 });
        }

        const amountInCents = Math.round(rawAmount * 100);

        // Stripe minimum is approx $0.50 USD. 
        if (amountInCents < 50) {
            return NextResponse.json({ error: 'Amount too small for Stripe processing' }, { status: 400 });
        }

        console.log(`Creating Intent: Amount=${amountInCents} (cents), Currency=${order.currency || 'brl'}`);

        // --- SMART MULTI-CURRENCY STRIPE (FORCED KEYS) ---
        const isBRL = (order.currency || '').toUpperCase() === 'BRL';

        // HARDCODED KEYS AS REQUESTED (User provided via chat)
        // HARDCODED KEYS AS REQUESTED (User provided via chat)
        const SK_BR = process.env.STRIPE_SECRET_KEY_BR || process.env.STRIPE_SECRET_KEY;
        const SK_EU = process.env.STRIPE_SECRET_KEY_EU || process.env.STRIPE_SECRET_KEY;

        const secretKey = isBRL ? SK_BR : SK_EU;

        const dynamicStripe = new Stripe(secretKey!, {
            apiVersion: '2024-11-20.acacia' as any,
        });

        // FORCE PIX for BRL to bypass Dashboard configuration issues
        let intentParams: any = {
            amount: amountInCents,
            currency: order.currency || 'brl',
            metadata: {
                order_id: order_id,
            },
        };

        // Use Automatic Payment Methods for all currencies.
        // This allows Stripe to dynamically determine valid methods (Pix, Boleto, etc.) based on Dashboard settings
        // and prevents crashes if a specific method (like Pix) is not enabled in the account.
        intentParams.automatic_payment_methods = { enabled: true };
        // Removed manual payment_method_types ['card', 'pix', 'boleto'] causing validation errors.

        const paymentIntent = await dynamicStripe.paymentIntents.create(intentParams);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (err: any) {
        console.error('CRITICAL STRIPE ERROR:', err);
        const detailedError = `Stripe Connection Failed: ${err.message}. Check Vercel Environment Variables (STRIPE_SECRET_KEY).`;
        return NextResponse.json({ error: detailedError, original_error: err.message }, { status: 500 });
    }
}
