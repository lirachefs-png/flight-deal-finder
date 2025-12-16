import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // We might not even need the offer_id if Duffel Links is a clean search session,
        // but we'll accept it in case we switch strategies later.

        const markupAmount = "50.00"; // Starting with a fixed markup
        const markupCurrency = "BRL";

        const payload = {
            data: {
                reference: "USER_SESSION_" + Date.now(),
                success_url: `${process.env.NEXT_PUBLIC_URL_PROD || 'https://flight-deal-finder-q5w6i0j4y-lirachefs-6918s-projects.vercel.app'}/booking/success?order_id={order_id}`,
                failure_url: `${process.env.NEXT_PUBLIC_URL_PROD || 'https://flight-deal-finder-q5w6i0j4y-lirachefs-6918s-projects.vercel.app'}/booking/failure`,
                abandonment_url: `${process.env.NEXT_PUBLIC_URL_PROD || 'https://flight-deal-finder-q5w6i0j4y-lirachefs-6918s-projects.vercel.app'}`,
                logo_url: "https://flight-deal-finder-q5w6i0j4y-lirachefs-6918s-projects.vercel.app/logo.png",
                primary_color: "#e11d48",
                traveller_currency: "BRL", // Force BRL for Brazilian users
                markup_amount: markupAmount,
                markup_currency: markupCurrency,
                markup_rate: "0.01",
                flights: {
                    enabled: true
                },
                stays: {
                    enabled: false
                }
            }
        };

        const response = await fetch("https://api.duffel.com/links/sessions", {
            method: "POST",
            headers: {
                "Accept-Encoding": "gzip",
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Duffel-Version": "v2",
                "Authorization": `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.errors) {
            console.error("Duffel Links Error:", data.errors);
            return NextResponse.json({ error: data.errors[0].message }, { status: 400 });
        }

        return NextResponse.json({ url: data.data.url });
    } catch (error) {
        console.error("Checkout API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
