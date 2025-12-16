
const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in Node 18+

const BASE_URL = "https://flight-deal-finder.vercel.app";

async function checkEndpoint(name, url, method = 'GET', body = null) {
    console.log(`\n🔍 Testing ${name}...`);
    try {
        const options = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { 'Content-Type': 'application/json' };
        }

        const start = Date.now();
        const res = await fetch(url, options);
        const duration = Date.now() - start;

        console.log(`   Status: ${res.status}`);
        console.log(`   Latency: ${duration}ms`);

        const data = await res.json();

        if (res.ok) {
            console.log(`   ✅ Success`);
            return { success: true, data };
        } else {
            console.log(`   ❌ Failed: ${data.error || res.statusText}`);
            return { success: false, error: data };
        }
    } catch (e) {
        console.log(`   ❌ Network Error: ${e.message}`);
        return { success: false, error: e.message };
    }
}

async function runDiagnostics() {
    console.log("💀 HACKER MODE: SYSTEM DIAGNOSTICS INITIATED 💀");
    console.log("Target: " + BASE_URL);

    // 1. Check Locations (Basic DB/Cache)
    await checkEndpoint('Locations API (Public)', `${BASE_URL}/api/locations?keyword=LIS`);

    // 2. Check Search (Duffel Integration)
    const searchRes = await checkEndpoint('Flight Search (Duffel Status)',
        `${BASE_URL}/api/search?origin=LIS&destination=LON&date=2025-05-20&adults=1`
    );

    if (searchRes.success) {
        if (searchRes.data.simulation) {
            console.log("   ⚠️ WARNING: API is in SIMULATION MODE (Duffel Token Missing/Fail)");
        } else {
            console.log("   🎉 REAL DATA DETECTED! Duffel is ONLINE.");
        }
    }

    // 3. Check Payment Intent (Stripe Status)
    // We need a fake order ID to test this, typically. Or we verify if it rejects missing ID correctly.
    const stripeRes = await checkEndpoint('Stripe Connection (Intent Check)',
        `${BASE_URL}/api/payment/intent`,
        'POST',
        { order_id: 'test_HACKER_MODE' } // Will fail with 404 but should not be 500
    );

    // Verify if error is "Order not found" (Good, means logic ran) or "Internal Server Error/Stripe Connection Failed" (Bad)
    if (stripeRes.error && stripeRes.error.error === 'Order not found') {
        console.log("   ✅ Stripe Logic Active (Code reached DB check).");
    } else if (stripeRes.error && stripeRes.error.detailedError) {
        console.log("   ❌ CRITICAL: Stripe Key Missing/Invalid!");
    }

    console.log("\n🏁 DIAGNOSTICS COMPLETE 🏁");
}

runDiagnostics();
