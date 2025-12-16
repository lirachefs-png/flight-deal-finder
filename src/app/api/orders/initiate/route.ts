
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { offer_id, trip_details, passengers, user_id, amount, currency } = payload;

        // Validation
        if (!offer_id || !user_id || !amount || !currency) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log("Initiating Order:", offer_id);

        // --- PROFIT LOGIC (SAFE START) ---
        // Calculate markup
        const baseAmount = parseFloat(amount);
        let markup = baseAmount * 0.10; // 10% default

        // Floor & Cap
        if (markup < 20) markup = 20;   // Minimum profit $20
        if (markup > 100) markup = 100; // Maximum profit $100

        const finalAmount = baseAmount + markup;
        // ---------------------------------

        // Create Order in Supabase 'orders' table
        const { data, error } = await supabase
            .from('orders')
            .insert({
                user_id: user_id,
                duffel_offer_id: offer_id, // Store offer ID to use later in Pay step
                origin: trip_details?.origin || 'UNK',
                destination: trip_details?.destination || 'UNK',
                departure_date: trip_details?.departure_date,
                return_date: trip_details?.return_date,


                amount: finalAmount, // Save total with markup
                // base_amount: baseAmount, // REMOVED: Column likely missing in DB
                // markup_amount: markup,   // REMOVED: Column likely missing in DB
                currency: currency,
                status: 'initiated', // Initial status
                passengers: passengers, // Store passenger details for booking
                // Store profit metadata inside the JSON column to avoid schema errors
                raw_offer: {
                    ...trip_details.raw_offer,
                    _profit_analytics: { base_amount: baseAmount, markup_amount: markup }
                },
            })
            .select('id') // Return the generated ID
            .single();

        if (error) {
            console.error("Supabase Initiate Error:", error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            order_id: data.id
        });

    } catch (error: any) {
        console.error("Order Initiate API Error:", error);
        return NextResponse.json({
            error: 'Failed to initiate order',
            details: error.message
        }, { status: 500 });
    }
}
