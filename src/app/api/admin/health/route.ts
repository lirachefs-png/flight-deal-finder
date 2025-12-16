
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mock function to check Duffel latency (since we can't ping it directly from client easily without CORS, we do it server side)
async function checkDuffelLatency() {
    const start = performance.now();
    try {
        // Just a lightweight call or even a fetch to google if duffel is sensitive, 
        // but let's try a fetch to specific endpoint if known, or just dummy.
        // For now, we simulate "External API" check by fetching a public reliable CDN or just logic
        // Real implementation would be: 
        // await fetch('https://api.duffel.com/meta/status') or similar
        await new Promise(r => setTimeout(r, Math.random() * 200 + 50)); // Simulating 50-250ms latency
        return Math.round(performance.now() - start);
    } catch (e) {
        return -1;
    }
}

async function checkDBLatency() {
    const start = performance.now();
    try {
        const { error } = await supabase.from('orders').select('count', { count: 'exact', head: true });
        if (error) throw error;
        return Math.round(performance.now() - start);
    } catch (e) {
        return -1;
    }
}

export async function GET() {
    const dbLatency = await checkDBLatency();
    const apiLatency = await checkDuffelLatency();

    // Simulate some "Hacker" stats
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    const activeConnections = Math.floor(Math.random() * 50) + 120; // Simulated active "visitors"

    return NextResponse.json({
        status: dbLatency !== -1 && apiLatency !== -1 ? 'operational' : 'degraded',
        system: {
            database_latency_ms: dbLatency,
            external_api_latency_ms: apiLatency,
            memory_usage_mb: memoryUsage,
            active_connections: activeConnections,
            server_uplink: '10 Gbps', // Decoration
            region: 'gru1' // Vercel region decoration
        },
        timestamp: new Date().toISOString()
    });
}
