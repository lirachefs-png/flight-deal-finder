import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

const POPULAR_DESTINATIONS = ["LIS", "OPO", "MAD", "BCN", "CDG", "FCO", "LHR", "AMS", "FRA", "GRU", "MIA", "NYC"];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');
    const date = searchParams.get('date');

    if (!origin || !maxPrice || !date) {
        return NextResponse.json(
            { error: 'Missing required parameters: origin, maxPrice, date' },
            { status: 400 }
        );
    }


    const results = [];
    const destinationsToSearch = POPULAR_DESTINATIONS.filter(d => d !== origin);

    // Concurrency limit logic could be improved, but for now serial or limited parallel 
    // to avoid rate limits on test token.

    for (const dest of destinationsToSearch) {
        try {
            await new Promise(r => setTimeout(r, 200)); // Rate limit breathing room

            const offersReq = await (duffel as any).offerRequests.create({
                slices: [{
                    origin: origin,
                    destination: dest,
                    departure_date: date
                }],
                passengers: [{ type: "adult" }],
                cabin_class: "economy",
                return_offers: true,
                limit: 1
            });

            const offers = offersReq.data.offers;

            if (offers && offers.length > 0) {
                // Find cheapest in this batch (usually sorted by default but good to check)
                // Duffel offers are not always sorted by price by default in the response, 
                // but usually are near the top. We requested 1? No, limits in create are for something else usually.
                // Duffel doesn't support 'limit' in create for offers returned directly perfectly, 
                // but 'return_offers' gives us some.

                // Let's sort the offers we got
                const sortedOffers = offers.sort((a: any, b: any) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
                const cheapest = sortedOffers[0];
                const price = parseFloat(cheapest.total_amount);

                if (price <= maxPrice) {
                    results.push({
                        destination: dest,
                        price: price,
                        currency: cheapest.total_currency,
                        airline: cheapest.owner?.name || 'Unknown',
                        duration: cheapest.slices?.[0]?.duration || 'Unknown'
                    });
                }
            }

        } catch (error) {
            console.error(`Failed to hunt search for ${dest}:`, error);
        }
    }

    // Sort by price ascending
    results.sort((a, b) => a.price - b.price);

    return NextResponse.json(results);
}
