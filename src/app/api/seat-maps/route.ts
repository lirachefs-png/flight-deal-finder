import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const offer_id = searchParams.get('offer_id');

    if (!offer_id) {
        return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }

    try {
        const seatMaps = await duffel.seatMaps.get({ offer_id });
        return NextResponse.json({ data: seatMaps.data });
    } catch (error: any) {
        console.error("Duffel Seat Map Error:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao buscar mapa de assentos" },
            { status: 500 }
        );
    }
}
