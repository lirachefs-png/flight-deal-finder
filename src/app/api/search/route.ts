import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

export async function GET(request: Request) {
    const start = Date.now();
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('date');
    const cabin = searchParams.get('cabin')?.toLowerCase() || 'economy';
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');
    const infants = parseInt(searchParams.get('infants') || '0');

    if (!origin || !destination || !departureDate) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Construct passengers array
    const passengers: any[] = [];
    for (let i = 0; i < adults; i++) passengers.push({ type: 'adult' });
    for (let i = 0; i < children; i++) passengers.push({ type: 'child' });
    for (let i = 0; i < infants; i++) passengers.push({ type: 'infant_without_seat' });

    try {
        const searchPayload: any = {
            slices: [{ origin, destination, departure_date: departureDate }],
            passengers: passengers,
            cabin_class: cabin === 'business' ? 'business' : 'economy',
            currency: searchParams.get('currency') || undefined,
        };

        if (searchParams.get('direct') === 'true') searchPayload.max_connections = 0;

        console.log(`⏱️ API Start: ${origin} -> ${destination}`);

        // 1. DUFFEL CALL WITH 5s SOFT TIMEOUT
        // Using user-recommended "Safe Race" pattern
        const duffelPromise = duffel.offerRequests.create(searchPayload);

        const offerRequest = await Promise.race([
            duffelPromise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Duffel timeout")), 5000)
            )
        ]).catch((err) => {
            console.warn("⚠️ Soft Timeout/Error captured:", err.message);
            return null;
        }) as any;

        if (!offerRequest) {
            console.warn("⏳ Search Pending/Timeout - returning fallback signal.");
            // We throw here to trigger the robust Mock Fallback in the catch block below
            // instead of returning an empty pending state that the UI might not handle well.
            throw new Error("Timeout - Trigger Simulation");
        }

        const offers = (offerRequest.data as any).offers;

        const duration = Date.now() - start;
        console.log(`✅ Duffel Success in ${duration}ms`);

        return NextResponse.json({ data: offers }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60',
                'X-Latency-Ms': duration.toString()
            }
        });

    } catch (error: any) {
        const duration = Date.now() - start;
        console.warn(`⚠️ API Fail/Timeout (${duration}ms):`, error.message);

        // 2. FALLBACK: SIMULATION MODE
        // Return plausible mock data so the user isn't blocked.
        const mockPrice = 450 + Math.random() * 200;
        const mockOffers = [1, 2, 3].map(i => ({
            id: `mock_offer_${i}_${Date.now()}`,
            total_amount: (mockPrice + (i * 50)).toFixed(2),
            total_currency: "USD",
            owner: { name: "Airline Simulation" },
            slices: [{
                segments: [{
                    operating_carrier: { name: "Simulated Air", iata_code: "SM" },
                    duration: "PT7H30M",
                    origin: { iata_code: origin },
                    destination: { iata_code: destination }
                }]
            }]
        }));

        return NextResponse.json(
            {
                data: mockOffers,
                warning: 'Live search unavailable, showing simulation.',
                simulation: true
            },
            {
                status: 200,
                headers: {
                    'X-Fallback-Active': 'true',
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60'
                }
            }
        );
    }
}
