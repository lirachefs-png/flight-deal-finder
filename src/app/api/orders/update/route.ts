import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { order_id, services, total_amount } = body;

        if (!order_id || !services || !total_amount) {
            return NextResponse.json({ error: 'Missing req fields' }, { status: 400 });
        }

        // 1. Validate Order Logic
        // In a real app, verify individual service prices here to prevent tampering.
        // E.g. calc = base + (bags * 180) ...
        // For MVP, we trust the client logic but verify status 'pending'

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status !== 'pending') {
            return NextResponse.json({ error: 'Order cannot be modified' }, { status: 400 });
        }

        // 2. Perform Update
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                amount: total_amount,
                metadata: { ...order.metadata, services: services } // Merge existing metadata if any
            })
            .eq('id', order_id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Update Order Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
