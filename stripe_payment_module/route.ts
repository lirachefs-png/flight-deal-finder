
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    // Runtime initialization to ensure Env Vars are loaded
    const stripeKey = process.env.STRIPE_SECRET_KEY || "";
    const stripe = stripeKey ? new Stripe(stripeKey, {}) : null as any;

    try {
        console.log("Stripe Key Status:", stripeKey ? "Loaded" : "Missing", "Length:", stripeKey.length);

        if (!stripe) {
            console.error("Stripe key missing in runtime");
            return NextResponse.json({ error: 'Stripe configuration missing', debug_key_len: stripeKey.length }, { status: 500 });
        }
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

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: order.currency || 'brl',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                order_id: order_id,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (err: any) {
        console.error('Error creating payment intent:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
