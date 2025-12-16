import { NextResponse } from 'next/server';

// KIWI API (TEQUILA) CONFIGURATION
// Waiting for valid API KEY from user
const KIWI_API_KEY = process.env.KIWI_API_KEY || "";
const BASE_URL = "https://api.tequila.kiwi.com";

// LOCATIONS API
export async function searchLocationsKiwi(keyword: string) {
    if (!KIWI_API_KEY) {
        console.warn("DEBUG: Missing KIWI_API_KEY");
        return { locations: [] }; // Safe fallback
    }

    const url = new URL(`${BASE_URL}/locations/query`);
    url.searchParams.append('term', keyword);
    url.searchParams.append('locale', 'en-US'); // or pt-BR
    url.searchParams.append('location_types', 'airport');
    url.searchParams.append('location_types', 'city');
    url.searchParams.append('limit', '5');
    url.searchParams.append('active_only', 'true');

    try {
        const res = await fetch(url.toString(), {
            headers: {
                'apikey': KIWI_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error(`Kiwi API Error: ${res.status} ${txt}`);
            return { locations: [] };
        }

        const data = await res.json();
        return data; // Kiwi returns { locations: [...] }
    } catch (error) {
        console.error("Kiwi Fetch Error:", error);
        return { locations: [] };
    }
}

// FLIGHT SEARCH API (Not yet fully implemented, placehoder)
export async function searchFlightsKiwi(params: any) {
    // Implementation pending...
}
