
declare module 'amadeus' {
    export default class Amadeus {
        constructor(config: { clientId: string; clientSecret: string; hostname?: string });
        referenceData: {
            locations: {
                get(params: any): Promise<any>;
                hotels: {
                    byCity: {
                        get(params: any): Promise<any>;
                    }
                }
            }
        };
        shopping: {
            hotelOffersSearch: {
                get(params: any): Promise<any>;
            }
        }
    }
}
