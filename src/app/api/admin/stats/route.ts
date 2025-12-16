import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/adminAuth';

export async function GET(request: Request) {
    // 1. Check Auth via Bearer Token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || !isAdminEmail(user.email)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Fetch Stats
        // We need to calculate total revenue. Supabase doesn't have a simple "sum" API without fetching, 
        // unless we use a stored procedure or fetch all (expensive but okay for MVP).
        // Let's fetch "paid" and "ticketed" orders.

        const { data: orders, error } = await supabase
            .from('orders')
            .select('amount, currency, status, created_at, id, passenger_details, origin, destination')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const totalOrders = orders.length;

        // Calculate Revenue (Basic approximation: sum all, converting roughly if needed, or just sum main currency)
        // For MVP, let's just display BRL and EUR separately or sum them as raw numbers if user mostly uses one.
        // Let's sum by currency.
        const revenueByCurrency: Record<string, number> = {};

        orders.forEach((order: any) => {
            if (['paid', 'ticketed'].includes(order.status)) {
                const curr = order.currency || 'EUR';
                const amt = Number(order.amount) || 0;
                revenueByCurrency[curr] = (revenueByCurrency[curr] || 0) + amt;
            }
        });

        // 3. Recent Orders (Take top 10 from the already fetched list)
        const recentOrders = orders.slice(0, 10);

        return NextResponse.json({
            stats: {
                totalOrders,
                revenue: revenueByCurrency
            },
            recentOrders
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
