import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Missing offer ID' }, { status: 400 });
    }

    try {
        const offer = await duffel.offers.get(id);
        return NextResponse.json({ data: offer.data });
    } catch (error) {
        console.error("Duffel Get Offer Error:", error);
        return NextResponse.json(
            { error: 'Failed to retrieve flight details' },
            { status: 500 }
        );
    }
}
