'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Armchair } from 'lucide-react';
import { toast } from 'sonner';

interface SeatMapProps {
    offerId: string;
    selectedServices: any[];
    onSelectionChange: (services: any[]) => void;
    passengers: any[];
}

export default function SeatMap({ offerId, selectedServices, onSelectionChange, passengers }: SeatMapProps) {
    const [seatMaps, setSeatMaps] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track which seat designator is selected for which passenger
    // simplified: just a list of selected seat designators to highlight
    const selectedDesignators = selectedServices
        .filter(s => s.type === 'seat')
        .map(s => s.designator);

    useEffect(() => {
        const fetchSeats = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/seat-maps?offer_id=${offerId}`);
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                setSeatMaps(data.data || []);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (offerId) fetchSeats();
    }, [offerId]);

    const handleSeatClick = (element: any) => {
        if (element.unavailable) return;

        const designator = element.designator;
        const isSelected = selectedDesignators.includes(designator);

        if (isSelected) {
            // Deselect
            const newServices = selectedServices.filter(s => s.designator !== designator);
            onSelectionChange(newServices);
        } else {
            // Select
            // Find the service for the first passenger (or logic to choose passenger)
            // For MVP: grab the first available service in the list
            const service = element.available_services?.[0];

            if (!service) {
                toast.error("Assento indisponível para seleção");
                return;
            }

            const seatService = {
                id: service.id, // The service ID required by Duffel
                type: 'seat',
                designator: designator,
                total_amount: service.total_amount,
                currency: service.total_currency,
                passenger_id: service.passenger_id // This assigns it to a specific passenger
            };

            onSelectionChange([...selectedServices, seatService]);
        }
    };

    if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>;
    if (error) return null;
    if (seatMaps.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mt-6 text-center">
                <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                    <Armchair className="w-5 h-5 text-zinc-400" />
                    Mapa de Assentos
                </h3>
                <p className="text-zinc-500 text-sm">Não disponível para este voo.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mt-6 overflow-hidden">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Armchair className="w-5 h-5 text-rose-500" />
                Mapa de Assentos
            </h3>

            {seatMaps.map((map) => (
                <div key={map.id} className="mb-8 overflow-x-auto pb-4">
                    <h4 className="font-bold text-zinc-900 mb-2">{map.segment?.origin?.iata_code} → {map.segment?.destination?.iata_code}</h4>

                    {map.cabins?.map((cabin: any, idx: number) => (
                        <div key={idx} className="min-w-[300px] flex flex-col items-center">
                            <h5 className="font-bold text-center mb-4 text-zinc-500 uppercase text-xs tracking-wider">{cabin.name || 'Cabin'} Class</h5>

                            <div className="flex flex-col gap-2">
                                {cabin.rows?.map((row: any, rIdx: number) => (
                                    <div key={rIdx} className="flex gap-2 justify-center">
                                        {row.sections?.map((section: any, sIdx: number) => (
                                            <div key={sIdx} className="flex gap-1">
                                                {section.elements?.map((el: any, eIdx: number) => {
                                                    if (el.type === 'seat') {
                                                        const isAvailable = !el.unavailable;
                                                        const isSelected = selectedDesignators.includes(el.designator);

                                                        // Get price if available
                                                        const service = el.available_services?.[0];
                                                        const price = service ? Number(service.total_amount) : 0;

                                                        return (
                                                            <div
                                                                key={eIdx}
                                                                onClick={() => handleSeatClick(el)}
                                                                title={`${el.designator} - ${price > 0 ? (service?.total_currency || '') + ' ' + price : 'Grátis'}`}
                                                                className={`
                                                                    w-8 h-10 rounded-t-lg border-b-2 flex flex-col items-center justify-center transition-all bg-opacity-90 relative group
                                                                    ${isSelected
                                                                        ? 'bg-rose-500 border-rose-700 text-white shadow-md transform -translate-y-1'
                                                                        : isAvailable
                                                                            ? 'bg-white border-zinc-200 hover:bg-rose-50 hover:border-rose-300 cursor-pointer text-zinc-600'
                                                                            : 'bg-zinc-100 border-zinc-200 opacity-40 cursor-not-allowed text-zinc-300'
                                                                    }
                                                                `}
                                                            >
                                                                <span className="text-[10px] font-bold">{el.designator}</span>
                                                                {isAvailable && price > 0 && (
                                                                    <span className="text-[8px] opacity-0 group-hover:opacity-100 absolute -bottom-4 bg-black text-white px-1 rounded z-10 whitespace-nowrap">
                                                                        {price.toFixed(0)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    } else if (el.type === 'empty') {
                                                        return <div key={eIdx} className="w-8 h-10" />; // Aisle or gap
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="flex gap-4 justify-center mt-6 text-xs text-zinc-500">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-zinc-200 rounded"></div> Livre</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-500 rounded"></div> Selecionado</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-zinc-100 border border-zinc-200 opacity-40 rounded"></div> Ocupado</div>
            </div>
        </div>
    );
}
