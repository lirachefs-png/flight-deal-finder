import { Duffel } from '@duffel/api';

const DUFFEL_ACCESS_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;

export const duffel = new Duffel({
    token: DUFFEL_ACCESS_TOKEN!,
    debug: { verbose: true } // Helpful for debugging
});

export const searchPlacesDuffel = async (query: string) => {
    try {
        const response = await (duffel as any).suggestions.list({
            query: query,
            limit: 5
        });
        return response.data;
    } catch (error) {
        console.error("Duffel Places Error:", error);
        return [];
    }
};
