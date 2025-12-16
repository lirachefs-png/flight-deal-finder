
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv(key) {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Could not find Supabase keys in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getLatestOrder() {
    const { data, error } = await supabase
        .from('orders')
        .select('id')
        .neq('status', 'ticketed') // Prefer non-ticketed for testing payment
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        // Check if data is null (no orders found)
        if (!data) {
            console.log("NO_ORDERS_FOUND");
        } else {
            console.log('LATEST_ORDER_ID:', data.id);
        }
    }
}

getLatestOrder();
