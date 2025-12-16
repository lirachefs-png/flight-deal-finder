
import Amadeus from 'amadeus';

// Initializing Amadeus Client
// Storing keys here for robustness if ENV fails, but ENV is preferred.
const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID || "uGkkDXy68Th7HtjNzDT7f8CUd72oAgHn",
    clientSecret: process.env.AMADEUS_CLIENT_SECRET || "jrlGMcfDV0DuxX9V",
});

export default amadeus;
