import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

const STATIC_HUBS = [
    { iataCode: 'LIS', name: 'Humberto Delgado Airport', address: { cityName: 'Lisbon', countryName: 'Portugal' } },
    { iataCode: 'OPO', name: 'Francisco Sá Carneiro Airport', address: { cityName: 'Porto', countryName: 'Portugal' } },
    { iataCode: 'GRU', name: 'Guarulhos', address: { cityName: 'São Paulo', countryName: 'Brasil' } },
    { iataCode: 'VCP', name: 'Viracopos', address: { cityName: 'Campinas', countryName: 'Brasil' } },
    { iataCode: 'JPA', name: 'Castro Pinto', address: { cityName: 'João Pessoa', countryName: 'Brasil' } },
    { iataCode: 'REC', name: 'Guararapes', address: { cityName: 'Recife', countryName: 'Brasil' } },
    { iataCode: 'GIG', name: 'Galeão', address: { cityName: 'Rio de Janeiro', countryName: 'Brasil' } },
    { iataCode: 'BSB', name: 'Pres. Juscelino Kubitschek', address: { cityName: 'Brasília', countryName: 'Brasil' } },
    { iataCode: 'JFK', name: 'John F. Kennedy', address: { cityName: 'New York', countryName: 'USA' } },
    { iataCode: 'LHR', name: 'Heathrow', address: { cityName: 'London', countryName: 'UK' } },
    { iataCode: 'CDG', name: 'Charles de Gaulle', address: { cityName: 'Paris', countryName: 'France' } }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 2) return NextResponse.json({ data: [] });

    try {
        // 1. DUFFEL CALL WITH 5s TIMEOUT (Increased)
        const duffelPromise = (duffel as any).suggestions.list({ query: keyword, limit: 5 });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));

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

        let finalData = transformedData;

        if (finalData.length === 0) {
            const fallback = STATIC_HUBS.filter(h =>
                h.iataCode.includes(keyword.toUpperCase()) ||
                h.address.cityName.toLowerCase().includes(keyword.toLowerCase())
            );
            finalData = fallback;
        }

        return NextResponse.json({ data: finalData }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' }
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
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300'
            }
        });
    }
}
