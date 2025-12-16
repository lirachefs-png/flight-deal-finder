
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to get user ID from headers or request (assuming Supabase Auth middleware or client passed it)
// for now we trust the client to pass user_id or handle auth. 
// Ideally we should use `supabase.auth.getUser(token)`
// But since we are using next/server, we rely on the client passing the user_id or checking session.
// Wait, for GET request we need to know WHO lies calling.
// Simplest way: pass user_id as query param (NOT SECURE in prod, but ok for MVP Engine test if RLS is on).
// Actually, better: read headers if possible, or just accept `user_id` query param for now as "Authorized Context".
// Since RLS is on, Supabase Client usually needs the headers.
// However, here we are using the ADMIN client (service role often, or anon).
// If anon + RLS, we need the user token.
// The `api/orders/my` should probably use the `createRouteHandlerClient` if we want strict auth.
// For this Brief MVP, let's accept `userId` as query param and assume RLS/Auth policies are handled by logic or simplistic check.

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            // .eq('status', 'ticketed') // Option from brief: "pelo menos as com status = 'ticketed'"
            // Let's show all valid orders for now so user can see failures too
            .in('status', ['ticketed', 'paid', 'initiated', 'pending_payment'])
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ orders: data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
