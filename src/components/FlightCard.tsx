import React from 'react';
import { Plane, Clock, ArrowRight } from 'lucide-react';

interface FlightCardProps {
    destination: string;
    price: number;
    currency: string;
    airline: string;
    duration: string;
    origin?: string;
    date?: string;
    logoUrl?: string;
}

export function FlightCard({ destination, price, currency, airline, duration, origin, date, logoUrl }: FlightCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{destination}</h3>
                    {origin && <p className="text-sm text-zinc-500">From {origin}</p>}
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {currency} {price.toFixed(2)}
                    </span>
                    <p className="text-xs text-zinc-400">per adult</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                <div className="flex items-center gap-1">
                    {logoUrl ? <img src={logoUrl} alt={airline} className="w-5 h-5 object-contain" /> : <Plane className="w-4 h-4" />}
                    <span>{airline}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{duration.replace('PT', '').toLowerCase()}</span>
                </div>
            </div>

            <button className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                View Deal <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
