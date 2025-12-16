
import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        const { offer_id, passengers, user_id, trip_details } = payload;

        if (!offer_id || !passengers || !user_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        console.log("Creating Hold Order for:", offer_id);

        const passengersPayload = Array.isArray(passengers) ? passengers : [];

        // 1. Create Hold Order in Duffel
        const orderParams: any = {
            type: 'hold',
            selected_offers: [offer_id],
            passengers: passengersPayload.map((p: any) => ({
                id: p.id,
                given_name: p.given_name || "Traveler",
                family_name: p.family_name || "Holder",
                gender: p.gender || 'm',
                title: p.title || 'mr',
                born_on: p.born_on || '1990-01-01',
                email: p.email || 'test@example.com',
                phone_number: p.phone_number || '+16468377600'
            })),
        };

        const order = await duffel.orders.create(orderParams);
        const orderData = order.data as any; // Bypass TS check for missing fields in SDK

        console.log("Duffel Order Created:", orderData.id);

        // 2. Save to Supabase 'orders' table
        const { error: dbError } = await supabase.from('orders').insert({
            user_id: user_id,
            duffel_order_id: orderData.id,
            origin: trip_details?.origin || 'Unknown',
            destination: trip_details?.destination || 'Unknown',
            departure_date: trip_details?.departure_date || null,
            amount: parseFloat(orderData.total_amount),
            currency: orderData.total_currency,
            payment_required_by: orderData.payment_required_by,
            status: 'held',
        });

        if (dbError) {
            console.error("Supabase Error:", dbError);
        }

        return NextResponse.json({
            success: true,
            order_id: orderData.id,
            payment_required_by: orderData.payment_required_by
        });

    } catch (error: any) {
        console.error("Hold API Error:", error);
        const msg = error.errors?.[0]?.message || error.message || String(error);
        return NextResponse.json({
            error: 'Failed to create hold',
            details: msg
        }, { status: 500 });
    }
}
