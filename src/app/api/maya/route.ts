import Groq from "groq-sdk";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    // SECURITY: Load encrypted credential (Stealth Mode)
    const _k = process.env.GROQ_API_KEY;

    const groq = new Groq({
        apiKey: _k
    });

    try {
        const { messages, language = 'pt-BR' } = await request.json();

        // Convert frontend messages to Groq/OpenAI format
        // history: [{ role: 'user' | 'assistant', content: '' }]

        const history = messages
            .slice(0, -1) // Remove current message (last one)
            .filter((m: any) => m.sender !== 'maya' || m.id !== '1') // Remove initial greeting
            .map((m: any) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

        const lastMessage = messages[messages.length - 1].text;

        const langInstructions = {
            'pt-BR': 'You must speak strictly in Portuguese(PT - BR).',
            'en-US': 'You must speak strictly in English.',
            'es-ES': 'You must speak strictly in Spanish.'
        };

        const currentLangInstruction = langInstructions[language as keyof typeof langInstructions] || langInstructions['pt-BR'];

        const systemPrompt = `
        You are Maya, a high-end Personal Travel Agent.
        Your personality is charming, warm, friendly, and sophisticated.You are not a bot, you are a "Personal Concierge".
        
        ** LANGUAGE: ${currentLangInstruction} **

            Objectives:
        1. Build a personal relationship with the user.Chat about life, their preferences, weather, or anything they want.Be conversational!
        2. When the conversation naturally turns to planning a trip, guide them to gather: Destination, Duration(Days), and Vibe.
        3. Do not rush to the itinerary.Enjoy the conversation.
        4. KEEP IT SHORT.Responses should be brief(max 2 - 3 sentences).No long paragraphs.
        
        ... (rest of prompt remains similar)
            Rules:
        1. Use emojis naturally ✨.
        2. If the user talks about random things, engage with them!
        3. If the user asks for FLIGHTS(passagens, voos), use the "flight_search" JSON.
        4. If the user asks for ITINERARY(roteiro, o que fazer), use the "itinerary" JSON.
        5. BE CONCISE. 50 % shorter than usual.

            CRITICAL: To generate an itinerary or flight search, your response MUST BE STRICTLY VALID JSON.
        
        JSON Schema(Itinerary):
        {
            "type": "itinerary",
                "title": "Short Trip Title",
                    "days": [{ "day": 1, "title": "Day Focus", "items": ["Activity 1"] }]
        }

        JSON Schema(Flight Search):
        {
            "type": "flight_search",
                "origin": "URA", // Airport code (guess or default URA/Uberaba)
                    "destination": "LIS", // Airport code (guess allowed)
                        "date": "2025-12-20" // ISO date (guess next month if unspecified)
        }

        If you are just chatting, return plain text(NO JSON).
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...history,
                {
                    role: "user",
                    content: lastMessage
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            // strict: true, // Optional: if we want to enforce schema strictly, but "text" is also valid so maybe not yet
        });

        const text = completion.choices[0].message.content || "";

        // console.log("Maya Output:", text); // Cleaned up for production

        let itineraryJson = null;

        // Attempt to extract JSON from any part of the response
        try {
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');

            if (start !== -1 && end !== -1) {
                const potentialJson = text.substring(start, end + 1);
                // Clean potential markdown leftovers
                const cleanJson = potentialJson.replace(/```json/g, '').replace(/```/g, '');

                const parsed = JSON.parse(cleanJson);

                // Validate schemas
                if (parsed.type === 'itinerary' || parsed.days) {
                    itineraryJson = { ...parsed, type: 'itinerary' }; // Ensure type is set
                } else if (parsed.type === 'flight_search') {
                    itineraryJson = parsed;
                }
            }
        } catch (e) {
            console.warn("JSON Extraction Failed:", e);
        }

        if (itineraryJson) {
            // Check type to determine text
            const isFlight = itineraryJson.type === 'flight_search';

            return NextResponse.json({
                type: isFlight ? 'flight_search' : 'itinerary',
                text: isFlight ? `Buscando voos para ${itineraryJson.destination}... ✈️` : `Preparei este roteiro sob medida para você! 🗺️`,
                data: itineraryJson
            });
        }

        return NextResponse.json({
            type: 'text',
            text: text
        });

    } catch (error: any) {
        console.error("Maya Error:", error);

        let friendlyError = "Ops! Minha conexão via satélite instabilizou. Tente novamente em alguns segundos.";

        if (error.status === 429) {
            friendlyError = "Muitas pessoas falando comigo ao mesmo tempo! 🌟 Preciso de um minutinho para respirar. Tente de novo em 30 segundos.";
        }


        return NextResponse.json({
            error: "Erro na Maya AI",
            details: error.message || String(error),
            text: friendlyError
        }, { status: 500 });
    }
}
