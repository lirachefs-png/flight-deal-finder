
import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const offer_id = searchParams.get('offer_id');

    if (!offer_id) {
        return NextResponse.json({ error: 'Offer ID required' }, { status: 400 });
    }

    try {
        console.log(`Fetching services for offer: ${offer_id}`);
        // Duffel offers.get with return_available_services: true
        const offer = await duffel.offers.get(offer_id, {
            return_available_services: true
        });

        const services = offer.data.available_services || [];

        // Filter for baggage services usually type: 'baggage'
        // But let's return all and filter in frontend or here if specific

        return NextResponse.json({
            services: services,
            // also return passengers to help mapping
            passengers: offer.data.passengers
        });

    } catch (error: any) {
        console.error("Duffel Services Error:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao buscar serviços" },
            { status: 500 }
        );
    }
}
