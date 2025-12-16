'use client';

import React from 'react';

const AIRLINES = [
    { name: 'American Airlines', code: 'AA' },
    { name: 'British Airways', code: 'BA' },
    { name: 'Delta', code: 'DL' },
    { name: 'Emirates', code: 'EK' },
    { name: 'Lufthansa', code: 'LH' },
    { name: 'Air France', code: 'AF' },
    { name: 'TAP Air Portugal', code: 'TP' },
    { name: 'LATAM', code: 'LA' },
    { name: 'Azul', code: 'AD' },
    { name: 'United', code: 'UA' },
    { name: 'Qatar Airways', code: 'QR' },
    { name: 'KLM', code: 'KL' },
];

export default function AirlinePartners() {
    return (
        <section className="py-12 border-b border-zinc-100 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center mb-8">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                    Trusted by 700+ Airlines Worldwide
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                {/* Marquee Effect Container */}
                <div className="animate-marquee flex gap-12 md:gap-24 items-center whitespace-nowrap py-4 w-max">
                    {/* Render list twice for seamless loop */}
                    {[...AIRLINES, ...AIRLINES].map((airline, idx) => (
                        <div key={`${airline.code}-${idx}`} className="flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer">
                            <img
                                src={`https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${airline.code}.svg`}
                                alt={airline.name}
                                className="h-6 md:h-8 w-auto object-contain max-w-[120px]"
                                onError={(e) => {
                                    // Fallback if image fails
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
