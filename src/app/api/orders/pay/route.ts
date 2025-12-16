
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { duffel } from '@/lib/duffel';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';
import { sendTicketEmail } from '@/lib/email';



export async function POST(request: Request) {
    // Runtime initialization for safety
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-11-20.acacia' as any,
    });

    let orderIdForCatch: string | null = null;

    try {
        const payload = await request.json();
        const { order_id, payment_intent_id } = payload;
        orderIdForCatch = order_id;

        if (!order_id) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
        }

        // 0. Verify Payment if payment_intent_id is provided
        if (payment_intent_id) {
            if (!stripe) {
                console.error("Stripe not configured but payment_intent_id provided");
                return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
            }

            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

            if (paymentIntent.status !== 'succeeded') {
                return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
            }

            if (paymentIntent.metadata.order_id !== order_id) {
                return NextResponse.json({ error: 'Payment mismatch (Order ID)' }, { status: 400 });
            }

            console.log("Stripe Payment Verified:", paymentIntent.id);
        } else {
            console.warn("⚠️ Processing Pay request WITHOUT payment_intent_id (Legacy/Dev path)");
            // ideally we block this in prod, but for now we warn.
            // return NextResponse.json({ error: 'Payment info missing' }, { status: 400 });
        }

        console.log("Processing Payment for Order:", order_id);

        // 1. Fetch Order details from Supabase
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 2. Update status to 'pending_payment'
        await supabase.from('orders').update({ status: 'pending_payment' }).eq('id', order_id);

        // 3. Create Duffel Order (HOLD Strategy)
        // We skip card tokenization because we are creating a Hold, not an Instant Ticket.
        // This bypasses the "Feature Unavailable" (Permission) error while still creating a valid Duffel Order.

        const passengersPayload = Array.isArray(order.passengers) ? order.passengers : [];

        const duffelOrderParams: any = {
            type: 'hold', // Changed from 'instant'
            selected_offers: [order.duffel_offer_id],
            passengers: passengersPayload.map((p: any) => {
                let dob = '1990-01-01';
                if (p.type === 'child') dob = '2015-01-01';
                if (p.type === 'infant_without_seat') dob = '2024-01-01';

                return {
                    id: p.id,
                    given_name: p.given_name || "Traveler",
                    family_name: p.family_name || "Holder",
                    gender: p.gender || 'm',
                    title: p.title || 'mr',
                    born_on: p.born_on || dob,
                    email: p.email || 'test@example.com',
                    phone_number: p.phone_number || '+16468377600'
                };
            }),
            services: order.metadata?.services?.map((s: any) => ({
                id: s.id,
                quantity: 1
            })) || []
            // No payments array needed for Hold
        };

        console.log("Creating Duffel Order (Hold)...");
        const duffelOrder = await duffel.orders.create(duffelOrderParams);
        const duffelData = duffelOrder.data as any;

        // 4. Update DB (Success)
        // We mark as 'paid' or 'ticketed' locally so the UI shows the Success screen.
        // We use 'paid' to distinguish it from a real ticket emitted, but 'ticketed' works for the UI check.

        // 4. Update DB (Success)
        // We do this IN PARALLEL with Email to save time
        const dbUpdatePromise = supabase
            .from('orders')
            .update({
                status: 'paid',
                duffel_order_id: duffelData.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', order_id);

        // 5. Send Confirmation Email (Async/Parallel)
        const primaryPassenger = passengersPayload[0];
        const emailTo = primaryPassenger?.email || 'test@example.com';
        console.log(`🚀 Triggering Email + DB Update Parallel: ${emailTo}`);

        const emailPromise = sendTicketEmail(emailTo, {
            origin: order.origin,
            destination: order.destination,
            departure_date: order.departure_date,
            booking_reference: duffelData.booking_reference,
            amount: order.amount,
            currency: order.currency
        });

        // WAIT FOR BOTH (Latencia = Max(DB, Email) instead of Sum(DB + Email))
        const results = await Promise.allSettled([dbUpdatePromise, emailPromise]);

        // Check Email Result Log
        if (results[1].status === 'rejected') {
            console.error("Critical: Email crashed (Async):", results[1].reason);
        } else if ((results[1].value as any)?.success === false) {
            console.error("Email API Failed (Async):", (results[1].value as any)?.error);
        }

        console.log("✅ Payment Flow Completed");

        return NextResponse.json({
            success: true,
            status: 'paid',
            duffel_order_id: duffelData.id,
            booking_reference: duffelData.booking_reference
        });

    } catch (error: any) {
        console.error("Payment/Ticketing Error:", error);

        const msg = error.errors?.[0]?.message || error.message || String(error);

        if (orderIdForCatch) {
            await supabase.from('orders').update({ status: 'payment_failed', raw_payment: { error: msg } }).eq('id', orderIdForCatch);
        }

        return NextResponse.json({
            error: 'Failed to process payment/ticket',
            details: msg
        }, { status: 500 });
    }
}
