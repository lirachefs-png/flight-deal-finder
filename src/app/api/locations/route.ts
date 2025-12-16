import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

const STATIC_HUBS = [
    { iataCode: 'LIS', name: 'Humberto Delgado Airport', address: { cityName: 'Lisbon', countryName: 'Portugal' } },
    { iataCode: 'OPO', name: 'Francisco Sá Carneiro Airport', address: { cityName: 'Porto', countryName: 'Portugal' } },
    { iataCode: 'GRU', name: 'Guarulhos', address: { cityName: 'São Paulo', countryName: 'Brasil' } },
    { iataCode: 'JFK', name: 'John F. Kennedy', address: { cityName: 'New York', countryName: 'USA' } },
    { iataCode: 'LHR', name: 'Heathrow', address: { cityName: 'London', countryName: 'UK' } },
    { iataCode: 'CDG', name: 'Charles de Gaulle', address: { cityName: 'Paris', countryName: 'France' } }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 2) return NextResponse.json({ data: [] });

    try {
        // 1. DUFFEL CALL WITH 2s TIMEOUT
        const duffelPromise = (duffel as any).suggestions.list({ query: keyword, limit: 5 });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));

        const response = await Promise.race([duffelPromise, timeoutPromise]) as any;
        const places = response.data;

        const transformedData = places.map((place: any) => {
            let country = place.country_name;
            if (!country) {
                if (place.iata_country_code === 'BR') country = "Brasil";
                else if (place.iata_country_code === 'US') country = "EUA";
                else if (place.iata_country_code === 'PT') country = "Portugal";
                else country = place.iata_country_code;
            }
            return {
                iataCode: place.iata_code,
                name: place.name,
                address: { cityName: place.city_name || place.name, countryName: country || "" }
            };
        }).filter((p: any) => p.iataCode);

        return NextResponse.json({ data: transformedData }, {
            headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400' }
        });

    } catch (error: any) {
        console.warn("Locations API Slow/Fail. Serving Static Fallback.");
        // 2. FALLBACK: Filter Static List
        const fallback = STATIC_HUBS.filter(h =>
            h.iataCode.includes(keyword.toUpperCase()) ||
            h.address.cityName.toLowerCase().includes(keyword.toLowerCase())
        );
        return NextResponse.json({ data: fallback }, {
            headers: {
                'X-Fallback-Active': 'true',
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400'
            }
        });
    }
}
