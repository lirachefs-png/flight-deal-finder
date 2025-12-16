import { NextResponse } from 'next/server';
import { duffel } from '@/lib/duffel';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { offer_id, passengers, services } = body;

        if (!offer_id || !passengers || passengers.length === 0) {
            return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        // Logic to link infants to adults
        const passengersPayload = passengers.map((p: any) => {
            const passengerData: any = {
                id: p.id,
                born_on: p.born_on,
                email: p.email,
                family_name: p.family_name,
                gender: p.gender,
                given_name: p.given_name,
                phone_number: p.phone_number || "+5511999999999",
                title: p.gender === 'm' ? 'mr' : 'ms',
                type: p.type
            };
            return passengerData;
        });

        // Loop to assign infants to adults
        const infants = passengersPayload.filter((p: any) => p.type === 'infant_without_seat');
        const adults = passengersPayload.filter((p: any) => p.type === 'adult');

        infants.forEach((infant: any, index: number) => {
            if (adults[index]) {
                adults[index].infant_passenger_id = infant.id;
            }
        });

        // Construct Duffel Payload
        const orderParams: any = {
            selected_offers: [offer_id],
            services: services || [],
            passengers: passengersPayload,
            type: 'hold',
        };

        const order = await duffel.orders.create(orderParams);

        // --- EMAIL TRIGGER START ---
        try {
            const bookingData = order.data;
            const mainPassenger = bookingData.passengers.find((p: any) => p.email);

            // Extract first segment details for email
            const firstSlice = bookingData.slices?.[0];
            const firstSegment = firstSlice?.segments?.[0];

            if (mainPassenger && mainPassenger.email) {
                // We don't await this to speed up the response to client
                // But in serverless logic, we might need to await or use background jobs. 
                // For Vercel basics, awaiting is safer to ensure execution before freeze.
                await import('@/lib/mailer').then(async ({ sendBookingEmail }) => {
                    await sendBookingEmail(mainPassenger.email, {
                        customerName: `${mainPassenger.given_name} ${mainPassenger.family_name}`,
                        bookingReference: bookingData.booking_reference || bookingData.id,
                        totalAmount: `${bookingData.total_amount} ${bookingData.total_currency}`,
                        flightDetails: [{
                            origin: firstSegment?.origin?.iata_code || 'N/A',
                            destination: firstSegment?.destination?.iata_code || 'N/A',
                            departingAt: firstSegment?.departing_at || 'Data a confirmar',
                            airline: firstSegment?.marketing_carrier?.name || 'Cia Aérea'
                        }]
                    });
                });
            }
        } catch (emailError) {
            console.error("Failed to send booking email:", emailError);
            // Don't fail the request if email fails
        }
        // --- EMAIL TRIGGER END ---

        return NextResponse.json({ data: order.data });

    } catch (error: any) {
        console.error("Duffel Order Error:", error);

        // Better error handling for API response
        const errorMessage = error.errors?.[0]?.message || error.message || "Falha ao criar reserva";

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
