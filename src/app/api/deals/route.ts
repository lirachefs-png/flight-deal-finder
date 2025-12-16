import { NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';
import { addMonths, format } from 'date-fns';

// Map display names to IATA codes
const ORIGIN_MAP: Record<string, string> = {
    'Lisboa': 'LIS',
    'São Paulo': 'GRU',
    'Rio de Janeiro': 'GIG'
};

const DESTINATIONS_POOL = [
    {
        code: 'HKT',
        city: 'Phuket',
        country: 'Thailand',
        images: [
            'https://images.unsplash.com/photo-1589394815804-96696c21a37c?q=80&w=600&auto=format&fit=crop', // James Bond Island
            'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'LAX',
        city: 'Los Angeles',
        country: 'United States',
        images: [
            'https://images.unsplash.com/photo-1542259659-48849b8211a4?q=80&w=600&auto=format&fit=crop', // Hollywood
            'https://images.unsplash.com/photo-1540331547168-8b63109225b7?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'ORD',
        city: 'Chicago',
        country: 'United States',
        images: [
            'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?q=80&w=600&auto=format&fit=crop', // Bean
            'https://images.unsplash.com/photo-1627916607164-7b98131d3ae6?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1596250487330-51f6f6ad64e3?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'CPT',
        city: 'Cape Town',
        country: 'South Africa',
        images: [
            'https://images.unsplash.com/photo-1580060839134-75a5edca2e27?q=80&w=600&auto=format&fit=crop', // Table Mountain
            'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'HND',
        city: 'Tokyo',
        country: 'Japan',
        images: [
            'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop', // Tokyo Tower
            'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'DXB',
        city: 'Dubai',
        country: 'United Arab Emirates',
        images: [
            'https://images.unsplash.com/photo-1546412414-8035e1776c9a?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512453979798-5ea904ac6605?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'SIN',
        city: 'Singapore',
        country: 'Singapore',
        images: [
            'https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'BKK',
        city: 'Bangkok',
        country: 'Thailand',
        images: [
            'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=600&auto=format&fit=crop'
        ]
    },
    {
        code: 'MLE',
        city: 'Maldives',
        country: 'Maldives',
        images: [
            'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=600&auto=format&fit=crop'
        ]
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const originName = searchParams.get('origin') || 'Lisboa';
    const originCode = ORIGIN_MAP[originName] || 'LIS';

    // Force Test Token 
    // Force Test Token 
    // Token removed for security

    // Target a date ~2 months from now for "cheap" deals (closer dates are expensive)
    const departureDate = format(addMonths(new Date(), 2), 'yyyy-MM-dd');

    try {
        const activeToken = process.env.DUFFEL_ACCESS_TOKEN;
        const duffel = new Duffel({ token: activeToken! });

        console.log(`Fetching deals from ${originCode} for ${departureDate}`);

        // SMART ENGINE: Pick 3 random destinations
        const shuffled = DESTINATIONS_POOL.sort(() => 0.5 - Math.random());
        const selectedDestinations = shuffled.slice(0, 3);

        // 5s TIMEOUT RACE
        const fetchDealsPromise = Promise.all(selectedDestinations.map(async (dest) => {
            try {
                const offerRequest = await (duffel as any).offerRequests.create({
                    slices: [{ origin: originCode, destination: dest.code, departure_date: departureDate }],
                    passengers: [{ type: 'adult' }],
                    cabin_class: 'economy',
                    return_offers: true
                });

                const offers = offerRequest.data.offers;
                const cheapest = offers.sort((a: any, b: any) => parseFloat(a.total_amount) - parseFloat(b.total_amount))[0];

                if (cheapest) {
                    return {
                        id: cheapest.id,
                        city: dest.city,
                        country: dest.country,
                        price: parseFloat(cheapest.total_amount),
                        currency: cheapest.total_currency,
                        dateRange: `Ida • ${format(new Date(departureDate), 'MMM yyyy')}`,
                        images: dest.images,
                        airline: cheapest.owner.name,
                        originCode: originCode,
                        destinationCode: dest.code
                    };
                }
                return null;
            } catch (err) {
                return null;
            }
        }));

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));

        // Race!
        let results: any[] = [];
        try {
            results = await Promise.race([fetchDealsPromise, timeoutPromise]) as any[];
        } catch (e) {
            console.warn("Deals API Timeout - Switching to Mock Fallback");
            results = []; // Force empty to trigger fallback
        }

        const activeDeals = results.filter(r => r !== null);

        // Fallback or Mock Data
        if (activeDeals.length === 0) {
            return NextResponse.json({
                mock: true,
                data: selectedDestinations.map(d => ({
                    city: d.city,
                    country: d.country,
                    price: Math.floor(Math.random() * 2000) + 3000,
                    currency: "BRL",
                    dateRange: `Ida • ${format(new Date(departureDate), 'MMM yyyy')}`,
                    images: d.images,
                    originCode: originCode,
                    destinationCode: d.code
                }))
            }, {
                headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' }
            });
        }

        // Fill gaps if needed
        if (activeDeals.length < 3) {
            const fetchedCodes = new Set(activeDeals.map(d => d.city));
            const missing = selectedDestinations.filter(d => !fetchedCodes.has(d.city));
            missing.forEach(d => {
                activeDeals.push({
                    id: `mock_${Math.random()}`,
                    airline: 'Duffel Partner',
                    city: d.city,
                    country: d.country,
                    price: Math.floor(Math.random() * 2000) + 3000,
                    currency: "BRL",
                    dateRange: `Ida • ${format(new Date(departureDate), 'MMM yyyy')}`,
                    images: d.images,
                    originCode: originCode,
                    destinationCode: d.code
                });
            });
        }

        return NextResponse.json({ data: activeDeals }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' }
        });

    } catch (error) {
        console.error("Deals API Critical Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
