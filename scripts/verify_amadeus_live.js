
const Amadeus = require('amadeus');
// Hardcoded keys for test script to match lib/amadeus.ts fallback
const amadeus = new Amadeus({
    clientId: "uGkkDXy68Th7HtjNzDT7f8CUd72oAgHn",
    clientSecret: "jrlGMcfDV0DuxX9V"
});

async function verifyAmadeus() {
    console.log("🏨 Testing Amadeus Live Connection (Fixed Flow)...");
    try {
        // 1. Get Hotels in City
        console.log("STEP 1: Getting Hotels in PAR...");
        const hotels = await amadeus.referenceData.locations.hotels.byCity.get({
            cityCode: 'PAR'
        });

        if (!hotels.data || hotels.data.length === 0) {
            console.log("❌ No hotels found in city.");
            return;
        }

        console.log(`✅ Found ${hotels.data.length} hotels in PAR.`);

        // Take first 3 hotel IDs
        const hotelIds = hotels.data.slice(0, 3).map(h => h.hotelId);
        console.log("Testing IDs:", hotelIds);

        // 2. Get Offers for these Hotels
        console.log("STEP 2: Getting Offers for IDs...");
        const offers = await amadeus.shopping.hotelOffersSearch.get({
            hotelIds: hotelIds.join(','),
            adults: 1
        });

        console.log(`✅ SUCCESS! Found ${offers.data.length} offers.`);
        if (offers.data.length > 0) {
            console.log("Sample Hotel:", offers.data[0].hotel.name);
            console.log("Price:", offers.data[0].offers[0].price.total);
        } else {
            console.log("⚠️ No offers found for these specific hotels (they might be booked/closed).");
        }

    } catch (error) {
        console.log("❌ ERROR:");
        if (error.response) {
            console.log(JSON.stringify(error.response.result, null, 2));
        } else {
            console.log(error);
        }
    }
}

verifyAmadeus();
